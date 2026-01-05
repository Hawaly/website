"use client";

import { useState, useEffect } from "react";
import { Plus, FileEdit, Calendar, Users, CheckSquare, Download, Eye, Lock, Building2 } from "lucide-react";
import Link from "next/link";

interface MeetingMinute {
  id: number;
  title: string;
  meeting_date: string;
  participants: any;
  context: string | null;
  agenda: string | null;
  discussion_points: string | null;
  decisions: string | null;
  action_items: any;
  next_meeting_date: string | null;
  is_approved: boolean;
  approved_at: string | null;
  prospect_id: number | null;
  prospect_name?: string;
  meeting_id: number | null;
  created_at: string;
}

export default function MeetingMinutesPage() {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchMinutes();
  }, []);

  const fetchMinutes = async () => {
    try {
      const response = await fetch("/api/sales/meeting-minutes");
      if (response.ok) {
        const data = await response.json();
        setMinutes(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des PV:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (minuteId: number) => {
    try {
      const response = await fetch(`/api/sales/meeting-minutes/${minuteId}/export-pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pv-reunion-${minuteId}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  const filteredMinutes = minutes.filter((minute) => {
    if (filterStatus === "pending") return !minute.is_approved;
    if (filterStatus === "approved") return minute.is_approved;
    return true;
  });

  const pendingCount = minutes.filter(m => !m.is_approved).length;
  const approvedCount = minutes.filter(m => m.is_approved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Procès-verbaux de réunions</h1>
            <p className="text-slate-400">Comptes-rendus structurés avec actions de suivi</p>
          </div>
          <Link
            href="/sales/meeting-minutes/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl hover:shadow-brand-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouveau PV
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-1">Total PV</div>
            <div className="text-2xl font-bold text-white">{minutes.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
            <div className="text-sm text-orange-300 mb-1">En attente validation</div>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-sm text-green-300 mb-1">Validés</div>
            <div className="text-2xl font-bold text-white">{approvedCount}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Statut:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === "all"
                    ? "bg-brand-orange text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-white"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === "pending"
                    ? "bg-brand-orange text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-white"
                }`}
              >
                En attente ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === "approved"
                    ? "bg-brand-orange text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-white"
                }`}
              >
                Validés ({approvedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Minutes List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Chargement...</div>
          ) : filteredMinutes.length === 0 ? (
            <div className="text-center py-12">
              <FileEdit className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Aucun procès-verbal trouvé</p>
            </div>
          ) : (
            filteredMinutes.map((minute) => {
              const actionItemsCount = Array.isArray(minute.action_items) ? minute.action_items.length : 0;
              const participants = Array.isArray(minute.participants) ? minute.participants : [];

              return (
                <div
                  key={minute.id}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-brand-orange/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{minute.title}</h3>
                        {minute.is_approved ? (
                          <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Validé
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-medium">
                            En attente
                          </span>
                        )}
                        {minute.prospect_name && (
                          <Link
                            href={`/sales/prospects/${minute.prospect_id}`}
                            className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
                          >
                            {minute.prospect_name}
                          </Link>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(minute.meeting_date).toLocaleDateString('fr-CH', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</span>
                        </div>
                        {participants.length > 0 && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>{participants.length} participant{participants.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {actionItemsCount > 0 && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <CheckSquare className="w-4 h-4" />
                            <span>{actionItemsCount} action{actionItemsCount > 1 ? 's' : ''} de suivi</span>
                          </div>
                        )}
                      </div>

                      {minute.context && (
                        <p className="text-slate-400 text-sm line-clamp-2">{minute.context}</p>
                      )}

                      {minute.next_meeting_date && (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <p className="text-sm text-slate-300">
                            <span className="text-slate-500">Prochain RDV:</span>{' '}
                            {new Date(minute.next_meeting_date).toLocaleDateString('fr-CH', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => exportToPDF(minute.id)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Exporter PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <Link
                        href={`/sales/meeting-minutes/${minute.id}`}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
