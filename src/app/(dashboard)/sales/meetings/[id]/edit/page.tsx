"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditMeetingPage() {
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
    meeting_type: "decouverte" as const,
    scheduled_date: "",
    scheduled_time: "",
    duration_minutes: 60,
    location: "",
    meeting_link: "",
    attendees: "",
    agenda: "",
    notes: "",
    status: "scheduled" as const,
  });

  useEffect(() => {
    fetchProspects();
    fetchMeeting();
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

  const fetchMeeting = async () => {
    try {
      const response = await fetch(`/api/sales/meetings/${id}`);
      if (!response.ok) throw new Error("Failed to fetch meeting");
      const data = await response.json();
      
      const startTime = new Date(data.start_time);
      const endTime = new Date(data.end_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      
      const attendeesStr = data.attendees_external 
        ? data.attendees_external.map((a: any) => a.name).join(', ')
        : "";
      
      setFormData({
        prospect_id: data.prospect_id || "",
        title: data.title || "",
        meeting_type: data.meeting_type || "decouverte",
        scheduled_date: startTime.toISOString().split("T")[0],
        scheduled_time: startTime.toTimeString().slice(0, 5),
        duration_minutes: durationMinutes,
        location: data.location || "",
        meeting_link: data.meeting_url || "",
        attendees: attendeesStr,
        agenda: data.agenda || "",
        notes: data.preparation_notes || "",
        status: data.status || "scheduled",
      });
    } catch (error) {
      console.error("Error fetching meeting:", error);
      alert("Erreur lors du chargement de la réunion");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const startTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`);
      const endTime = new Date(startTime.getTime() + formData.duration_minutes * 60000);
      
      const attendeesExternal = formData.attendees 
        ? formData.attendees.split(',').map(name => ({ name: name.trim() }))
        : null;
      
      const response = await fetch(`/api/sales/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: formData.prospect_id,
          title: formData.title,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          location: formData.location || null,
          meeting_url: formData.meeting_link || null,
          attendees_external: attendeesExternal,
          agenda: formData.agenda || null,
          preparation_notes: formData.notes || null,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to update meeting");
      }

      router.push("/sales/meetings");
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert("Erreur lors de la mise à jour de la réunion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette réunion ?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/sales/meetings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete meeting");

      router.push("/sales/meetings");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Erreur lors de la suppression de la réunion");
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
          href="/sales/meetings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux réunions
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier la Réunion
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
                  Titre de la réunion *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Première rencontre, Présentation de l'offre..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de réunion
                </label>
                <select
                  value={formData.meeting_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meeting_type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="decouverte">Découverte</option>
                  <option value="presentation">Présentation</option>
                  <option value="negociation">Négociation</option>
                  <option value="suivi">Suivi</option>
                  <option value="cloture">Clôture</option>
                </select>
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
                  <option value="scheduled">Planifiée</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                  <option value="rescheduled">Reportée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Date et heure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.scheduled_date}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure *
                </label>
                <input
                  type="time"
                  required
                  value={formData.scheduled_time}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lieu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse / Lieu
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Adresse physique ou nom du lieu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lien visio
                </label>
                <input
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_link: e.target.value })
                  }
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participants
            </label>
            <input
              type="text"
              value={formData.attendees}
              onChange={(e) =>
                setFormData({ ...formData, attendees: e.target.value })
              }
              placeholder="Ex: Jean Dupont, Marie Martin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordre du jour
            </label>
            <textarea
              value={formData.agenda}
              onChange={(e) =>
                setFormData({ ...formData, agenda: e.target.value })
              }
              rows={4}
              placeholder="Points à aborder pendant la réunion..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              rows={3}
              placeholder="Notes internes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/sales/meetings"
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
