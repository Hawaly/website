"use client";

import { useState, useEffect } from "react";
import { Building2, Mail, Phone, MapPin, Globe, CreditCard, User, Save, Loader2 } from "lucide-react";
import type { CompanySettings } from "@/types/database";

export function CompanySettingsForm() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company-settings');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur chargement settings');
      }

      setSettings(result.settings);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/company-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur sauvegarde');
      }

      setSuccess('Paramètres sauvegardés avec succès !');
      setSettings(result.settings);

      // Masquer le message après 3 secondes
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleChange(field: keyof CompanySettings, value: string | null) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Impossible de charger les paramètres</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-medium">Erreur:</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-700">
          <p className="font-medium">✅ {success}</p>
        </div>
      )}

      {/* Informations générales */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Informations générales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'agence
            </label>
            <input
              type="text"
              value={settings.agency_name || ''}
              onChange={(e) => handleChange('agency_name', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="YourStory Agency"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Représenté par
            </label>
            <input
              type="text"
              value={settings.represented_by || ''}
              onChange={(e) => handleChange('represented_by', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Nom du représentant"
            />
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Adresse
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rue
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Rue de la Paix 15"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <input
                type="text"
                value={settings.zip_code || ''}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={settings.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Neuchâtel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <input
                type="text"
                value={settings.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Suisse"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="contact@yourstory.ch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={settings.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="078 202 33 09"
            />
          </div>
        </div>
      </div>

      {/* Informations bancaires */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-600" />
          Informations bancaires
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IBAN
            </label>
            <input
              type="text"
              value={settings.iban || ''}
              onChange={(e) => handleChange('iban', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
              placeholder="CH00 0000 0000 0000 0000 0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR-IBAN
            </label>
            <input
              type="text"
              value={settings.qr_iban || ''}
              onChange={(e) => handleChange('qr_iban', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
              placeholder="CH44 3199 9123 0008 8901 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro TVA (optionnel)
            </label>
            <input
              type="text"
              value={settings.tva_number || ''}
              onChange={(e) => handleChange('tva_number', e.target.value || null)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="CHE-123.456.789"
            />
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Sauvegarder
            </>
          )}
        </button>
      </div>
    </form>
  );
}
