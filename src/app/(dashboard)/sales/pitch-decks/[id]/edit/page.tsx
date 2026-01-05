"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditPitchDeckPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    prospect_id: "",
    title: "",
    description: "",
    template_name: "",
  });

  useEffect(() => {
    fetchProspects();
    fetchPitchDeck();
  }, [id]);

  const fetchProspects = async () => {
    try {
      const response = await fetch("/api/sales/prospects");
      if (!response.ok) throw new Error("Failed to fetch prospects");
      const data = await response.json();
      setProspects(data);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    }
  };

  const fetchPitchDeck = async () => {
    try {
      const response = await fetch(`/api/sales/pitch-decks/${id}`);
      if (!response.ok) throw new Error("Failed to fetch pitch deck");
      const data = await response.json();
      
      setFormData({
        prospect_id: data.prospect_id || "",
        title: data.title || "",
        description: data.description || "",
        template_name: data.template_name || "",
      });
    } catch (error) {
      console.error("Error fetching pitch deck:", error);
      alert("Erreur lors du chargement du pitch deck");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/sales/pitch-decks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: formData.prospect_id,
          title: formData.title,
          description: formData.description || null,
          template_name: formData.template_name || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to update pitch deck");
      }

      router.push("/sales/pitch-decks");
    } catch (error) {
      console.error("Error updating pitch deck:", error);
      alert("Erreur lors de la mise à jour du pitch deck");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pitch deck ?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/sales/pitch-decks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete pitch deck");

      router.push("/sales/pitch-decks");
    } catch (error) {
      console.error("Error deleting pitch deck:", error);
      alert("Erreur lors de la suppression du pitch deck");
      setDeleting(false);
    }
  };

  const templates = [
    { id: "standard", name: "Standard Agency Pitch" },
    { id: "social-media", name: "Social Media Strategy" },
    { id: "branding", name: "Branding & Identity" },
    { id: "digital-marketing", name: "Digital Marketing" },
    { id: "custom", name: "Custom Pitch" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/sales/pitch-decks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux pitch decks
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier le Pitch Deck
          </h1>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations de base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect *
                </label>
                <select
                  required
                  value={formData.prospect_id}
                  onChange={(e) =>
                    setFormData({ ...formData, prospect_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un prospect</option>
                  {prospects.map((prospect) => (
                    <option key={prospect.id} value={prospect.id}>
                      {prospect.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du pitch deck *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Proposition Stratégie Social Media 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Brève description du pitch deck..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  value={formData.template_name}
                  onChange={(e) =>
                    setFormData({ ...formData, template_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucun template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/sales/pitch-decks"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
      </form>
    </div>
  );
}
