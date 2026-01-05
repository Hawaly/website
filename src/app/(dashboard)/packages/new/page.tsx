"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from '@/components/layout/Header';
import { Package, Save, X, AlertCircle } from "lucide-react";
import type { ServicePackageInsert } from "@/types/service-packages";
import { BILLING_FREQUENCY_LABELS } from "@/types/service-packages";

export default function NewPackagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ServicePackageInsert>>({
    name: "",
    slug: "",
    description: "",
    tagline: "",
    price: 0,
    currency: "CHF",
    billing_frequency: "one_time",
    color: "from-orange-600 to-orange-500",
    icon: "Package",
    badge: "",
    is_featured: false,
    is_active: true,
    is_visible: true,
    display_order: 0,
  });

  function handleChange(field: keyof ServicePackageInsert, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-générer le slug depuis le nom
    if (field === 'name' && typeof value === 'string') {
      const autoSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name || !formData.slug || formData.price === undefined) {
        throw new Error("Veuillez remplir tous les champs requis");
      }

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création du pack');
      }

      // Rediriger vers la page d'édition pour ajouter features, etc.
      router.push(`/packages/${result.package.id}`);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header title="Nouveau Pack de Services" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-brand-orange" />
            Nouveau Pack de Services
          </h1>
          <p className="text-gray-600 mt-2">
            Créez un nouveau forfait avec templates personnalisés
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Erreur</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Informations de base</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du pack <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                placeholder="Pack de 10 Posts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all font-mono text-sm"
                placeholder="pack-10-posts"
              />
              <p className="text-xs text-gray-500 mt-1">Généré automatiquement depuis le nom</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline (accroche courte)
              </label>
              <input
                type="text"
                value={formData.tagline || ""}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                placeholder="Stratégie marketing complète + 10 posts par mois"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all resize-none"
                placeholder="Description détaillée du pack..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Tarification</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                  maxLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence
                </label>
                <select
                  value={formData.billing_frequency}
                  onChange={(e) => handleChange('billing_frequency', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                >
                  {Object.entries(BILLING_FREQUENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Apparence */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Apparence</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur (gradient Tailwind)
                </label>
                <select
                  value={formData.color ?? "from-orange-600 to-orange-500"}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                >
                  <option value="from-orange-600 to-orange-500">🟠 Orange</option>
                  <option value="from-blue-600 to-blue-500">🔵 Bleu</option>
                  <option value="from-green-600 to-green-500">🟢 Vert</option>
                  <option value="from-purple-600 to-purple-500">🟣 Violet</option>
                  <option value="from-red-600 to-red-500">🔴 Rouge</option>
                  <option value="from-gray-600 to-gray-500">⚫ Gris</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône (Lucide)
                </label>
                <input
                  type="text"
                  value={formData.icon ?? ""}
                  onChange={(e) => handleChange('icon', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                  placeholder="Package, Zap, TrendingUp..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badge (optionnel)
              </label>
              <input
                type="text"
                value={formData.badge || ""}
                onChange={(e) => handleChange('badge', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                placeholder="MEILLEURE VALEUR, POPULAIRE..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Les packs sont affichés par ordre croissant</p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Options</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                  className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange"
                />
                <span className="text-sm font-medium text-gray-700">Pack en vedette ⭐</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange"
                />
                <span className="text-sm font-medium text-gray-700">Pack actif</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => handleChange('is_visible', e.target.checked)}
                  className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange"
                />
                <span className="text-sm font-medium text-gray-700">Visible sur le site public</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl hover:shadow-brand-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Créer le Pack
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
