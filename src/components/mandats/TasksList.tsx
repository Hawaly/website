"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  Loader2, 
  Check, 
  Clock, 
  Circle,
  MoreHorizontal,
  Edit3,
  Trash2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Timer,
  X,
  GripVertical
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MandatTask, 
  TASK_TYPE_LABELS, 
  TaskStatus
} from "@/types/database";
import { TaskForm } from "./TaskForm";

interface TasksListProps {
  mandatId: number;
}

export function TasksList({ mandatId }: TasksListProps) {
  const [tasks, setTasks] = useState<MandatTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<MandatTask | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'a_faire' | 'en_cours' | 'terminee'>('all');

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mandatId]);

  async function loadTasks() {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("mandat_task")
        .select("*")
        .eq("mandat_id", mandatId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTasks(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement des tâches");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(taskId: number, newStatus: TaskStatus) {
    try {
      const { error: updateError } = await supabase
        .from("mandat_task")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (updateError) throw updateError;

      // Recharger les tâches
      loadTasks();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Erreur lors de la mise à jour du statut");
    }
  }

  const handleTaskSaved = () => {
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleEdit = (task: MandatTask) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Regrouper les tâches par statut
  const tasksByStatus = {
    a_faire: tasks.filter(t => t.status === 'a_faire'),
    en_cours: tasks.filter(t => t.status === 'en_cours'),
    terminee: tasks.filter(t => t.status === 'terminee'),
  };

  // Filtrer selon l'onglet actif
  const filteredTasks = activeTab === 'all' ? tasks : tasksByStatus[activeTab];

  // Compter les tâches en retard
  const overdueTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'terminee'
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs de filtrage */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Toutes
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            activeTab === 'all' ? 'bg-white/20' : 'bg-slate-200'
          }`}>{tasks.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('a_faire')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'a_faire'
              ? 'bg-slate-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Circle className="w-3 h-3" />
          À faire
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            activeTab === 'a_faire' ? 'bg-white/20' : 'bg-slate-200'
          }`}>{tasksByStatus.a_faire.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('en_cours')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'en_cours'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <Timer className="w-3 h-3" />
          En cours
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            activeTab === 'en_cours' ? 'bg-white/20' : 'bg-amber-100'
          }`}>{tasksByStatus.en_cours.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('terminee')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'terminee'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          Terminées
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            activeTab === 'terminee' ? 'bg-white/20' : 'bg-emerald-100'
          }`}>{tasksByStatus.terminee.length}</span>
        </button>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        )}
      </div>

      {/* Alerte tâches en retard */}
      {overdueTasks > 0 && activeTab !== 'terminee' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700">
            <strong>{overdueTasks}</strong> tâche(s) en retard
          </span>
        </motion.div>
      )}

      {/* Formulaire de création/édition */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-500" />
                  {editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
                </h3>
                <button
                  onClick={handleCancelForm}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <TaskForm
                mandatId={mandatId}
                task={editingTask || undefined}
                mode={editingTask ? "edit" : "create"}
                onSaved={handleTaskSaved}
                onCancel={handleCancelForm}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des tâches */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">Aucune tâche</p>
              {activeTab !== 'all' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-2 text-blue-500 text-sm hover:underline"
                >
                  Voir toutes les tâches
                </button>
              )}
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Composant carte de tâche
interface TaskCardProps {
  task: MandatTask;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onEdit: (task: MandatTask) => void;
}

function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'terminee';
  const isCompleted = task.status === 'terminee';

  const statusConfig = {
    a_faire: { 
      icon: Circle, 
      color: 'text-slate-400', 
      bg: 'bg-slate-100',
      label: 'À faire'
    },
    en_cours: { 
      icon: Timer, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      label: 'En cours'
    },
    terminee: { 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      label: 'Terminée'
    },
  };

  const currentStatus = statusConfig[task.status];
  const StatusIcon = currentStatus.icon;

  const handleStatusClick = () => {
    // Cycle à travers les statuts
    const statusOrder: TaskStatus[] = ['a_faire', 'en_cours', 'terminee'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
      isOverdue ? 'border-red-200 bg-red-50/30' : 
      isCompleted ? 'border-emerald-200 bg-emerald-50/30' : 
      'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Bouton de statut */}
          <button
            onClick={handleStatusClick}
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 ${currentStatus.bg}`}
            title={`Statut: ${currentStatus.label} (cliquez pour changer)`}
          >
            <StatusIcon className={`w-4 h-4 ${currentStatus.color}`} />
          </button>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`font-medium text-sm leading-tight ${
                isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}>
                {task.title}
              </h4>
              
              {/* Menu d'actions */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)} 
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[120px]">
                      <button
                        onClick={() => { onEdit(task); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                      <button
                        onClick={() => { 
                          onStatusChange(task.id, 'terminee');
                          setShowMenu(false); 
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Terminer
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {task.details && (
              <p className={`text-xs mt-1 line-clamp-2 ${
                isCompleted ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {task.details}
              </p>
            )}

            {/* Métadonnées */}
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {/* Type de tâche */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                {TASK_TYPE_LABELS[task.type]}
              </span>

              {/* Date d'échéance */}
              {task.due_date && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                  isOverdue 
                    ? 'bg-red-100 text-red-700' 
                    : isCompleted
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(task.due_date).toLocaleDateString("fr-FR", {
                    day: 'numeric',
                    month: 'short'
                  })}
                  {isOverdue && <AlertTriangle className="w-3 h-3 ml-0.5" />}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression du statut */}
      <div className="h-1 bg-slate-100 rounded-b-xl overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            task.status === 'terminee' ? 'w-full bg-emerald-500' :
            task.status === 'en_cours' ? 'w-1/2 bg-amber-500' :
            'w-0'
          }`}
        />
      </div>
    </div>
  );
}

