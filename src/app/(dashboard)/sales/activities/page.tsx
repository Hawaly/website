"use client";

import { useState, useEffect } from "react";
import { Plus, Phone, Mail, CheckSquare, Calendar, Filter, Clock, User, Building2 } from "lucide-react";
import Link from "next/link";

interface Activity {
  id: number;
  type: "call" | "email" | "task" | "meeting";
  subject: string;
  description: string | null;
  status: "planned" | "completed" | "cancelled";
  priority: string;
  due_date: string | null;
  completed_date: string | null;
  prospect_id: number | null;
  prospect_name?: string;
  next_action: string | null;
  created_at: string;
}

const activityTypeConfig = {
  call: { icon: Phone, label: "Appel", color: "from-blue-500 to-blue-600" },
  email: { icon: Mail, label: "Email", color: "from-purple-500 to-purple-600" },
  task: { icon: CheckSquare, label: "Tâche", color: "from-orange-500 to-orange-600" },
  meeting: { icon: Calendar, label: "Réunion", color: "from-green-500 to-green-600" },
};

const statusLabels = {
  planned: { label: "Planifié", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "Terminé", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  cancelled: { label: "Annulé", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const priorityLabels = {
  low: { label: "Basse", color: "text-gray-400" },
  medium: { label: "Moyenne", color: "text-blue-400" },
  high: { label: "Haute", color: "text-orange-400" },
  urgent: { label: "Urgente", color: "text-red-400" },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("planned");
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/sales/activities");
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des activités:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (activityId: number) => {
    try {
      const response = await fetch(`/api/sales/activities/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", completed_date: new Date().toISOString() }),
      });

      if (response.ok) {
        fetchActivities();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const overdueActivities = filteredActivities.filter(
    (a) => a.status === "planned" && a.due_date && new Date(a.due_date) < new Date()
  );
  const todayActivities = filteredActivities.filter(
    (a) => a.status === "planned" && a.due_date && 
    new Date(a.due_date).toDateString() === new Date().toDateString()
  );
  const upcomingActivities = filteredActivities.filter(
    (a) => a.status === "planned" && a.due_date && 
    new Date(a.due_date) > new Date() && 
    new Date(a.due_date).toDateString() !== new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Activités & Suivi</h1>
            <p className="text-slate-400">Gérez vos appels, emails et tâches</p>
          </div>
          <button
            onClick={() => setShowNewActivityModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl hover:shadow-brand-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouvelle activité
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 border border-red-500/30">
            <div className="text-sm text-red-300 mb-1">En retard</div>
            <div className="text-2xl font-bold text-white">{overdueActivities.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
            <div className="text-sm text-orange-300 mb-1">Aujourd'hui</div>
            <div className="text-2xl font-bold text-white">{todayActivities.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-1">À venir</div>
            <div className="text-2xl font-bold text-white">{upcomingActivities.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-sm text-green-300 mb-1">Complétées (7j)</div>
            <div className="text-2xl font-bold text-white">
              {activities.filter(a => a.status === "completed").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-orange transition-colors"
              >
                <option value="all">Tous les types</option>
                <option value="call">Appels</option>
                <option value="email">Emails</option>
                <option value="task">Tâches</option>
                <option value="meeting">Réunions</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-orange transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="planned">Planifié</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {/* Overdue */}
          {overdueActivities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                En retard ({overdueActivities.length})
              </h2>
              <div className="space-y-2">
                {overdueActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onComplete={markAsCompleted}
                    isOverdue
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today */}
          {todayActivities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Aujourd'hui ({todayActivities.length})
              </h2>
              <div className="space-y-2">
                {todayActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onComplete={markAsCompleted}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingActivities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                À venir ({upcomingActivities.length})
              </h2>
              <div className="space-y-2">
                {upcomingActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onComplete={markAsCompleted}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {statusFilter === "completed" && (
            <div>
              <h2 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Terminées
              </h2>
              <div className="space-y-2">
                {filteredActivities.filter(a => a.status === "completed").map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onComplete={markAsCompleted}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Aucune activité trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ 
  activity, 
  onComplete, 
  isOverdue = false 
}: { 
  activity: Activity; 
  onComplete: (id: number) => void;
  isOverdue?: boolean;
}) {
  const typeConfig = activityTypeConfig[activity.type];
  const Icon = typeConfig.icon;

  return (
    <div className={`bg-slate-900/50 backdrop-blur-sm rounded-xl border ${
      isOverdue ? "border-red-500/50" : "border-slate-800"
    } p-4 hover:border-brand-orange/50 transition-all duration-200`}>
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${typeConfig.color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">{activity.subject}</h3>
              {activity.description && (
                <p className="text-sm text-slate-400">{activity.description}</p>
              )}
            </div>
            {activity.status === "planned" && (
              <button
                onClick={() => onComplete(activity.id)}
                className="ml-4 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
              >
                Marquer terminé
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-2 py-1 rounded-lg border text-xs ${statusLabels[activity.status]?.color}`}>
              {statusLabels[activity.status]?.label}
            </span>
            
            {activity.priority && activity.priority !== "low" && (
              <span className={`text-xs font-medium ${priorityLabels[activity.priority as keyof typeof priorityLabels]?.color}`}>
                {priorityLabels[activity.priority as keyof typeof priorityLabels]?.label}
              </span>
            )}

            {activity.due_date && (
              <div className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
                <Clock className="w-4 h-4" />
                <span>{new Date(activity.due_date).toLocaleDateString('fr-CH', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            )}

            {activity.prospect_name && (
              <div className="flex items-center gap-1 text-slate-400">
                <Building2 className="w-4 h-4" />
                <Link 
                  href={`/sales/prospects/${activity.prospect_id}`}
                  className="hover:text-brand-orange transition-colors"
                >
                  {activity.prospect_name}
                </Link>
              </div>
            )}
          </div>

          {activity.next_action && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="text-sm text-slate-300">
                <span className="text-slate-500">Prochaine action:</span> {activity.next_action}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
