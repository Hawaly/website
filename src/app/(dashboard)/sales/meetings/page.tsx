"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, List, MapPin, Video, Users, Clock, Eye, Edit, Download } from "lucide-react";
import Link from "next/link";

interface Meeting {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  meeting_url: string | null;
  start_time: string;
  end_time: string;
  status: string;
  prospect_id: number | null;
  prospect_name?: string;
  attendees_external: any;
  agenda: string | null;
  created_at: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/sales/meetings");
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réunions:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingMeetings = meetings.filter(m => new Date(m.start_time) >= new Date()).sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const todayMeetings = upcomingMeetings.filter(m => 
    new Date(m.start_time).toDateString() === new Date().toDateString()
  );

  const exportToICS = async (meetingId: number) => {
    try {
      const response = await fetch(`/api/sales/meetings/${meetingId}/export-ics`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-${meetingId}.ics`;
        a.click();
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Rendez-vous</h1>
            <p className="text-slate-400">Gérez votre calendrier commercial</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-brand-orange text-white" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "calendar" 
                    ? "bg-brand-orange text-white" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>
            <Link
              href="/sales/meetings/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl hover:shadow-brand-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Nouveau RDV
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-1">Aujourd'hui</div>
            <div className="text-2xl font-bold text-white">{todayMeetings.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Cette semaine</div>
            <div className="text-2xl font-bold text-white">
              {upcomingMeetings.filter(m => {
                const meetingDate = new Date(m.start_time);
                const weekEnd = new Date();
                weekEnd.setDate(weekEnd.getDate() + 7);
                return meetingDate <= weekEnd;
              }).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-sm text-green-300 mb-1">À venir</div>
            <div className="text-2xl font-bold text-white">{upcomingMeetings.length}</div>
          </div>
        </div>

        {/* Today's Meetings Highlight */}
        {todayMeetings.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-5 mb-6">
            <Link href="/sales/meetings/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle réunion
            </Link>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-orange-400" />
              Rendez-vous d'aujourd'hui
            </h2>
            <div className="space-y-3">
              {todayMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{meeting.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(meeting.start_time).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(meeting.end_time).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {meeting.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        {meeting.meeting_url && (
                          <a 
                            href={meeting.meeting_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-orange hover:underline"
                          >
                            <Video className="w-4 h-4" />
                            <span>Rejoindre</span>
                          </a>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/sales/meetings/${meeting.id}`}
                      className="px-3 py-1.5 bg-brand-orange/20 text-brand-orange border border-brand-orange/30 rounded-lg hover:bg-brand-orange/30 transition-colors text-sm"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meetings List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Chargement...</div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Aucun rendez-vous prévu</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-brand-orange/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                      {meeting.prospect_name && (
                        <Link
                          href={`/sales/prospects/${meeting.prospect_id}`}
                          className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
                        >
                          {meeting.prospect_name}
                        </Link>
                      )}
                    </div>

                    {meeting.description && (
                      <p className="text-slate-400 text-sm mb-3">{meeting.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-300">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(meeting.start_time).toLocaleDateString('fr-CH', { 
                          weekday: 'short',
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(meeting.start_time).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(meeting.end_time).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      {meeting.meeting_url && (
                        <a 
                          href={meeting.meeting_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-orange hover:underline"
                        >
                          <Video className="w-4 h-4" />
                          <span>Lien visio</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => exportToICS(meeting.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Exporter .ics"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/sales/meetings/${meeting.id}`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/sales/meetings/${meeting.id}/edit`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
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
