"use client";

import { useState } from "react";
import {
  Type,
  Image as ImageIcon,
  BarChart3,
  PieChart,
  LineChart,
  List,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  Minus,
  Tag,
  AlertCircle,
  Columns,
  Upload,
  GitCompare,
  Clock,
  Workflow,
  Grid3x3,
  TrendingUp,
  ArrowRight,
  Circle,
  Square,
  Target,
  Quote,
  Star,
  User,
  Award,
  Heart,
  Sparkles,
  CheckCircle,
  Video,
  Play,
} from "lucide-react";
import SlideRenderer from "./SlideRenderer";

interface PitchDeckEditorProps {
  slide: any;
  slideIndex: number;
  onUpdate: (slideIndex: number, updatedSlide: any) => void;
  viewMode: "edit" | "preview";
}

export default function PitchDeckEditor({
  slide,
  slideIndex,
  onUpdate,
  viewMode,
}: PitchDeckEditorProps) {
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  const handleTitleChange = (newTitle: string) => {
    onUpdate(slideIndex, { ...slide, title: newTitle });
  };

  const handleAddElement = (type: string) => {
    const newElement = {
      id: Date.now(),
      type,
      ...getDefaultElementData(type),
    };

    const currentElements = slide.content?.elements || [];
    
    const updatedSlide = {
      ...slide,
      content: {
        ...slide.content,
        type: slide.content?.type || "mixed",
        elements: [...currentElements, newElement],
      },
    };

    onUpdate(slideIndex, updatedSlide);
  };

  const handleUpdateElement = (elementId: number, updates: any) => {
    const currentElements = slide.content?.elements || [];
    const updatedElements = currentElements.map((el: any) =>
      el.id === elementId ? { ...el, ...updates } : el
    );

    onUpdate(slideIndex, {
      ...slide,
      content: { 
        ...slide.content, 
        type: slide.content?.type || "mixed",
        elements: updatedElements 
      },
    });
  };

  const handleDeleteElement = (elementId: number) => {
    const currentElements = slide.content?.elements || [];
    const updatedElements = currentElements.filter(
      (el: any) => el.id !== elementId
    );

    onUpdate(slideIndex, {
      ...slide,
      content: { 
        ...slide.content, 
        type: slide.content?.type || "mixed",
        elements: updatedElements 
      },
    });
    setSelectedElement(null);
  };

  const getDefaultElementData = (type: string) => {
    switch (type) {
      case "text":
        return {
          text: "Nouveau texte",
          fontSize: "text-lg",
          fontWeight: "normal",
          color: "text-white",
          align: "left",
        };
      case "heading":
        return {
          text: "Nouveau titre",
          level: "h2",
          color: "text-white",
          align: "center",
        };
      case "image":
        return {
          url: "",
          alt: "Image",
          width: "w-full",
          height: "h-64",
        };
      case "list":
        return {
          items: ["Item 1", "Item 2", "Item 3"],
          style: "bullet",
          color: "text-white",
        };
      case "barChart":
        return {
          data: [
            { name: "Jan", value: 400 },
            { name: "Fév", value: 300 },
            { name: "Mar", value: 600 },
            { name: "Avr", value: 800 },
            { name: "Mai", value: 500 },
          ],
          dataKey: "value",
          color: "#f97316",
          title: "Graphique en barres",
        };
      case "lineChart":
        return {
          data: [
            { name: "Jan", value: 400 },
            { name: "Fév", value: 300 },
            { name: "Mar", value: 600 },
            { name: "Avr", value: 800 },
            { name: "Mai", value: 500 },
          ],
          dataKey: "value",
          color: "#3b82f6",
          title: "Graphique linéaire",
        };
      case "pieChart":
        return {
          data: [
            { name: "A", value: 400 },
            { name: "B", value: 300 },
            { name: "C", value: 300 },
            { name: "D", value: 200 },
          ],
          title: "Graphique circulaire",
        };
      case "separator":
        return {
          style: "solid",
          color: "border-brand-orange",
          thickness: "border-2",
        };
      case "badge":
        return {
          text: "Badge",
          color: "bg-brand-orange",
          textColor: "text-white",
        };
      case "callout":
        return {
          text: "Information importante",
          type: "info",
          icon: "AlertCircle",
        };
      case "columns":
        return {
          columnCount: 2,
          columns: [
            { content: "Colonne 1" },
            { content: "Colonne 2" },
          ],
        };
      case "timeline":
        return {
          items: [
            { date: "2024 Q1", title: "Phase 1", description: "Lancement" },
            { date: "2024 Q2", title: "Phase 2", description: "Développement" },
            { date: "2024 Q3", title: "Phase 3", description: "Déploiement" },
          ],
          orientation: "horizontal",
        };
      case "process":
        return {
          steps: [
            { number: 1, title: "Étape 1", description: "Analyse" },
            { number: 2, title: "Étape 2", description: "Conception" },
            { number: 3, title: "Étape 3", description: "Réalisation" },
          ],
        };
      case "comparison":
        return {
          title: "Comparaison",
          items: [
            { label: "Option A", features: ["Feature 1", "Feature 2", "Feature 3"] },
            { label: "Option B", features: ["Feature 1", "Feature 2", "Feature 4"] },
          ],
        };
      case "featureGrid":
        return {
          features: [
            { icon: "Target", title: "Précision", description: "Résultats ciblés" },
            { icon: "TrendingUp", title: "Croissance", description: "Performance accrue" },
            { icon: "Workflow", title: "Automatisation", description: "Gain de temps" },
            { icon: "Target", title: "Objectifs", description: "Atteinte des KPIs" },
          ],
        };
      case "metricCard":
        return {
          value: "150%",
          label: "Croissance",
          trend: "up",
          color: "text-brand-orange",
        };
      case "arrow":
        return {
          direction: "right",
          label: "",
          color: "text-brand-orange",
        };
      case "shape":
        return {
          type: "rectangle",
          text: "Texte",
          color: "bg-brand-orange",
          textColor: "text-white",
        };
      case "quote":
        return {
          text: "Une citation inspirante qui capture l'essence de votre message.",
          author: "Nom de l'auteur",
          role: "Fonction",
          style: "modern",
        };
      case "testimonial":
        return {
          text: "Ce service a transformé notre façon de travailler. Résultats exceptionnels !",
          author: "Jean Dupont",
          company: "Entreprise XYZ",
          rating: 5,
          photo: "",
        };
      case "teamCard":
        return {
          name: "Marie Durand",
          role: "CEO & Fondatrice",
          bio: "Experte en marketing digital avec 10+ ans d'expérience",
          photo: "",
          linkedin: "",
        };
      case "statCounter":
        return {
          stats: [
            { value: "500+", label: "Clients satisfaits", icon: "Users" },
            { value: "95%", label: "Taux de satisfaction", icon: "Heart" },
            { value: "10M+", label: "Vues générées", icon: "TrendingUp" },
          ],
        };
      case "iconList":
        return {
          items: [
            { icon: "Check", text: "Première caractéristique importante", color: "text-green-400" },
            { icon: "Check", text: "Deuxième avantage clé", color: "text-green-400" },
            { icon: "Check", text: "Troisième point fort", color: "text-green-400" },
          ],
        };
      case "progressBar":
        return {
          bars: [
            { label: "Compétence 1", value: 90, color: "bg-brand-orange" },
            { label: "Compétence 2", value: 75, color: "bg-blue-500" },
            { label: "Compétence 3", value: 85, color: "bg-green-500" },
          ],
        };
      case "logoGrid":
        return {
          title: "Ils nous font confiance",
          logos: [
            { name: "Client 1", url: "" },
            { name: "Client 2", url: "" },
            { name: "Client 3", url: "" },
            { name: "Client 4", url: "" },
          ],
        };
      case "videoPortfolio":
        return {
          title: "Nos Réalisations",
          layout: "grid",
          columns: 2,
          videos: [
            {
              videoId: "1135383362",
              title: "Vidéo présentative Boca Food&Juice",
              description: "Boca Food & Juices à Neuchâtel",
              badge: "Restauration",
            },
            {
              videoId: "1135380601",
              title: "Sakura Sushi",
              description: "Restaurant japonais moderne",
              badge: "Food",
            },
          ],
        };
      default:
        return {};
    }
  };

  if (viewMode === "preview") {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-full max-w-6xl">
          {/* Slide Preview Container - Aspect Ratio 16:9 */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-12 overflow-auto">
              {/* Slide Title in Preview */}
              <h1 className="text-4xl font-bold text-white mb-8 text-center">
                {slide.title}
              </h1>
              
              {/* Slide Content */}
              <SlideRenderer slide={slide} />
            </div>
          </div>
          
          {/* Preview Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Mode Prévisualisation - Aspect ratio 16:9
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Canvas Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Slide Title */}
          <div className="mb-6">
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-brand-orange"
              placeholder="Titre de la slide"
            />
          </div>

          {/* Slide Content */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8 min-h-[500px]">
            <SlideRenderer
              slide={slide}
              isEditing={true}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
            />
          </div>

          {/* Add Element Toolbar */}
          <div className="mt-6 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">
              Ajouter un élément
            </h3>
            
            {/* Texte & Contenu */}
            <div className="mb-4">
              <h4 className="text-xs text-slate-400 mb-2 uppercase">Texte & Contenu</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                <button
                  onClick={() => handleAddElement("heading")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Type className="h-5 w-5 text-blue-400" />
                  <span className="text-xs text-white">Titre</span>
                </button>
                <button
                  onClick={() => handleAddElement("text")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Type className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-white">Texte</span>
                </button>
                <button
                  onClick={() => handleAddElement("list")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <List className="h-5 w-5 text-green-400" />
                  <span className="text-xs text-white">Liste</span>
                </button>
                <button
                  onClick={() => handleAddElement("image")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ImageIcon className="h-5 w-5 text-purple-400" />
                  <span className="text-xs text-white">Image</span>
                </button>
              </div>
            </div>

            {/* Graphiques */}
            <div className="mb-4">
              <h4 className="text-xs text-slate-400 mb-2 uppercase">Graphiques</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                <button
                  onClick={() => handleAddElement("barChart")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                  <span className="text-xs text-white">Barres</span>
                </button>
                <button
                  onClick={() => handleAddElement("lineChart")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LineChart className="h-5 w-5 text-blue-400" />
                  <span className="text-xs text-white">Courbe</span>
                </button>
                <button
                  onClick={() => handleAddElement("pieChart")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <PieChart className="h-5 w-5 text-purple-400" />
                  <span className="text-xs text-white">Camembert</span>
                </button>
              </div>
            </div>

            {/* Schémas & Diagrammes */}
            <div className="mb-4">
              <h4 className="text-xs text-slate-400 mb-2 uppercase">Schémas & Diagrammes</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                <button
                  onClick={() => handleAddElement("timeline")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-xs text-white">Timeline</span>
                </button>
                <button
                  onClick={() => handleAddElement("process")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Workflow className="h-5 w-5 text-green-400" />
                  <span className="text-xs text-white">Process</span>
                </button>
                <button
                  onClick={() => handleAddElement("comparison")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <GitCompare className="h-5 w-5 text-purple-400" />
                  <span className="text-xs text-white">Comparaison</span>
                </button>
                <button
                  onClick={() => handleAddElement("featureGrid")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Grid3x3 className="h-5 w-5 text-cyan-400" />
                  <span className="text-xs text-white">Grille</span>
                </button>
                <button
                  onClick={() => handleAddElement("metricCard")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <TrendingUp className="h-5 w-5 text-brand-orange" />
                  <span className="text-xs text-white">Métrique</span>
                </button>
              </div>
            </div>

            {/* Formes & Éléments */}
            <div className="mb-4">
              <h4 className="text-xs text-slate-400 mb-2 uppercase">Formes & Éléments</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                <button
                  onClick={() => handleAddElement("arrow")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ArrowRight className="h-5 w-5 text-brand-orange" />
                  <span className="text-xs text-white">Flèche</span>
                </button>
                <button
                  onClick={() => handleAddElement("shape")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Square className="h-5 w-5 text-pink-400" />
                  <span className="text-xs text-white">Forme</span>
                </button>
              </div>
            </div>

            {/* Éléments Créatifs */}
            <div className="mb-4">
              <h4 className="text-xs text-slate-400 mb-2 uppercase">Éléments Créatifs</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                <button
                  onClick={() => handleAddElement("quote")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Quote className="h-5 w-5 text-yellow-400" />
                  <span className="text-xs text-white">Citation</span>
                </button>
                <button
                  onClick={() => handleAddElement("testimonial")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-xs text-white">Témoignage</span>
                </button>
                <button
                  onClick={() => handleAddElement("teamCard")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5 text-blue-400" />
                  <span className="text-xs text-white">Équipe</span>
                </button>
                <button
                  onClick={() => handleAddElement("statCounter")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Award className="h-5 w-5 text-purple-400" />
                  <span className="text-xs text-white">Stats</span>
                </button>
                <button
                  onClick={() => handleAddElement("iconList")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-xs text-white">Liste+Icône</span>
                </button>
                <button
                  onClick={() => handleAddElement("progressBar")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  <span className="text-xs text-white">Barres</span>
                </button>
                <button
                  onClick={() => handleAddElement("logoGrid")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Grid3x3 className="h-5 w-5 text-slate-400" />
                  <span className="text-xs text-white">Logos</span>
                </button>
                <button
                  onClick={() => handleAddElement("videoPortfolio")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Video className="h-5 w-5 text-red-400" />
                  <span className="text-xs text-white">Portfolio</span>
                </button>
              </div>
            </div>

            {/* Mise en page */}
            <div>
              <h4 className="text-xs text-slate-400 mb-2 uppercase">Mise en page</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                <button
                  onClick={() => handleAddElement("separator")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Minus className="h-5 w-5 text-slate-400" />
                  <span className="text-xs text-white">Séparateur</span>
                </button>
                <button
                  onClick={() => handleAddElement("badge")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Tag className="h-5 w-5 text-brand-orange" />
                  <span className="text-xs text-white">Badge</span>
                </button>
                <button
                  onClick={() => handleAddElement("callout")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="text-xs text-white">Callout</span>
                </button>
                <button
                  onClick={() => handleAddElement("columns")}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Columns className="h-5 w-5 text-cyan-400" />
                  <span className="text-xs text-white">Colonnes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElement !== null && slide.content?.elements?.[selectedElement] && (
        <div className="w-80 border-l border-slate-800 bg-slate-900/30 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Propriétés</h3>
            <button
              onClick={() => {
                const element = slide.content?.elements?.[selectedElement];
                if (element?.id) {
                  handleDeleteElement(element.id);
                }
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <ElementProperties
            element={slide.content.elements[selectedElement]}
            onUpdate={(updates) =>
              handleUpdateElement(
                slide.content.elements[selectedElement].id,
                updates
              )
            }
          />
        </div>
      )}
    </div>
  );
}

interface ElementPropertiesProps {
  element: any;
  onUpdate: (updates: any) => void;
}

function ElementProperties({ element, onUpdate }: ElementPropertiesProps) {
  if (element.type === "image") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            URL de l'image
          </label>
          <input
            type="text"
            value={element.url || ""}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://exemple.com/image.jpg ou coller une image"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Ou uploader une image
          </label>
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-brand-orange transition-colors cursor-pointer"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    onUpdate({ url: e.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Cliquer pour uploader</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Largeur
          </label>
          <select
            value={element.width || "w-full"}
            onChange={(e) => onUpdate({ width: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="w-1/4">25%</option>
            <option value="w-1/2">50%</option>
            <option value="w-3/4">75%</option>
            <option value="w-full">100%</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Bordure arrondie
          </label>
          <select
            value={element.rounded || "rounded-lg"}
            onChange={(e) => onUpdate({ rounded: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="rounded-none">Aucune</option>
            <option value="rounded-lg">Normale</option>
            <option value="rounded-xl">Grande</option>
            <option value="rounded-full">Cercle</option>
          </select>
        </div>
      </div>
    );
  }

  if (element.type === "separator") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Style
          </label>
          <select
            value={element.style}
            onChange={(e) => onUpdate({ style: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="solid">Solide</option>
            <option value="dashed">Tirets</option>
            <option value="dotted">Points</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Couleur
          </label>
          <select
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="border-brand-orange">Orange (Urstory)</option>
            <option value="border-slate-600">Gris</option>
            <option value="border-white">Blanc</option>
          </select>
        </div>
      </div>
    );
  }

  if (element.type === "badge") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Texte
          </label>
          <input
            type="text"
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Couleur
          </label>
          <select
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="bg-brand-orange">Orange (Urstory)</option>
            <option value="bg-blue-600">Bleu</option>
            <option value="bg-green-600">Vert</option>
            <option value="bg-purple-600">Violet</option>
            <option value="bg-red-600">Rouge</option>
          </select>
        </div>
      </div>
    );
  }

  if (element.type === "callout") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Texte
          </label>
          <textarea
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Type
          </label>
          <select
            value={element.type}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="info">Information</option>
            <option value="success">Succès</option>
            <option value="warning">Attention</option>
            <option value="error">Erreur</option>
          </select>
        </div>
      </div>
    );
  }

  if (element.type === "columns") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Nombre de colonnes
          </label>
          <select
            value={element.columnCount}
            onChange={(e) => {
              const count = parseInt(e.target.value);
              const newColumns = Array(count).fill(null).map((_, i) => 
                element.columns?.[i] || { content: `Colonne ${i + 1}` }
              );
              onUpdate({ columnCount: count, columns: newColumns });
            }}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="2">2 colonnes</option>
            <option value="3">3 colonnes</option>
            <option value="4">4 colonnes</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Contenu des colonnes
          </label>
          {element.columns?.map((col: any, index: number) => (
            <textarea
              key={index}
              value={col.content}
              onChange={(e) => {
                const newColumns = [...element.columns];
                newColumns[index] = { content: e.target.value };
                onUpdate({ columns: newColumns });
              }}
              placeholder={`Colonne ${index + 1}`}
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange mb-2"
            />
          ))}
        </div>
      </div>
    );
  }

  if (element.type === "text" || element.type === "heading") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Texte
          </label>
          <textarea
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Alignement
          </label>
          <select
            value={element.align}
            onChange={(e) => onUpdate({ align: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>

        {element.type === "text" && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Taille
            </label>
            <select
              value={element.fontSize}
              onChange={(e) => onUpdate({ fontSize: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            >
              <option value="text-sm">Petit</option>
              <option value="text-base">Normal</option>
              <option value="text-lg">Grand</option>
              <option value="text-xl">Très grand</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  if (element.type === "list") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Items
          </label>
          {element.items.map((item: string, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...element.items];
                  newItems[index] = e.target.value;
                  onUpdate({ items: newItems });
                }}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
              <button
                onClick={() => {
                  const newItems = element.items.filter(
                    (_: any, i: number) => i !== index
                  );
                  onUpdate({ items: newItems });
                }}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              onUpdate({ items: [...element.items, "Nouvel item"] })
            }
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un item
          </button>
        </div>
      </div>
    );
  }

  if (element.type === "timeline") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Orientation
          </label>
          <select
            value={element.orientation}
            onChange={(e) => onUpdate({ orientation: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Événements
          </label>
          {element.items?.map((item: any, index: number) => (
            <div key={index} className="space-y-2 mb-4 p-3 bg-slate-700/30 rounded-lg">
              <input
                type="text"
                value={item.date}
                onChange={(e) => {
                  const newItems = [...element.items];
                  newItems[index].date = e.target.value;
                  onUpdate({ items: newItems });
                }}
                placeholder="Date"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => {
                  const newItems = [...element.items];
                  newItems[index].title = e.target.value;
                  onUpdate({ items: newItems });
                }}
                placeholder="Titre"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
              <textarea
                value={item.description}
                onChange={(e) => {
                  const newItems = [...element.items];
                  newItems[index].description = e.target.value;
                  onUpdate({ items: newItems });
                }}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
            </div>
          ))}
          <button
            onClick={() =>
              onUpdate({ items: [...element.items, { date: "2024", title: "Nouveau", description: "" }] })
            }
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un événement
          </button>
        </div>
      </div>
    );
  }

  if (element.type === "process") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Étapes
          </label>
          {element.steps?.map((step: any, index: number) => (
            <div key={index} className="space-y-2 mb-3 p-3 bg-slate-700/30 rounded-lg">
              <input
                type="text"
                value={step.title}
                onChange={(e) => {
                  const newSteps = [...element.steps];
                  newSteps[index].title = e.target.value;
                  onUpdate({ steps: newSteps });
                }}
                placeholder="Titre"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
              <input
                type="text"
                value={step.description}
                onChange={(e) => {
                  const newSteps = [...element.steps];
                  newSteps[index].description = e.target.value;
                  onUpdate({ steps: newSteps });
                }}
                placeholder="Description"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (element.type === "metricCard") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Valeur
          </label>
          <input
            type="text"
            value={element.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="150%"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Label
          </label>
          <input
            type="text"
            value={element.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Tendance
          </label>
          <select
            value={element.trend}
            onChange={(e) => onUpdate({ trend: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="up">Hausse</option>
            <option value="down">Baisse</option>
            <option value="neutral">Neutre</option>
          </select>
        </div>
      </div>
    );
  }

  if (element.type === "arrow") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Direction
          </label>
          <select
            value={element.direction}
            onChange={(e) => onUpdate({ direction: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="right">Droite</option>
            <option value="down">Bas</option>
            <option value="up">Haut</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Label (optionnel)
          </label>
          <input
            type="text"
            value={element.label || ""}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
      </div>
    );
  }

  if (element.type === "shape") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Type de forme
          </label>
          <select
            value={element.type}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Cercle</option>
            <option value="pill">Pilule</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Texte
          </label>
          <input
            type="text"
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Couleur de fond
          </label>
          <select
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="bg-brand-orange">Orange (Urstory)</option>
            <option value="bg-blue-600">Bleu</option>
            <option value="bg-green-600">Vert</option>
            <option value="bg-purple-600">Violet</option>
            <option value="bg-slate-700">Gris</option>
          </select>
        </div>
      </div>
    );
  }

  if (element.type === "quote") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Citation
          </label>
          <textarea
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Auteur
          </label>
          <input
            type="text"
            value={element.author}
            onChange={(e) => onUpdate({ author: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Fonction (optionnel)
          </label>
          <input
            type="text"
            value={element.role || ""}
            onChange={(e) => onUpdate({ role: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Style
          </label>
          <select
            value={element.style}
            onChange={(e) => onUpdate({ style: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="modern">Moderne</option>
            <option value="classic">Classique</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
    );
  }

  if (element.type === "testimonial") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Témoignage
          </label>
          <textarea
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={element.author}
            onChange={(e) => onUpdate({ author: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Entreprise
          </label>
          <input
            type="text"
            value={element.company}
            onChange={(e) => onUpdate({ company: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Note (sur 5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={element.rating}
            onChange={(e) => onUpdate({ rating: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
      </div>
    );
  }

  if (element.type === "teamCard") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={element.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Fonction
          </label>
          <input
            type="text"
            value={element.role}
            onChange={(e) => onUpdate({ role: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Bio
          </label>
          <textarea
            value={element.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            LinkedIn (optionnel)
          </label>
          <input
            type="text"
            value={element.linkedin || ""}
            onChange={(e) => onUpdate({ linkedin: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
      </div>
    );
  }

  if (element.type === "statCounter") {
    return (
      <div className="space-y-4">
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Statistiques
        </label>
        {element.stats?.map((stat: any, index: number) => (
          <div key={index} className="space-y-2 p-3 bg-slate-700/30 rounded-lg mb-3">
            <input
              type="text"
              value={stat.value}
              onChange={(e) => {
                const newStats = [...element.stats];
                newStats[index].value = e.target.value;
                onUpdate({ stats: newStats });
              }}
              placeholder="Valeur (ex: 500+)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <input
              type="text"
              value={stat.label}
              onChange={(e) => {
                const newStats = [...element.stats];
                newStats[index].label = e.target.value;
                onUpdate({ stats: newStats });
              }}
              placeholder="Label"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <select
              value={stat.icon}
              onChange={(e) => {
                const newStats = [...element.stats];
                newStats[index].icon = e.target.value;
                onUpdate({ stats: newStats });
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            >
              <option value="Users">Users</option>
              <option value="Heart">Heart</option>
              <option value="TrendingUp">TrendingUp</option>
              <option value="Target">Target</option>
              <option value="Award">Award</option>
            </select>
          </div>
        ))}
        <button
          onClick={() =>
            onUpdate({ stats: [...element.stats, { value: "100+", label: "Nouvelle stat", icon: "Award" }] })
          }
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une statistique
        </button>
      </div>
    );
  }

  if (element.type === "iconList") {
    return (
      <div className="space-y-4">
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Items
        </label>
        {element.items?.map((item: any, index: number) => (
          <div key={index} className="space-y-2 p-3 bg-slate-700/30 rounded-lg mb-3">
            <input
              type="text"
              value={item.text}
              onChange={(e) => {
                const newItems = [...element.items];
                newItems[index].text = e.target.value;
                onUpdate({ items: newItems });
              }}
              placeholder="Texte"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
          </div>
        ))}
        <button
          onClick={() =>
            onUpdate({ items: [...element.items, { icon: "Check", text: "Nouvel item", color: "text-green-400" }] })
          }
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un item
        </button>
      </div>
    );
  }

  if (element.type === "progressBar") {
    return (
      <div className="space-y-4">
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Barres de progression
        </label>
        {element.bars?.map((bar: any, index: number) => (
          <div key={index} className="space-y-2 p-3 bg-slate-700/30 rounded-lg mb-3">
            <input
              type="text"
              value={bar.label}
              onChange={(e) => {
                const newBars = [...element.bars];
                newBars[index].label = e.target.value;
                onUpdate({ bars: newBars });
              }}
              placeholder="Label"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={bar.value}
              onChange={(e) => {
                const newBars = [...element.bars];
                newBars[index].value = parseInt(e.target.value);
                onUpdate({ bars: newBars });
              }}
              placeholder="Valeur (0-100)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <select
              value={bar.color}
              onChange={(e) => {
                const newBars = [...element.bars];
                newBars[index].color = e.target.value;
                onUpdate({ bars: newBars });
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            >
              <option value="bg-brand-orange">Orange</option>
              <option value="bg-blue-500">Bleu</option>
              <option value="bg-green-500">Vert</option>
              <option value="bg-purple-500">Violet</option>
              <option value="bg-pink-500">Rose</option>
            </select>
          </div>
        ))}
        <button
          onClick={() =>
            onUpdate({ bars: [...element.bars, { label: "Nouvelle compétence", value: 80, color: "bg-brand-orange" }] })
          }
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une barre
        </button>
      </div>
    );
  }

  if (element.type === "logoGrid") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Titre (optionnel)
          </label>
          <input
            type="text"
            value={element.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Logos
        </label>
        {element.logos?.map((logo: any, index: number) => (
          <div key={index} className="space-y-2 p-3 bg-slate-700/30 rounded-lg mb-3">
            <input
              type="text"
              value={logo.name}
              onChange={(e) => {
                const newLogos = [...element.logos];
                newLogos[index].name = e.target.value;
                onUpdate({ logos: newLogos });
              }}
              placeholder="Nom du client"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <input
              type="text"
              value={logo.url}
              onChange={(e) => {
                const newLogos = [...element.logos];
                newLogos[index].url = e.target.value;
                onUpdate({ logos: newLogos });
              }}
              placeholder="URL du logo (optionnel)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
          </div>
        ))}
        <button
          onClick={() =>
            onUpdate({ logos: [...element.logos, { name: "Nouveau client", url: "" }] })
          }
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un logo
        </button>
      </div>
    );
  }

  if (element.type === "videoPortfolio") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Titre (optionnel)
          </label>
          <input
            type="text"
            value={element.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Nos Réalisations"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Colonnes
          </label>
          <select
            value={element.columns || 2}
            onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          >
            <option value="1">1 colonne</option>
            <option value="2">2 colonnes</option>
            <option value="3">3 colonnes</option>
          </select>
        </div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Vidéos
        </label>
        {element.videos?.map((video: any, index: number) => (
          <div key={index} className="space-y-2 p-3 bg-slate-700/30 rounded-lg mb-3 border-l-2 border-brand-orange/50">
            <input
              type="text"
              value={video.videoId}
              onChange={(e) => {
                const newVideos = [...element.videos];
                newVideos[index].videoId = e.target.value;
                onUpdate({ videos: newVideos });
              }}
              placeholder="ID Vimeo (ex: 1135383362)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <input
              type="text"
              value={video.title}
              onChange={(e) => {
                const newVideos = [...element.videos];
                newVideos[index].title = e.target.value;
                onUpdate({ videos: newVideos });
              }}
              placeholder="Titre de la vidéo"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <input
              type="text"
              value={video.description || ""}
              onChange={(e) => {
                const newVideos = [...element.videos];
                newVideos[index].description = e.target.value;
                onUpdate({ videos: newVideos });
              }}
              placeholder="Description (optionnel)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <input
              type="text"
              value={video.badge || ""}
              onChange={(e) => {
                const newVideos = [...element.videos];
                newVideos[index].badge = e.target.value;
                onUpdate({ videos: newVideos });
              }}
              placeholder="Badge (ex: Restauration)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
            />
            <button
              onClick={() => {
                const newVideos = element.videos.filter((_: any, i: number) => i !== index);
                onUpdate({ videos: newVideos });
              }}
              className="w-full px-3 py-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/50 text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer cette vidéo
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            onUpdate({ 
              videos: [
                ...element.videos, 
                { 
                  videoId: "", 
                  title: "Nouvelle vidéo", 
                  description: "", 
                  badge: "" 
                }
              ] 
            })
          }
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une vidéo
        </button>
      </div>
    );
  }

  if (
    element.type === "barChart" ||
    element.type === "lineChart" ||
    element.type === "pieChart"
  ) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Titre du graphique
          </label>
          <input
            type="text"
            value={element.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Données
          </label>
          {element.data.map((item: any, index: number) => (
            <div key={index} className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const newData = [...element.data];
                  newData[index].name = e.target.value;
                  onUpdate({ data: newData });
                }}
                placeholder="Nom"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) => {
                  const newData = [...element.data];
                  newData[index].value = parseFloat(e.target.value) || 0;
                  onUpdate({ data: newData });
                }}
                placeholder="Valeur"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-orange"
              />
            </div>
          ))}
          <button
            onClick={() =>
              onUpdate({
                data: [...element.data, { name: "Nouveau", value: 0 }],
              })
            }
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter une donnée
          </button>
        </div>
      </div>
    );
  }

  return <div className="text-slate-400 text-sm">Aucune propriété disponible</div>;
}
