"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, User, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { TaskType, TaskStatus } from "@/types/database";

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  id: number;
  name: string;
}

interface Mandat {
  id: number;
  title: string;
  client_id: number;
}

export function QuickTaskModal({ isOpen, onClose, onSuccess }: QuickTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [filteredMandats, setFilteredMandats] = useState<Mandat[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    type: "contenu" as TaskType,
    status: "a_faire" as TaskStatus,
    due_date: "",
    client_id: "",
    mandat_id: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadMandats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.client_id) {
      const filtered = mandats.filter(m => m.client_id === parseInt(formData.client_id));
      setFilteredMandats(filtered);
      if (!filtered.find(m => m.id === parseInt(formData.mandat_id))) {
        setFormData(prev => ({ ...prev, mandat_id: "" }));
      }
    } else {
      setFilteredMandats([]);
    }
  }, [formData.client_id, mandats]);

  const loadClients = async () => {
    const { data } = await supabase.from("client").select("id, name").order("name");
    setClients(data || []);
  };

  const loadMandats = async () => {
    const { data } = await supabase.from("mandat").select("id, title, client_id").order("title");
    setMandats(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.mandat_id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("mandat_task").insert({
        mandat_id: parseInt(formData.mandat_id),
        title: formData.title.trim(),
        details: formData.details.trim() || null,
        type: formData.type,
        status: formData.status,
        due_date: formData.due_date || null
      });

      if (error) throw error;

      setFormData({
        title: "",
        details: "",
        type: "contenu",
        status: "a_faire",
        due_date: "",
        client_id: "",
        mandat_id: ""
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      alert("Erreur lors de la création de la tâche");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-brand-orange to-brand-orange-light p-6 border-b-4 border-brand-orange">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Nouvelle tâche</h2>
              <p className="text-white/90 text-sm mt-1">Créer une tâche rapidement</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Client *
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Mandat *
            </label>
            <select
              value={formData.mandat_id}
              onChange={(e) => setFormData({ ...formData, mandat_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              required
              disabled={!formData.client_id}
            >
              <option value="">Sélectionner un mandat</option>
              {filteredMandats.map(mandat => (
                <option key={mandat.id} value={mandat.id}>{mandat.title}</option>
              ))}
            </select>
            {formData.client_id && filteredMandats.length === 0 && (
              <p className="text-sm text-orange-600 mt-1 font-medium">Aucun mandat pour ce client</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Titre de la tâche *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              placeholder="Ex: Créer le contenu pour Instagram"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Détails
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900 font-medium resize-none"
              placeholder="Ajouter des détails..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              >
                <option value="contenu">Contenu</option>
                <option value="video">Vidéo</option>
                <option value="reunion">Réunion</option>
                <option value="reporting">Reporting</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              >
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Échéance
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer la tâche"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
