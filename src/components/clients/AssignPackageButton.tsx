"use client";

import { useState, useEffect } from "react";
import { Package, X, Check, Loader2, Sparkles } from "lucide-react";
import type { ServicePackageWithFeatures } from "@/types/service-packages";
import { BILLING_FREQUENCY_LABELS } from "@/types/service-packages";

interface AssignPackageButtonProps {
  clientId: number;
  clientName: string;
  onSuccess?: () => void;
}

export function AssignPackageButton({ clientId, clientName, onSuccess }: AssignPackageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [packages, setPackages] = useState<ServicePackageWithFeatures[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  async function loadPackages() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/packages?active=true&include_features=true');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur chargement packs');
      }

      setPackages(result.packages || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAssignPackage(packageId: number) {
    try {
      setIsAssigning(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}/assign-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur assignation pack');
      }

      alert(`✅ Pack assigné avec succès !\n\n📋 Mandat créé\n💰 ${result.data.invoicesCount} facture(s) créée(s)\n✅ ${result.data.tasksCount} tâche(s) créée(s)`);
      
      setIsOpen(false);
      if (onSuccess) onSuccess();
      
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsAssigning(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
      >
        <Sparkles className="w-5 h-5" />
        Assigner un Pack
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Assigner un Pack</h2>
              <p className="text-purple-100 text-sm">Pour {clientName}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
              <p className="font-medium">Erreur:</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun pack actif disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                🚀 <strong>Automation complète :</strong> En sélectionnant un pack, le système créera automatiquement :
                le mandat, les factures (selon la fréquence), et toutes les tâches définies dans le pack.
              </p>

              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border-2 rounded-xl p-5 transition-all cursor-pointer ${
                    selectedPackageId === pkg.id
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPackageId(pkg.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                        {pkg.badge && (
                          <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      {pkg.tagline && (
                        <p className="text-gray-600 mb-2">{pkg.tagline}</p>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                        <span className="text-gray-600">{pkg.currency}</span>
                        <span className="text-sm text-gray-500">
                          {BILLING_FREQUENCY_LABELS[pkg.billing_frequency]}
                        </span>
                      </div>
                    </div>

                    {selectedPackageId === pkg.id && (
                      <div className="p-2 bg-purple-600 rounded-full">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Inclus dans ce pack :
                      </p>
                      <ul className="space-y-1">
                        {pkg.features.slice(0, 5).map((feature) => (
                          <li key={feature.id} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{feature.title}</span>
                          </li>
                        ))}
                        {pkg.features.length > 5 && (
                          <li className="text-sm text-gray-500 ml-6">
                            + {pkg.features.length - 5} autres features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={() => selectedPackageId && handleAssignPackage(selectedPackageId)}
            disabled={!selectedPackageId || isAssigning}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Assignation en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Assigner ce Pack
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
