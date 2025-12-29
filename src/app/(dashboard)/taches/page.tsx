"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from '@/components/layout/Header';
import { 
  ClipboardList, 
  Loader2,
  Calendar,
  Briefcase,
  User,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  CalendarDays,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  AlertCircle,
  CheckCheck,
  X,
  Target,
  ArrowUpDown,
  Plus
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MandatTask,
  Mandat,
  Client,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_TYPE_LABELS,
  TaskStatus,
  TaskType
} from "@/types/database";
import { AgencyEditorialCalendar } from "@/components/calendar/AgencyEditorialCalendar";
import { QuickTaskModal } from "@/components/modals/QuickTaskModal";
import { QuickMandatModal } from "@/components/modals/QuickMandatModal";

interface TaskWithDetails extends MandatTask {
  mandat: Mandat;
  client: Client;
}

export default function TachesPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar'>('tasks');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'status'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMandatModal, setShowMandatModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setIsLoading(true);
      setError(null);

      const { data: tasksData, error: tasksError } = await supabase
        .from("mandat_task")
        .select(`
          *,
          mandat:mandat_id (
            *,
            client:client_id (*)
          )
        `)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (tasksError) throw tasksError;

      if (!tasksData || tasksData.length === 0) {
        setTasks([]);
        return;
      }

      const tasksWithDetails: TaskWithDetails[] = tasksData
        .map(task => {
          if (!task.mandat || !task.mandat.client) return null;
          return {
            ...task,
            mandat: task.mandat,
            client: task.mandat.client
          } as TaskWithDetails;
        })
        .filter((task): task is TaskWithDetails => task !== null);

      setTasks(tasksWithDetails);

    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement des tâches");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterType !== 'all' && task.type !== filterType) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.client.name.toLowerCase().includes(query) ||
          task.mandat.title.toLowerCase().includes(query) ||
          (task.details && task.details.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'client':
          return a.client.name.localeCompare(b.client.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, filterStatus, filterType, searchQuery, sortBy]);

  const tasksByStatus = useMemo(() => {
    return {
      a_faire: filteredAndSortedTasks.filter(t => t.status === 'a_faire'),
      en_cours: filteredAndSortedTasks.filter(t => t.status === 'en_cours'),
      terminee: filteredAndSortedTasks.filter(t => t.status === 'terminee'),
    };
  }, [filteredAndSortedTasks]);

  // Grouper par statut pour les statistiques
  const stats = {
    total: tasks.length,
    a_faire: tasks.filter(t => t.status === 'a_faire').length,
    en_cours: tasks.filter(t => t.status === 'en_cours').length,
    terminee: tasks.filter(t => t.status === 'terminee').length,
  };

  if (isLoading) {
    return (
      <>
        <Header title="Toutes les tâches" />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">Chargement des tâches...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Toutes les tâches" />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <p className="text-red-900 font-semibold">{error}</p>
          </div>
        </main>
      </>
    );
  }

  const overdueTasks = filteredAndSortedTasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'terminee'
  );

  const tasksCompletionRate = stats.total > 0 
    ? Math.round((stats.terminee / stats.total) * 100)
    : 0;

  return (
    <>
      <Header title="Travail & Tâches" />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Résumé Dashboard */}
        <div className="bg-gradient-to-br from-brand-orange via-brand-orange-light to-orange-400 rounded-2xl shadow-2xl p-6 sm:p-8 text-white mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gestion des Tâches</h1>
              <p className="text-white/90 text-lg">Vue d'ensemble de votre activité</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-brand-orange rounded-xl font-bold hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Nouvelle tâche
              </button>
              <button
                onClick={() => setShowMandatModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all border-2 border-white/40"
              >
                <Briefcase className="w-5 h-5" />
                Nouveau mandat
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
              <div className="flex items-center justify-between mb-2">
                <ClipboardList className="w-8 h-8 text-white/80" />
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
              <p className="text-sm text-white/90 font-medium">Total tâches</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-300" />
                <div className="text-3xl font-bold">{stats.terminee}</div>
              </div>
              <p className="text-sm text-white/90 font-medium">Terminées</p>
              <div className="mt-2 bg-white/20 rounded-full h-1.5">
                <div 
                  className="bg-green-300 h-1.5 rounded-full transition-all"
                  style={{ width: `${tasksCompletionRate}%` }}
                />
              </div>
              <p className="text-xs text-white/80 mt-1">{tasksCompletionRate}%</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-300" />
                <div className="text-3xl font-bold">{stats.en_cours}</div>
              </div>
              <p className="text-sm text-white/90 font-medium">En cours</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-red-300" />
                <div className="text-3xl font-bold text-red-300">{overdueTasks.length}</div>
              </div>
              <p className="text-sm text-white/90 font-medium">En retard</p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-brand-orange to-brand-orange-light text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Tâches des Mandats</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'tasks' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {stats.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-brand-orange to-brand-orange-light text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Calendrier Éditorial</span>
          </button>
        </div>

        {activeTab === 'tasks' && (
          <>
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">À faire</p>
                <p className="text-2xl font-bold text-gray-900">{stats.a_faire}</p>
              </div>
              <Circle className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.en_cours}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.terminee}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Barre de recherche et contrôles */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une tâche, un client, un mandat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                  showFilters ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filtres</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'status')}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg font-bold text-gray-900 hover:bg-gray-50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              >
                <option value="date">Par date</option>
                <option value="client">Par client</option>
                <option value="status">Par statut</option>
              </select>

              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                  title="Vue liste"
                >
                  <LayoutList className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                  title="Vue kanban"
                >
                  <LayoutGrid className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-gray-200">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="a_faire">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminee">Terminée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TaskType | 'all')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
                >
                  <option value="all">Tous les types</option>
                  <option value="contenu">Contenu</option>
                  <option value="video">Vidéo</option>
                  <option value="reunion">Réunion</option>
                  <option value="reporting">Reporting</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Tâches ({filteredAndSortedTasks.length})
              </h2>
              {searchQuery && (
                <span className="text-sm text-gray-600">
                  {filteredAndSortedTasks.length} résultat{filteredAndSortedTasks.length !== 1 ? 's' : ''} pour "{searchQuery}"
                </span>
              )}
            </div>

            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {tasks.length === 0 
                    ? "Aucune tâche créée" 
                    : "Aucune tâche ne correspond aux critères de recherche"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedTasks.map((task: TaskWithDetails) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'terminee';
                  return (
                    <div
                      key={task.id}
                      className={`border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                        isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400'
                      }`}
                      onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 flex-1">
                              {task.title}
                            </h3>
                            {isOverdue && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                <AlertCircle className="w-3 h-3" />
                                En retard
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                            <Link
                              href={`/clients/${task.client.id}`}
                              className="flex items-center hover:text-blue-700 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <User className="w-4 h-4 mr-1" />
                              {task.client.name}
                            </Link>
                            
                            <Link
                              href={`/mandats/${task.mandat_id}`}
                              className="flex items-center hover:text-blue-700 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Briefcase className="w-4 h-4 mr-1" />
                              {task.mandat.title}
                            </Link>

                            {task.due_date && (
                              <div className={`flex items-center ${isOverdue ? 'text-red-700 font-bold' : ''}`}>
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(task.due_date).toLocaleDateString("fr-FR")}
                              </div>
                            )}
                          </div>

                          {task.details && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {task.details}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <span className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${TASK_STATUS_COLORS[task.status]}`}>
                            {TASK_STATUS_LABELS[task.status]}
                          </span>
                          
                          <span className="px-3 py-1 text-xs rounded-full whitespace-nowrap bg-gray-100 text-gray-900 font-semibold border-2 border-gray-300">
                            {TASK_TYPE_LABELS[task.type]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne À faire */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <h3 className="font-bold text-gray-900">À faire</h3>
                <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-bold">
                  {tasksByStatus.a_faire.length}
                </span>
              </div>
              <div className="space-y-3">
                {tasksByStatus.a_faire.map((task: TaskWithDetails) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-400"
                    onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                  >
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{task.client.name}</p>
                    {task.due_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded">
                      {TASK_TYPE_LABELS[task.type]}
                    </span>
                  </div>
                ))}
                {tasksByStatus.a_faire.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">Aucune tâche</p>
                )}
              </div>
            </div>

            {/* Colonne En cours */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <h3 className="font-bold text-gray-900">En cours</h3>
                <span className="ml-auto bg-blue-200 text-blue-700 px-2 py-1 rounded-full text-sm font-bold">
                  {tasksByStatus.en_cours.length}
                </span>
              </div>
              <div className="space-y-3">
                {tasksByStatus.en_cours.map((task: TaskWithDetails) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-400"
                    onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                  >
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{task.client.name}</p>
                    {task.due_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded">
                      {TASK_TYPE_LABELS[task.type]}
                    </span>
                  </div>
                ))}
                {tasksByStatus.en_cours.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">Aucune tâche</p>
                )}
              </div>
            </div>

            {/* Colonne Terminée */}
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <h3 className="font-bold text-gray-900">Terminée</h3>
                <span className="ml-auto bg-green-200 text-green-700 px-2 py-1 rounded-full text-sm font-bold">
                  {tasksByStatus.terminee.length}
                </span>
              </div>
              <div className="space-y-3">
                {tasksByStatus.terminee.map((task: TaskWithDetails) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-400 opacity-75"
                    onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                  >
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{task.client.name}</p>
                    {task.due_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded">
                      {TASK_TYPE_LABELS[task.type]}
                    </span>
                  </div>
                ))}
                {tasksByStatus.terminee.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">Aucune tâche</p>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'calendar' && (
          <AgencyEditorialCalendar />
        )}

        {/* Modals */}
        <QuickTaskModal 
          isOpen={showTaskModal} 
          onClose={() => setShowTaskModal(false)} 
          onSuccess={loadTasks}
        />
        <QuickMandatModal 
          isOpen={showMandatModal} 
          onClose={() => setShowMandatModal(false)} 
          onSuccess={() => {
            // Optionnel: rediriger ou rafraîchir
          }}
        />
      </main>
    </>
  );
}
