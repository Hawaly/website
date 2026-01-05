"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewProspectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    website: "",
    company_size: "",
    location: "",
    country: "Switzerland",
    status: "new" as const,
    priority: "medium" as const,
    estimated_value: "",
    probability: 50,
    expected_close_date: "",
    source: "",
    owner_id: null as number | null,
    pain_points: "",
    objectives: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/sales/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimated_value: formData.estimated_value
            ? parseFloat(formData.estimated_value)
            : null,
          expected_close_date: formData.expected_close_date || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to create prospect");
      }

      const data = await response.json();
      router.push(`/sales/prospects/${data.id}`);
    } catch (error) {
      console.error("Error creating prospect:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/sales/prospects"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux prospects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau Prospect</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Company Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations Entreprise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industrie
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taille de l'entreprise
                </label>
                <select
                  value={formData.company_size}
                  onChange={(e) =>
                    setFormData({ ...formData, company_size: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="201-500">201-500 employés</option>
                  <option value="500+">500+ employés</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville/Localité
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="ex: Genève, Zurich, Lausanne"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations Commerciales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">Nouveau</option>
                  <option value="qualified">Qualifié</option>
                  <option value="discovery">Découverte</option>
                  <option value="proposal">Proposition</option>
                  <option value="negotiation">Négociation</option>
                  <option value="won">Gagné</option>
                  <option value="lost">Perdu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur estimée (CHF)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimated_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_value: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probabilité (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      probability: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {formData.probability}%
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de clôture prévue
                </label>
                <input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expected_close_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="website">Site web</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Référence</option>
                  <option value="cold_outreach">Prospection à froid</option>
                  <option value="event">Événement</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Qualification */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Qualification
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points de douleur
                </label>
                <textarea
                  value={formData.pain_points}
                  onChange={(e) =>
                    setFormData({ ...formData, pain_points: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quels sont les problèmes du prospect ?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectifs
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) =>
                    setFormData({ ...formData, objectives: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quels sont les objectifs du prospect ?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notes internes..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/sales/prospects"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Créer le prospect
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
