"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewMeetingMinutesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    prospect_id: "",
    meeting_id: "",
    title: "",
    meeting_date: "",
    attendees_internal: "",
    attendees_external: "",
    discussion_summary: "",
    decisions_made: "",
    action_items: "",
    next_steps: "",
    attachments: "",
    status: "draft" as const,
  });

  useEffect(() => {
    fetchProspects();
    fetchMeetings();
  }, []);

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

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/sales/meetings");
      if (!response.ok) throw new Error("Failed to fetch meetings");
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/sales/meeting-minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          meeting_id: formData.meeting_id || null,
          attendees_internal: formData.attendees_internal || null,
          attendees_external: formData.attendees_external || null,
          discussion_summary: formData.discussion_summary || null,
          decisions_made: formData.decisions_made || null,
          action_items: formData.action_items || null,
          next_steps: formData.next_steps || null,
          attachments: formData.attachments || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create meeting minutes");

      router.push("/sales/meeting-minutes");
    } catch (error) {
      console.error("Error creating meeting minutes:", error);
      alert("Erreur lors de la création du PV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/sales/meeting-minutes"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux PV
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau PV de Réunion</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations de base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réunion associée (optionnel)
                </label>
                <select
                  value={formData.meeting_id}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucune</option>
                  {meetings.map((meeting) => (
                    <option key={meeting.id} value={meeting.id}>
                      {meeting.title} - {new Date(meeting.scheduled_date).toLocaleDateString("fr-FR")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du PV *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: PV Réunion Découverte - Nom Entreprise"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de la réunion *
                </label>
                <input
                  type="date"
                  required
                  value={formData.meeting_date}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
                  <option value="draft">Brouillon</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Participants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants internes
                </label>
                <input
                  type="text"
                  value={formData.attendees_internal}
                  onChange={(e) =>
                    setFormData({ ...formData, attendees_internal: e.target.value })
                  }
                  placeholder="Ex: Jean Dupont, Marie Martin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants externes
                </label>
                <input
                  type="text"
                  value={formData.attendees_external}
                  onChange={(e) =>
                    setFormData({ ...formData, attendees_external: e.target.value })
                  }
                  placeholder="Ex: Client A, Client B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contenu du PV
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Résumé de la discussion
                </label>
                <textarea
                  value={formData.discussion_summary}
                  onChange={(e) =>
                    setFormData({ ...formData, discussion_summary: e.target.value })
                  }
                  rows={4}
                  placeholder="Points principaux discutés lors de la réunion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Décisions prises
                </label>
                <textarea
                  value={formData.decisions_made}
                  onChange={(e) =>
                    setFormData({ ...formData, decisions_made: e.target.value })
                  }
                  rows={3}
                  placeholder="Liste des décisions validées..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actions à réaliser
                </label>
                <textarea
                  value={formData.action_items}
                  onChange={(e) =>
                    setFormData({ ...formData, action_items: e.target.value })
                  }
                  rows={4}
                  placeholder="Liste des actions avec responsables et échéances..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prochaines étapes
                </label>
                <textarea
                  value={formData.next_steps}
                  onChange={(e) =>
                    setFormData({ ...formData, next_steps: e.target.value })
                  }
                  rows={3}
                  placeholder="Étapes à suivre après cette réunion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/sales/meeting-minutes"
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
                Créer le PV
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
