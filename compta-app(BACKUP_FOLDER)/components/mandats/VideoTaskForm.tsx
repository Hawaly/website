// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Video } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  VideoTaskDetails, 
  VideoFigurant,
  VideoTaskDetailsInsert,
  VideoFigurantInsert
} from "@/types/database";

interface VideoTaskFormProps {
  taskId: number;
  onSaved: () => void;
}

export function VideoTaskForm({ taskId, onSaved }: VideoTaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [videoDetails, setVideoDetails] = useState<VideoTaskDetails | null>(null);
  const [figurants, setFigurants] = useState<VideoFigurant[]>([]);
  
  const [formData, setFormData] = useState({
    script: "",
    duration_minutes: "",
    location: "",
    notes: "",
  });

  const [newFigurant, setNewFigurant] = useState({
    name: "",
    contact: "",
    role: "",
    notes: "",
  });

  useEffect(() => {
    loadVideoData();
  }, [taskId]);

  async function loadVideoData() {
    try {
      setIsFetchingData(true);
      setError(null);

      const { data: videoData, error: videoError } = await supabase
        .from("video_task_details")
        .select("*")
        .eq("task_id", taskId)
        .single();

      if (videoError && videoError.code !== "PGRST116") {
        throw videoError;
      }

      if (videoData) {
        setVideoDetails(videoData);
        setFormData({
          script: videoData.script || "",
          duration_minutes: videoData.duration_minutes?.toString() || "",
          location: videoData.location || "",
          notes: videoData.notes || "",
        });

        const { data: figurantsData, error: figurantsError } = await supabase
          .from("video_figurant")
          .select("*")
          .eq("video_task_id", videoData.id)
          .order("created_at", { ascending: true });

        if (figurantsError) throw figurantsError;

        setFigurants(figurantsData || []);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement des données vidéo");
    } finally {
      setIsFetchingData(false);
    }
  }

  async function handleSaveVideoDetails(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const dataToSave = {
        task_id: taskId,
        script: formData.script.trim() || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        location: formData.location.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (videoDetails) {
        const { error: updateError } = await supabase
          .from("video_task_details")
          .update(dataToSave)
          .eq("id", videoDetails.id);

        if (updateError) throw updateError;
      } else {
        const { data: newVideoData, error: insertError } = await supabase
          .from("video_task_details")
          .insert([dataToSave as VideoTaskDetailsInsert])
          .select()
          .single();

        if (insertError) throw insertError;
        
        setVideoDetails(newVideoData);
      }

      onSaved();
      loadVideoData();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddFigurant(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newFigurant.name.trim()) {
      setError("Le nom du figurant est obligatoire");
      return;
    }

    if (!videoDetails) {
      setError("Veuillez d'abord enregistrer les détails de la vidéo");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const figurantData: VideoFigurantInsert = {
        video_task_id: videoDetails.id,
        name: newFigurant.name.trim(),
        contact: newFigurant.contact.trim() || null,
        role: newFigurant.role.trim() || null,
        notes: newFigurant.notes.trim() || null,
      };

      const { error: insertError } = await supabase
        .from("video_figurant")
        .insert([figurantData]);

      if (insertError) throw insertError;

      setNewFigurant({ name: "", contact: "", role: "", notes: "" });
      loadVideoData();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors de l'ajout du figurant");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteFigurant(figurantId: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce figurant ?")) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("video_figurant")
        .delete()
        .eq("id", figurantId);

      if (deleteError) throw deleteError;

      loadVideoData();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Erreur lors de la suppression du figurant");
    }
  }

  if (isFetchingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">Détails de la vidéo</h3>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
          <p className="text-red-900 font-semibold text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSaveVideoDetails} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Script de la vidéo
          </label>
          <textarea
            value={formData.script}
            onChange={(e) => setFormData({ ...formData, script: e.target.value })}
            rows={8}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-gray-900 font-medium"
            placeholder="Décrivez le script de la vidéo..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Durée (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              min="0"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-gray-900 font-medium"
              placeholder="Ex: 5"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Lieu de tournage
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-gray-900 font-medium"
              placeholder="Ex: Studio, Extérieur..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Notes supplémentaires
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-gray-900 font-medium"
            placeholder="Notes, consignes particulières..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les détails vidéo"
          )}
        </button>
      </form>

      <div className="border-t-2 border-gray-200 pt-6 mt-6">
        <h4 className="text-md font-bold text-gray-900 mb-4">
          Figurants ({figurants.length})
        </h4>

        {!videoDetails && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
            <p className="text-yellow-900 font-semibold text-sm">
              Enregistrez d'abord les détails de la vidéo avant d'ajouter des figurants.
            </p>
          </div>
        )}

        {videoDetails && (
          <form onSubmit={handleAddFigurant} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">Ajouter un figurant</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Nom <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newFigurant.name}
                  onChange={(e) => setNewFigurant({ ...newFigurant, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900 font-medium text-sm"
                  placeholder="Nom du figurant"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={newFigurant.contact}
                  onChange={(e) => setNewFigurant({ ...newFigurant, contact: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900 font-medium text-sm"
                  placeholder="Email ou téléphone"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Rôle
                </label>
                <input
                  type="text"
                  value={newFigurant.role}
                  onChange={(e) => setNewFigurant({ ...newFigurant, role: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900 font-medium text-sm"
                  placeholder="Ex: Acteur principal, Figurant..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={newFigurant.notes}
                  onChange={(e) => setNewFigurant({ ...newFigurant, notes: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900 font-medium text-sm"
                  placeholder="Notes supplémentaires"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter le figurant
            </button>
          </form>
        )}

        {figurants.length > 0 && (
          <div className="space-y-3">
            {figurants.map((figurant) => (
              <div
                key={figurant.id}
                className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 mb-1">{figurant.name}</h5>
                    
                    <div className="space-y-1 text-sm">
                      {figurant.role && (
                        <p className="text-gray-700">
                          <span className="font-bold">Rôle:</span> {figurant.role}
                        </p>
                      )}
                      
                      {figurant.contact && (
                        <p className="text-gray-700">
                          <span className="font-bold">Contact:</span> {figurant.contact}
                        </p>
                      )}
                      
                      {figurant.notes && (
                        <p className="text-gray-700">
                          <span className="font-bold">Notes:</span> {figurant.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFigurant(figurant.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer ce figurant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {figurants.length === 0 && videoDetails && (
          <p className="text-center text-gray-600 font-medium text-sm py-4">
            Aucun figurant ajouté pour cette vidéo
          </p>
        )}
      </div>
    </div>
  );
}
