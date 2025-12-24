"use client";

import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { MandatTask, MandatTaskInsert, TaskType, TaskStatus } from "@/types/database";

interface TaskFormProps {
  mandatId: number;
  task?: MandatTask;
  mode: "create" | "edit";
  onSaved: () => void;
  onCancel: () => void;
}

export function TaskForm({ mandatId, task, mode, onSaved, onCancel }: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: task?.title || "",
    details: task?.details || "",
    type: task?.type || ("autre" as TaskType),
    status: task?.status || ("a_faire" as TaskStatus),
    due_date: task?.due_date || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error("Le titre de la tâche est obligatoire");
      }

      const dataToSave: MandatTaskInsert = {
        mandat_id: mandatId,
        title: formData.title.trim(),
        details: formData.details.trim() || null,
        type: formData.type,
        status: formData.status,
        due_date: formData.due_date || null,
      };

      if (mode === "create") {
        const { error: insertError } = await supabase
          .from("mandat_task")
          .insert([dataToSave]);

        if (insertError) throw insertError;
      } else {
        if (!task) throw new Error("Tâche non définie");

        const { error: updateError } = await supabase
          .from("mandat_task")
          .update(dataToSave)
          .eq("id", task.id);

        if (updateError) throw updateError;
      }

      onSaved();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
          <p className="text-red-900 font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Titre */}
      <div>
        <label htmlFor="task_title" className="block text-sm font-bold text-gray-900 mb-2">
          Titre de la tâche <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="task_title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          placeholder="Ex: Rédiger article de blog"
          required
          disabled={isLoading}
        />
      </div>

      {/* Détails */}
      <div>
        <label htmlFor="task_details" className="block text-sm font-bold text-gray-900 mb-2">
          Détails
        </label>
        <textarea
          id="task_details"
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          placeholder="Informations supplémentaires..."
          disabled={isLoading}
        />
      </div>

      {/* Type et Statut */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task_type" className="block text-sm font-bold text-gray-900 mb-2">
            Type <span className="text-red-600">*</span>
          </label>
          <select
            id="task_type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
            required
            disabled={isLoading}
          >
            <option value="contenu">Contenu</option>
            <option value="video">Vidéo</option>
            <option value="reunion">Réunion</option>
            <option value="reporting">Reporting</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <label htmlFor="task_status" className="block text-sm font-bold text-gray-900 mb-2">
            Statut <span className="text-red-600">*</span>
          </label>
          <select
            id="task_status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
            required
            disabled={isLoading}
          >
            <option value="a_faire">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
          </select>
        </div>
      </div>

      {/* Date d'échéance */}
      <div>
        <label htmlFor="task_due_date" className="block text-sm font-bold text-gray-900 mb-2">
          Date d&apos;échéance
        </label>
        <input
          type="date"
          id="task_due_date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          disabled={isLoading}
        />
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Annuler</span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{mode === "create" ? "Créer" : "Enregistrer"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

