"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditProspectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Switzerland",
    status: "nouveau" as const,
    priority: "medium" as const,
    estimated_value: "",
    probability: 50,
    expected_close_date: "",
    source: "",
    assigned_to: "",
    notes: "",
  });

  useEffect(() => {
    fetchProspect();
  }, [id]);

  const fetchProspect = async () => {
    try {
      const response = await fetch(`/api/sales/prospects/${id}`);
      if (!response.ok) throw new Error("Failed to fetch prospect");
      const data = await response.json();
      setFormData({
        company_name: data.company_name || "",
        industry: data.industry || "",
        website: data.website || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        city: data.city || "",
        postal_code: data.postal_code || "",
        country: data.country || "Switzerland",
        status: data.status || "nouveau",
        priority: data.priority || "medium",
        estimated_value: data.estimated_value?.toString() || "",
        probability: data.probability || 50,
        expected_close_date: data.expected_close_date?.split("T")[0] || "",
        source: data.source || "",
        assigned_to: data.assigned_to || "",
        notes: data.notes || "",
      });
    } catch (error) {
      console.error("Error fetching prospect:", error);
      alert("Erreur lors du chargement du prospect");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/sales/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimated_value: formData.estimated_value
            ? parseFloat(formData.estimated_value)
            : null,
          expected_close_date: formData.expected_close_date || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update prospect");

      router.push(`/sales/prospects/${id}`);
    } catch (error) {
      console.error("Error updating prospect:", error);
      alert("Erreur lors de la mise à jour du prospect");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce prospect ?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/sales/prospects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete prospect");

      router.push("/sales/prospects");
    } catch (error) {
      console.error("Error deleting prospect:", error);
      alert("Erreur lors de la suppression du prospect");
      setDeleting(false);
    }
  };

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
          href={`/sales/prospects/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au prospect
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier le Prospect
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
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rue
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
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
                  <option value="nouveau">Nouveau</option>
                  <option value="qualifie">Qualifié</option>
                  <option value="proposition">Proposition</option>
                  <option value="negociation">Négociation</option>
                  <option value="gagne">Gagné</option>
                  <option value="perdu">Perdu</option>
                  <option value="en_attente">En attente</option>
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
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="LinkedIn, Référence, Site web..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes internes..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href={`/sales/prospects/${id}`}
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
