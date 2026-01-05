"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from '@/components/layout/Header';
import { Plus, Search, Package, Eye, Pencil, Trash2, Star, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { ServicePackageWithFeatures } from "@/types/service-packages";
import { BILLING_FREQUENCY_LABELS } from "@/types/service-packages";

export default function PackagesPage() {
  const [packages, setPackages] = useState<ServicePackageWithFeatures[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ServicePackageWithFeatures[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    filterPackages();
  }, [packages, searchTerm, showActiveOnly]);

  async function loadPackages() {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("service_package")
        .select(`
          *,
          features:package_feature(*)
        `)
        .order("display_order", { ascending: true });

      if (fetchError) throw fetchError;

      setPackages(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement des packs");
    } finally {
      setIsLoading(false);
    }
  }

  function filterPackages() {
    let filtered = [...packages];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(term) ||
          pkg.slug.toLowerCase().includes(term) ||
          pkg.description?.toLowerCase().includes(term)
      );
    }

    if (showActiveOnly) {
      filtered = filtered.filter((pkg) => pkg.is_active);
    }

    setFilteredPackages(filtered);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le pack "${name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      await loadPackages();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header title="Packs de Services" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec actions */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-brand-orange" />
              Packs de Services
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos forfaits avec templates de mandat et facturation
            </p>
          </div>

          <Link
            href="/packages/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl hover:shadow-brand-lg transition-all duration-300 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nouveau Pack
          </Link>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un pack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
            />
          </div>

          <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-orange transition-all">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-brand-orange rounded focus:ring-brand-orange"
            />
            <span className="text-sm font-medium text-gray-700">Actifs uniquement</span>
          </label>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total packs</p>
                <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
              </div>
              <Package className="w-8 h-8 text-brand-orange" />
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Packs actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {packages.filter(p => p.is_active).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Packs visibles</p>
                <p className="text-2xl font-bold text-blue-600">
                  {packages.filter(p => p.is_visible).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
            <p className="font-medium">Erreur:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Liste des packs */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700">Aucun pack trouvé</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || showActiveOnly
                ? "Essayez de modifier vos filtres"
                : "Créez votre premier pack de services"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-brand-orange hover:shadow-brand transition-all duration-300 overflow-hidden group"
              >
                {/* Header avec badge */}
                <div className={`bg-gradient-to-r ${pkg.color || 'from-gray-600 to-gray-500'} p-4 relative`}>
                  {pkg.badge && (
                    <div className="absolute top-2 right-2 bg-white text-xs font-bold px-2 py-1 rounded">
                      {pkg.badge}
                    </div>
                  )}
                  {pkg.is_featured && (
                    <Star className="absolute top-2 left-2 w-5 h-5 text-yellow-300 fill-yellow-300" />
                  )}
                  <div className="flex items-center gap-2 text-white">
                    <Package className="w-6 h-6" />
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                  </div>
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">
                    {pkg.tagline || pkg.description}
                  </p>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Prix */}
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                    <span className="text-gray-600 ml-1">{pkg.currency}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {BILLING_FREQUENCY_LABELS[pkg.billing_frequency]}
                    </span>
                  </div>

                  {/* Features count */}
                  {pkg.features && pkg.features.length > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                      ✓ {pkg.features.length} feature{pkg.features.length > 1 ? 's' : ''} incluse{pkg.features.length > 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      pkg.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {pkg.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      pkg.is_visible 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {pkg.is_visible ? 'Visible' : 'Caché'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/packages/${pkg.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark transition-all font-medium"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
