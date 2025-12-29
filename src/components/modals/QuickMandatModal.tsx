"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, User, Briefcase, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { MandatStatus } from "@/types/database";

interface QuickMandatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  id: number;
  name: string;
}

export function QuickMandatModal({ isOpen, onClose, onSuccess }: QuickMandatModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mandat_type: "",
    status: "en_cours" as MandatStatus,
    start_date: "",
    end_date: "",
    client_id: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    const { data } = await supabase.from("client").select("id, name").order("name");
    setClients(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.client_id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("mandat").insert({
        client_id: parseInt(formData.client_id),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        mandat_type: formData.mandat_type.trim() || null,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      });

      if (error) throw error;

      setFormData({
        title: "",
        description: "",
        mandat_type: "",
        status: "en_cours",
        start_date: "",
        end_date: "",
        client_id: ""
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création du mandat:", error);
      alert("Erreur lors de la création du mandat");
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
              <h2 className="text-2xl font-bold text-white">Nouveau mandat</h2>
              <p className="text-white/90 text-sm mt-1">Créer un mandat rapidement</p>
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
              Titre du mandat *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              placeholder="Ex: Gestion réseaux sociaux Q1 2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Type de mandat
            </label>
            <input
              type="text"
              value={formData.mandat_type}
              onChange={(e) => setFormData({ ...formData, mandat_type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              placeholder="Ex: Social Media, SEO, Community Management..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-gray-900 font-medium resize-none"
              placeholder="Décrire le mandat, les objectifs, le scope..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MandatStatus })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              >
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date début
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date fin
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
                min={formData.start_date}
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
                "Créer le mandat"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
