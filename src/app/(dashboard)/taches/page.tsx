"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  Timer,
  ChevronRight,
  Sparkles,
  ListTodo,
  MoreHorizontal
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
        <Header title="Tâches" />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                <ListTodo className="w-8 h-8 text-white" />
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Chargement des tâches...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Tâches" />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 text-sm">{error}</p>
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
      <Header title="Tâches" />
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
        {/* Hero Section compact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white mb-4 sm:mb-6 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Gestion des Tâches</h1>
                <p className="text-white/70 text-sm">Vue d'ensemble de votre activité</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouvelle tâche</span>
                  <span className="sm:hidden">Tâche</span>
                </button>
                <button
                  onClick={() => setShowMandatModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold text-sm hover:bg-white/30 transition-all"
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouveau mandat</span>
                </button>
              </div>
            </div>

            {/* Stats intégrées */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
                <p className="text-[10px] sm:text-xs text-white/70">Total</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                <div className="text-lg sm:text-2xl font-bold">{stats.a_faire}</div>
                <p className="text-[10px] sm:text-xs text-white/70">À faire</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                <div className="text-lg sm:text-2xl font-bold text-amber-300">{stats.en_cours}</div>
                <p className="text-[10px] sm:text-xs text-white/70">En cours</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                <div className={`text-lg sm:text-2xl font-bold ${overdueTasks.length > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                  {overdueTasks.length > 0 ? overdueTasks.length : stats.terminee}
                </div>
                <p className="text-[10px] sm:text-xs text-white/70">{overdueTasks.length > 0 ? 'En retard' : 'Terminées'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Onglets */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-1.5 mb-4 sm:mb-6 flex gap-1"
        >
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">Tâches</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              activeTab === 'tasks' ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {stats.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Calendrier</span>
          </button>
        </motion.div>

        {activeTab === 'tasks' && (
          <>
            {/* Barre de recherche et contrôles */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Recherche */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Contrôles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showFilters ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtres</span>
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'status')}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 focus:border-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="client">Client</option>
                    <option value="status">Statut</option>
                  </select>

                  <div className="flex bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                      title="Vue liste"
                    >
                      <LayoutList className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`p-1.5 rounded transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}
                      title="Vue kanban"
                    >
                      <LayoutGrid className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtres expandés */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Statut</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 text-slate-700"
                        >
                          <option value="all">Tous</option>
                          <option value="a_faire">À faire</option>
                          <option value="en_cours">En cours</option>
                          <option value="terminee">Terminée</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Type</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as TaskType | 'all')}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 text-slate-700"
                        >
                          <option value="all">Tous</option>
                          <option value="contenu">Contenu</option>
                          <option value="video">Vidéo</option>
                          <option value="reunion">Réunion</option>
                          <option value="reporting">Reporting</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

        {viewMode === 'list' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            {/* Header avec compteur */}
            {searchQuery && (
              <p className="text-sm text-slate-500 mb-3">
                {filteredAndSortedTasks.length} résultat{filteredAndSortedTasks.length !== 1 ? 's' : ''} pour "<span className="font-medium text-slate-700">{searchQuery}</span>"
              </p>
            )}

            {filteredAndSortedTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 sm:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <ListTodo className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Aucune tâche</h3>
                <p className="text-slate-500 text-sm">
                  {tasks.length === 0 
                    ? "Créez votre première tâche pour commencer" 
                    : "Aucune tâche ne correspond à vos critères"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedTasks.map((task: TaskWithDetails, index: number) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'terminee';
                  const isCompleted = task.status === 'terminee';
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group bg-white rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        isOverdue ? 'border-red-200 bg-red-50/30' : 
                        isCompleted ? 'border-emerald-200 bg-emerald-50/20' :
                        'border-slate-200/60 hover:border-slate-300'
                      }`}
                      onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                    >
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          {/* Indicateur de statut */}
                          <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                            task.status === 'terminee' ? 'bg-emerald-500' :
                            task.status === 'en_cours' ? 'bg-amber-500' :
                            isOverdue ? 'bg-red-500' : 'bg-slate-300'
                          }`} />

                          {/* Contenu principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className={`font-medium text-sm sm:text-base leading-tight ${
                                isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                              }`}>
                                {task.title}
                              </h3>
                              
                              {/* Badges */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {isOverdue && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="hidden sm:inline">Retard</span>
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                  task.status === 'terminee' ? 'bg-emerald-100 text-emerald-700' :
                                  task.status === 'en_cours' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {TASK_STATUS_LABELS[task.status]}
                                </span>
                              </div>
                            </div>
                            
                            {/* Métadonnées */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              <Link
                                href={`/clients/${task.client.id}`}
                                className="flex items-center hover:text-blue-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <User className="w-3 h-3 mr-1" />
                                {task.client.name}
                              </Link>
                              
                              <span className="flex items-center">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {task.mandat.title}
                              </span>

                              {task.due_date && (
                                <span className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(task.due_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                {TASK_TYPE_LABELS[task.type]}
                              </span>
                            </div>

                            {/* Description (si présente) */}
                            {task.details && (
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">
                                {task.details}
                              </p>
                            )}
                          </div>

                          {/* Chevron */}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
          >
            {/* Colonne À faire */}
            <div className="bg-slate-50/50 rounded-xl border border-slate-200/60 p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <div className="w-2 h-2 bg-slate-400 rounded-full" />
                <h3 className="font-semibold text-slate-700 text-sm">À faire</h3>
                <span className="ml-auto px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-medium">
                  {tasksByStatus.a_faire.length}
                </span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {tasksByStatus.a_faire.map((task: TaskWithDetails) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border ${
                        isOverdue ? 'border-red-200' : 'border-slate-100 hover:border-slate-300'
                      }`}
                      onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                    >
                      <h4 className="font-medium text-slate-900 text-sm mb-1.5 line-clamp-2">{task.title}</h4>
                      <p className="text-xs text-slate-500 mb-2">{task.client.name}</p>
                      <div className="flex items-center justify-between">
                        {task.due_date && (
                          <span className={`flex items-center text-xs ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.due_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
                          {TASK_TYPE_LABELS[task.type]}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {tasksByStatus.a_faire.length === 0 && (
                  <div className="text-center py-6">
                    <Circle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">Aucune tâche</p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne En cours */}
            <div className="bg-amber-50/30 rounded-xl border border-amber-200/60 p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-200/60">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <h3 className="font-semibold text-amber-800 text-sm">En cours</h3>
                <span className="ml-auto px-1.5 py-0.5 bg-amber-200 text-amber-700 rounded text-xs font-medium">
                  {tasksByStatus.en_cours.length}
                </span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {tasksByStatus.en_cours.map((task: TaskWithDetails) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-amber-100 hover:border-amber-300"
                    onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                  >
                    <h4 className="font-medium text-slate-900 text-sm mb-1.5 line-clamp-2">{task.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{task.client.name}</p>
                    <div className="flex items-center justify-between">
                      {task.due_date && (
                        <span className="flex items-center text-xs text-slate-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.due_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
                        {TASK_TYPE_LABELS[task.type]}
                      </span>
                    </div>
                  </div>
                ))}
                {tasksByStatus.en_cours.length === 0 && (
                  <div className="text-center py-6">
                    <Timer className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                    <p className="text-amber-400 text-xs">Aucune tâche</p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne Terminée */}
            <div className="bg-emerald-50/30 rounded-xl border border-emerald-200/60 p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-200/60">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <h3 className="font-semibold text-emerald-800 text-sm">Terminées</h3>
                <span className="ml-auto px-1.5 py-0.5 bg-emerald-200 text-emerald-700 rounded text-xs font-medium">
                  {tasksByStatus.terminee.length}
                </span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {tasksByStatus.terminee.map((task: TaskWithDetails) => (
                  <div
                    key={task.id}
                    className="bg-white/80 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-emerald-100 hover:border-emerald-300 opacity-75"
                    onClick={() => router.push(`/mandats/${task.mandat_id}`)}
                  >
                    <h4 className="font-medium text-slate-500 text-sm mb-1.5 line-clamp-2 line-through">{task.title}</h4>
                    <p className="text-xs text-slate-400 mb-2">{task.client.name}</p>
                    <div className="flex items-center justify-between">
                      {task.due_date && (
                        <span className="flex items-center text-xs text-slate-300">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.due_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] rounded font-medium">
                        {TASK_TYPE_LABELS[task.type]}
                      </span>
                    </div>
                  </div>
                ))}
                {tasksByStatus.terminee.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
                    <p className="text-emerald-400 text-xs">Aucune tâche</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
