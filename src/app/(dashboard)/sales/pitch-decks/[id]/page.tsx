"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Type,
  Image as ImageIcon,
  List,
  Loader2
} from "lucide-react";
import Link from "next/link";
import PitchDeckEditor from "@/components/sales/PitchDeckEditor";

interface PitchDeck {
  id: number;
  prospect_id: number;
  title: string;
  description: string;
  template_name: string;
  slides: any[];
  version: number;
  prospect?: {
    company_name: string;
  };
  created_at: string;
  updated_at: string;
}

export default function PitchDeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    fetchPitchDeck();
  }, [id]);

  const fetchPitchDeck = async () => {
    try {
      const response = await fetch(`/api/sales/pitch-decks/${id}`);
      if (!response.ok) throw new Error("Failed to fetch pitch deck");
      const data = await response.json();
      setDeck(data);
    } catch (error) {
      console.error("Error fetching pitch deck:", error);
      alert("Erreur lors du chargement du pitch deck");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!deck) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/sales/pitch-decks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: deck.slides,
          title: deck.title,
          description: deck.description,
        }),
      });

      if (!response.ok) throw new Error("Failed to save pitch deck");
      alert("Pitch deck enregistré avec succès");
    } catch (error) {
      console.error("Error saving pitch deck:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleSlideUpdate = (slideIndex: number, updatedSlide: any) => {
    if (!deck) return;
    
    const newSlides = [...deck.slides];
    newSlides[slideIndex] = updatedSlide;
    setDeck({ ...deck, slides: newSlides });
  };

  const handleAddSlide = () => {
    if (!deck) return;
    
    const newSlide = {
      id: deck.slides.length + 1,
      title: `Slide ${deck.slides.length + 1}`,
      content: {
        type: "empty",
        elements: []
      },
      order: deck.slides.length + 1,
    };
    
    setDeck({ ...deck, slides: [...deck.slides, newSlide] });
    setCurrentSlideIndex(deck.slides.length);
  };

  const handleDeleteSlide = (slideIndex: number) => {
    if (!deck || deck.slides.length <= 1) {
      alert("Vous devez avoir au moins une slide");
      return;
    }
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette slide ?")) return;
    
    const newSlides = deck.slides.filter((_, idx) => idx !== slideIndex);
    setDeck({ ...deck, slides: newSlides });
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  const handleExportPDF = async () => {
    alert("Export PDF en cours de développement...");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pitch deck non trouvé</h2>
          <Link href="/sales/pitch-decks" className="text-blue-600 hover:underline">
            Retour aux pitch decks
          </Link>
        </div>
      </div>
    );
  }

  const currentSlide = deck.slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/sales/pitch-decks"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{deck.title}</h1>
                <p className="text-sm text-slate-400">
                  {deck.prospect?.company_name} • {deck.slides.length} slides
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("edit")}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    viewMode === "edit"
                      ? "bg-brand-orange text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    viewMode === "preview"
                      ? "bg-brand-orange text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Slides Sidebar */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={handleAddSlide}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="h-4 w-4" />
              Nouvelle slide
            </button>

            <div className="space-y-2">
              {deck.slides.map((slide, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                    currentSlideIndex === index
                      ? "border-brand-orange bg-slate-800/50"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  }`}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-400">
                        Slide {index + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-sm text-white font-medium truncate">
                      {slide.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 overflow-auto">
          {currentSlide && (
            <PitchDeckEditor
              slide={currentSlide}
              slideIndex={currentSlideIndex}
              onUpdate={handleSlideUpdate}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-64 right-0 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>

            <span className="text-sm text-slate-400">
              Slide {currentSlideIndex + 1} / {deck.slides.length}
            </span>

            <button
              onClick={() =>
                setCurrentSlideIndex(Math.min(deck.slides.length - 1, currentSlideIndex + 1))
              }
              disabled={currentSlideIndex === deck.slides.length - 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
