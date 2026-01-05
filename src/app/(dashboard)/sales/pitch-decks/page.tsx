"use client";

import { useState, useEffect } from "react";
import { Plus, Presentation, Eye, Download, Copy, Send, Building2, Calendar, Layers } from "lucide-react";
import Link from "next/link";

interface PitchDeck {
  id: number;
  title: string;
  description: string | null;
  template_name: string | null;
  version: number;
  is_active: boolean;
  is_sent: boolean;
  sent_date: string | null;
  prospect_id: number;
  prospect_name?: string;
  pdf_url: string | null;
  pptx_url: string | null;
  created_at: string;
  updated_at: string;
}

const templates = [
  {
    id: "intro_agency",
    name: "Présentation Agence",
    description: "Introduction complète de YourStory",
    slides: ["Cover", "À propos", "Services", "Processus", "Portfolio", "Contact"]
  },
  {
    id: "proposal",
    name: "Proposition Commerciale",
    description: "Deck de proposition personnalisé",
    slides: ["Cover", "Problématique", "Solution", "Approche", "Timeline", "Tarifs", "Next Steps"]
  },
  {
    id: "case_study",
    name: "Étude de Cas",
    description: "Présentation de cas client",
    slides: ["Cover", "Client", "Challenge", "Solution", "Résultats", "Testimonial"]
  },
];

export default function PitchDecksPage() {
  const [decks, setDecks] = useState<PitchDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [filterProspect, setFilterProspect] = useState<string>("all");

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch("/api/sales/pitch-decks");
      if (response.ok) {
        const data = await response.json();
        setDecks(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pitch decks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDeckFromTemplate = async (templateId: string, prospectId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      const response = await fetch("/api/sales/pitch-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: prospectId,
          template_name: templateId,
          title: template.name,
          description: template.description,
          slides: template.slides.map((title, index) => ({
            id: index + 1,
            title,
            content: {},
            order: index + 1
          }))
        }),
      });

      if (response.ok) {
        fetchDecks();
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const duplicateDeck = async (deckId: number) => {
    try {
      const response = await fetch(`/api/sales/pitch-decks/${deckId}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        fetchDecks();
      }
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
    }
  };

  const exportDeck = async (deckId: number, format: "pdf" | "pptx") => {
    try {
      const response = await fetch(`/api/sales/pitch-decks/${deckId}/export-${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pitch-deck-${deckId}.${format}`;
        a.click();
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  const activeDecks = decks.filter(d => d.is_active);
  const sentDecks = decks.filter(d => d.is_sent);
  const uniqueProspects = [...new Set(decks.map(d => d.prospect_name).filter(Boolean))];

  const filteredDecks = filterProspect === "all" 
    ? decks 
    : decks.filter(d => d.prospect_name === filterProspect);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pitch Decks</h1>
            <p className="text-slate-400">Présentations commerciales personnalisées</p>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl hover:shadow-brand-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouveau deck
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-1">Total Decks</div>
            <div className="text-2xl font-bold text-white">{decks.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Actifs</div>
            <div className="text-2xl font-bold text-white">{activeDecks.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-sm text-green-300 mb-1">Envoyés</div>
            <div className="text-2xl font-bold text-white">{sentDecks.length}</div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Templates disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-all duration-200"
              >
                <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{template.slides.length} slides</span>
                </div>
                <Link
                  href={`/sales/pitch-decks/new?template=${template.id}`}
                  className="block text-center px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                >
                  Utiliser ce template
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        {uniqueProspects.length > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Filtrer par prospect:</span>
              <select
                value={filterProspect}
                onChange={(e) => setFilterProspect(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-orange transition-colors"
              >
                <option value="all">Tous les prospects</option>
                {uniqueProspects.map((prospect) => (
                  <option key={prospect} value={prospect}>{prospect}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Decks List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Chargement...</div>
          ) : filteredDecks.length === 0 ? (
            <div className="text-center py-12">
              <Presentation className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Aucun pitch deck créé</p>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 bg-brand-orange/20 text-brand-orange border border-brand-orange/30 rounded-lg hover:bg-brand-orange/30 transition-colors"
              >
                Créer votre premier deck
              </button>
            </div>
          ) : (
            filteredDecks.map((deck) => (
              <div
                key={deck.id}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-brand-orange/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Presentation className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{deck.title}</h3>
                          <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                            v{deck.version}
                          </span>
                          {deck.is_active && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs">
                              Actif
                            </span>
                          )}
                          {deck.is_sent && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              Envoyé
                            </span>
                          )}
                        </div>
                        {deck.description && (
                          <p className="text-sm text-slate-400">{deck.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {deck.prospect_name && (
                        <Link
                          href={`/sales/prospects/${deck.prospect_id}`}
                          className="flex items-center gap-1 text-slate-400 hover:text-brand-orange transition-colors"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>{deck.prospect_name}</span>
                        </Link>
                      )}
                      {deck.template_name && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Layers className="w-4 h-4" />
                          <span>{templates.find(t => t.id === deck.template_name)?.name || deck.template_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>Créé le {new Date(deck.created_at).toLocaleDateString('fr-CH')}</span>
                      </div>
                      {deck.sent_date && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Send className="w-4 h-4" />
                          <span>Envoyé le {new Date(deck.sent_date).toLocaleDateString('fr-CH')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => exportDeck(deck.id, "pdf")}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Exporter PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => duplicateDeck(deck.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/sales/pitch-decks/${deck.id}`}
                      className="px-3 py-2 bg-brand-orange/20 text-brand-orange border border-brand-orange/30 rounded-lg hover:bg-brand-orange/30 transition-colors text-sm flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Voir & Éditer
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
