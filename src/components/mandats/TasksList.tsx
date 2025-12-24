"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Loader2, Check, Clock, Square } from "lucide-react";
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Tâches ({tasks.length})
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle tâche</span>
          </button>
        )}
      </div>

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
}

function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200 hover:border-blue-400 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
        <button
          onClick={() => onEdit(task)}
          className="text-blue-700 hover:text-blue-900 text-xs font-bold hover:underline"
        >
          Modifier
        </button>
      </div>

      {task.details && (
        <p className="text-sm text-gray-700 mb-3 font-medium">{task.details}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-700 font-bold">
          {TASK_TYPE_LABELS[task.type]}
        </span>
        {task.due_date && (
          <div className="flex items-center text-gray-700 font-medium">
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

