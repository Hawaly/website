"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Calendar, Loader2, Check, Clock, Square, Video, Filter, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MandatTask, 
  TASK_TYPE_LABELS, 
  TaskStatus
} from "@/types/database";
import { TaskForm } from "./TaskForm";
import { VideoTaskForm } from "./VideoTaskForm";

interface TasksListProps {
  mandatId: number;
}

export function TasksList({ mandatId }: TasksListProps) {
  const [tasks, setTasks] = useState<MandatTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<MandatTask | null>(null);
  const [showVideoDetails, setShowVideoDetails] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

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

  const handleShowVideoDetails = (taskId: number) => {
    setShowVideoDetails(taskId);
  };

  const handleCloseVideoDetails = () => {
    setShowVideoDetails(null);
    loadTasks();
  };

  async function handleDeleteTask(taskId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('mandat_task')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;

      loadTasks();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Erreur lors de la suppression de la tâche');
    }
  }

  function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  function getDaysUntilDue(dueDate: string | null): number | null {
    if (!dueDate) return null;
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Filtrer et trier les tâches avec useMemo pour optimisation
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Trier
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        // Priorité aux tâches avec date d'échéance
        if (!a.due_date && b.due_date) return 1;
        if (a.due_date && !b.due_date) return -1;
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [tasks, filterType, sortBy]);

  // Regrouper les tâches par statut
  const tasksByStatus = useMemo(() => ({
    a_faire: filteredTasks.filter(t => t.status === 'a_faire'),
    en_cours: filteredTasks.filter(t => t.status === 'en_cours'),
    terminee: filteredTasks.filter(t => t.status === 'terminee'),
  }), [filteredTasks]);

  // Statistiques
  const stats = useMemo(() => {
    const overdueTasks = filteredTasks.filter(t => 
      t.status !== 'terminee' && isOverdue(t.due_date)
    );
    return {
      total: filteredTasks.length,
      overdue: overdueTasks.length,
    };
  }, [filteredTasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <p className="text-red-900 font-semibold text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Tâches ({filteredTasks.length})
            </h2>
            {stats.overdue > 0 && (
              <div className="flex items-center gap-1 mt-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-bold">{stats.overdue} en retard</span>
              </div>
            )}
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle tâche</span>
            </button>
          )}
        </div>

        {/* Filtres et tri */}
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-bold text-gray-900">Filtres & Tri</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Type de tâche</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-sm font-medium text-gray-900"
              >
                <option value="all">Tous les types</option>
                <option value="contenu">Contenu</option>
                <option value="video">Vidéo</option>
                <option value="reunion">Réunion</option>
                <option value="reporting">Reporting</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-sm font-medium text-gray-900"
              >
                <option value="date">Date d'échéance</option>
                <option value="title">Titre (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de détails vidéo */}
      {showVideoDetails && (
        <div className="mb-6 p-6 bg-purple-50 border-2 border-purple-300 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Détails de la vidéo
          </h3>
          <VideoTaskForm
            taskId={showVideoDetails}
            onSaved={handleCloseVideoDetails}
          />
          <div className="mt-4">
            <button
              onClick={handleCloseVideoDetails}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
          </h3>
          <TaskForm
            mandatId={mandatId}
            task={editingTask || undefined}
            mode={editingTask ? "edit" : "create"}
            onSaved={handleTaskSaved}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Vue Kanban simplifiée */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* À faire */}
        <div>
          <div className="bg-gray-100 rounded-lg p-3 mb-3 border-2 border-gray-400">
            <div className="flex items-center space-x-2">
              <Square className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-900">À faire ({tasksByStatus.a_faire.length})</h3>
            </div>
          </div>
          <div className="space-y-3">
            {tasksByStatus.a_faire.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onShowVideoDetails={handleShowVideoDetails}
                onDelete={handleDeleteTask}
                isOverdue={isOverdue(task.due_date)}
                daysUntilDue={getDaysUntilDue(task.due_date)}
              />
            ))}
            {tasksByStatus.a_faire.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-4 font-medium">Aucune tâche</p>
            )}
          </div>
        </div>

        {/* En cours */}
        <div>
          <div className="bg-blue-100 rounded-lg p-3 mb-3 border-2 border-blue-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-gray-900">En cours ({tasksByStatus.en_cours.length})</h3>
            </div>
          </div>
          <div className="space-y-3">
            {tasksByStatus.en_cours.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onShowVideoDetails={handleShowVideoDetails}
                onDelete={handleDeleteTask}
                isOverdue={isOverdue(task.due_date)}
                daysUntilDue={getDaysUntilDue(task.due_date)}
              />
            ))}
            {tasksByStatus.en_cours.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-4 font-medium">Aucune tâche</p>
            )}
          </div>
        </div>

        {/* Terminées */}
        <div>
          <div className="bg-green-100 rounded-lg p-3 mb-3 border-2 border-green-600">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-700" />
              <h3 className="font-bold text-gray-900">Terminées ({tasksByStatus.terminee.length})</h3>
            </div>
          </div>
          <div className="space-y-3">
            {tasksByStatus.terminee.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onShowVideoDetails={handleShowVideoDetails}
                onDelete={handleDeleteTask}
                isOverdue={isOverdue(task.due_date)}
                daysUntilDue={getDaysUntilDue(task.due_date)}
              />
            ))}
            {tasksByStatus.terminee.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-4 font-medium">Aucune tâche</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant carte de tâche
interface TaskCardProps {
  task: MandatTask;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onEdit: (task: MandatTask) => void;
  onShowVideoDetails: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  isOverdue: boolean;
  daysUntilDue: number | null;
}

function TaskCard({ task, onStatusChange, onEdit, onShowVideoDetails, onDelete, isOverdue, daysUntilDue }: TaskCardProps) {
  const getDeadlineBadge = () => {
    if (!task.due_date) return null;
    
    if (isOverdue) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 border-2 border-red-600 rounded text-xs font-bold text-red-900">
          <AlertCircle className="w-3 h-3" />
          En retard
        </div>
      );
    }
    
    if (daysUntilDue !== null && daysUntilDue <= 3) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 border-2 border-orange-600 rounded text-xs font-bold text-orange-900">
          <Clock className="w-3 h-3" />
          {daysUntilDue}j restant{daysUntilDue > 1 ? 's' : ''}
        </div>
      );
    }
    
    return null;
  };
  return (
    <div className={`bg-white rounded-lg p-4 shadow-md border-2 transition-all hover:shadow-lg ${
      isOverdue ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-blue-400'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
          {getDeadlineBadge()}
        </div>
        <div className="flex gap-2 ml-2">
          {task.type === 'video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowVideoDetails(task.id);
              }}
              className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 p-1 rounded transition-colors"
              title="Gérer les détails vidéo"
            >
              <Video className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 p-1 rounded transition-colors"
            title="Modifier"
          >
            <span className="text-xs font-bold">✏️</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-red-700 hover:text-red-900 hover:bg-red-50 p-1 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {task.details && (
        <p className="text-sm text-gray-700 mb-3 font-medium">{task.details}</p>
      )}

      <div className="flex items-center justify-between text-xs mb-3">
        <span className="px-2 py-1 bg-gray-100 text-gray-900 font-bold rounded border border-gray-300">
          {TASK_TYPE_LABELS[task.type]}
        </span>
        {task.due_date && (
          <div className={`flex items-center font-medium ${
            isOverdue ? 'text-red-700' : 'text-gray-700'
          }`}>
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(task.due_date).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>

      {/* Changement rapide de statut */}
      <div className="mt-3 pt-3 border-t-2 border-gray-100">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="w-full px-3 py-1.5 border-2 border-gray-300 rounded text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="a_faire">À faire</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
        </select>
      </div>
    </div>
  );
}

