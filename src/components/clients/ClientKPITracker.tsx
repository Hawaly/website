"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  Calendar,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import type { 
  ClientKPI, 
  ClientKPIValue, 
  ClientKPIInsert,
  ClientKPIValueInsert,
  ClientKPICategorie,
  ClientKPIPeriodicite
} from '@/types/database';
import {
  CLIENT_KPI_CATEGORIE_LABELS,
  CLIENT_KPI_CATEGORIE_COLORS,
  CLIENT_KPI_PERIODICITE_LABELS
} from '@/types/database';

interface ClientKPITrackerProps {
  clientId: number;
  isAdmin?: boolean;
  isCompact?: boolean;
}

interface KPIWithLatestValue extends ClientKPI {
  latest_value?: ClientKPIValue;
  previous_value?: ClientKPIValue;
  trend?: 'up' | 'down' | 'stable';
  progress?: number;
}

export function ClientKPITracker({ clientId, isAdmin = false, isCompact = false }: ClientKPITrackerProps) {
  const [kpis, setKpis] = useState<KPIWithLatestValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [editingKPI, setEditingKPI] = useState<number | null>(null);
  const [addingValueForKPI, setAddingValueForKPI] = useState<number | null>(null);
  const [expandedKPI, setExpandedKPI] = useState<number | null>(null);

  const [newKPI, setNewKPI] = useState<Partial<ClientKPIInsert>>({
    client_id: clientId,
    nom: '',
    description: '',
    categorie: null,
    unite: '',
    valeur_cible: null,
    periodicite: null,
    ordre: 0,
    is_active: true,
  });

  const [newValue, setNewValue] = useState<Partial<ClientKPIValueInsert>>({
    date: new Date().toISOString().split('T')[0],
    valeur_mesuree: 0,
    commentaire: '',
  });

  useEffect(() => {
    loadKPIs();
  }, [clientId]);

  const loadKPIs = async () => {
    setIsLoading(true);
    try {
      const { data: kpisData, error: kpisError } = await supabase
        .from('client_kpi')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('ordre', { ascending: true });

      if (kpisError) throw kpisError;

      if (kpisData) {
        const kpisWithValues = await Promise.all(
          kpisData.map(async (kpi) => {
            const { data: values } = await supabase
              .from('client_kpi_value')
              .select('*')
              .eq('kpi_id', kpi.id)
              .order('date', { ascending: false })
              .limit(2);

            const latest = values?.[0];
            const previous = values?.[1];

            let trend: 'up' | 'down' | 'stable' | undefined;
            if (latest && previous) {
              if (latest.valeur_mesuree > previous.valeur_mesuree) trend = 'up';
              else if (latest.valeur_mesuree < previous.valeur_mesuree) trend = 'down';
              else trend = 'stable';
            }

            let progress: number | undefined;
            if (latest && kpi.valeur_cible) {
              progress = Math.min((latest.valeur_mesuree / kpi.valeur_cible) * 100, 100);
            }

            return {
              ...kpi,
              latest_value: latest,
              previous_value: previous,
              trend,
              progress,
            };
          })
        );

        setKpis(kpisWithValues);
      }
    } catch (error) {
      console.error('Erreur chargement KPIs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKPI = async () => {
    if (!newKPI.nom) return;

    try {
      const { error } = await supabase
        .from('client_kpi')
        .insert([newKPI as ClientKPIInsert]);

      if (error) throw error;

      setIsAddingKPI(false);
      setNewKPI({
        client_id: clientId,
        nom: '',
        description: '',
        categorie: null,
        unite: '',
        valeur_cible: null,
        periodicite: null,
        ordre: 0,
        is_active: true,
      });
      loadKPIs();
    } catch (error) {
      console.error('Erreur ajout KPI:', error);
    }
  };

  const handleDeleteKPI = async (kpiId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce KPI ?')) return;

    try {
      const { error } = await supabase
        .from('client_kpi')
        .update({ is_active: false })
        .eq('id', kpiId);

      if (error) throw error;
      loadKPIs();
    } catch (error) {
      console.error('Erreur suppression KPI:', error);
    }
  };

  const handleAddValue = async (kpiId: number) => {
    try {
      const { error } = await supabase
        .from('client_kpi_value')
        .insert([{ ...newValue, kpi_id: kpiId } as ClientKPIValueInsert]);

      if (error) throw error;

      setAddingValueForKPI(null);
      setNewValue({
        date: new Date().toISOString().split('T')[0],
        valeur_mesuree: 0,
        commentaire: '',
      });
      loadKPIs();
    } catch (error) {
      console.error('Erreur ajout valeur:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!isAdmin && kpis.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucun KPI configuré pour le moment</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isCompact ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm">{kpi.nom}</h4>
                  {kpi.categorie && (
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                      CLIENT_KPI_CATEGORIE_COLORS[kpi.categorie]
                    }`}>
                      {CLIENT_KPI_CATEGORIE_LABELS[kpi.categorie]}
                    </span>
                  )}
                </div>
                {kpi.trend && (
                  <div className={`p-1 rounded-lg ${
                    kpi.trend === 'up' ? 'bg-green-100' : 
                    kpi.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : kpi.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">
                  {kpi.latest_value?.valeur_mesuree?.toLocaleString('fr-CH') || '—'}
                  {kpi.unite && <span className="text-sm font-normal text-gray-600 ml-1">{kpi.unite}</span>}
                </div>
                {kpi.valeur_cible && (
                  <div className="text-xs text-gray-600">
                    Objectif: {kpi.valeur_cible.toLocaleString('fr-CH')} {kpi.unite}
                  </div>
                )}
              </div>

              {kpi.progress !== undefined && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        kpi.progress >= 100 ? 'bg-green-500' :
                        kpi.progress >= 75 ? 'bg-blue-500' :
                        kpi.progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setAddingValueForKPI(kpi.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Valeur
                  </button>
                  <button
                    onClick={() => handleDeleteKPI(kpi.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {addingValueForKPI === kpi.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <input
                    type="date"
                    value={newValue.date}
                    onChange={(e) => setNewValue({ ...newValue, date: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Valeur"
                    value={newValue.valeur_mesuree}
                    onChange={(e) => setNewValue({ ...newValue, valeur_mesuree: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddValue(kpi.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-3 h-3" />
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setAddingValueForKPI(null)}
                      className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">{kpi.nom}</h4>
                    {kpi.categorie && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        CLIENT_KPI_CATEGORIE_COLORS[kpi.categorie]
                      }`}>
                        {CLIENT_KPI_CATEGORIE_LABELS[kpi.categorie]}
                      </span>
                    )}
                  </div>
                  {kpi.description && (
                    <p className="text-sm text-gray-600 mb-3">{kpi.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {kpi.latest_value?.valeur_mesuree?.toLocaleString('fr-CH') || '—'}
                        {kpi.unite && <span className="text-lg font-normal text-gray-600 ml-1">{kpi.unite}</span>}
                      </div>
                      {kpi.latest_value && (
                        <div className="text-xs text-gray-500 mt-1">
                          Dernière mise à jour: {new Date(kpi.latest_value.date).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    {kpi.valeur_cible && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-semibold text-gray-700">
                            {kpi.valeur_cible.toLocaleString('fr-CH')} {kpi.unite}
                          </div>
                          <div className="text-xs text-gray-500">Objectif {kpi.periodicite}</div>
                        </div>
                      </div>
                    )}

                    {kpi.trend && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 
                        kpi.trend === 'down' ? 'bg-red-100 text-red-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : kpi.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <BarChart3 className="w-4 h-4" />
                        )}
                        <span className="text-sm font-semibold">
                          {kpi.trend === 'up' ? 'En hausse' : 
                           kpi.trend === 'down' ? 'En baisse' : 'Stable'}
                        </span>
                      </div>
                    )}
                  </div>

                  {kpi.progress !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progression</span>
                        <span className="font-semibold">{Math.round(kpi.progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            kpi.progress >= 100 ? 'bg-green-500' :
                            kpi.progress >= 75 ? 'bg-blue-500' :
                            kpi.progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAddingValueForKPI(kpi.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark transition-colors text-sm font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Nouvelle valeur
                    </button>
                    <button
                      onClick={() => handleDeleteKPI(kpi.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {addingValueForKPI === kpi.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Ajouter une nouvelle mesure</h5>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={newValue.date}
                        onChange={(e) => setNewValue({ ...newValue, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={`Valeur en ${kpi.unite || ''}`}
                        value={newValue.valeur_mesuree}
                        onChange={(e) => setNewValue({ ...newValue, valeur_mesuree: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
                      <textarea
                        placeholder="Notes ou observations"
                        value={newValue.commentaire || ''}
                        onChange={(e) => setNewValue({ ...newValue, commentaire: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddValue(kpi.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setAddingValueForKPI(null)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <>
          {isAddingKPI ? (
            <Card className="p-6">
              <h4 className="font-bold text-gray-900 text-lg mb-4">Nouveau KPI</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du KPI *</label>
                  <input
                    type="text"
                    placeholder="Ex: Nombre de followers Instagram"
                    value={newKPI.nom}
                    onChange={(e) => setNewKPI({ ...newKPI, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Description du KPI"
                    value={newKPI.description || ''}
                    onChange={(e) => setNewKPI({ ...newKPI, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={newKPI.categorie || ''}
                    onChange={(e) => setNewKPI({ ...newKPI, categorie: (e.target.value as ClientKPICategorie) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Sélectionner --</option>
                    {Object.entries(CLIENT_KPI_CATEGORIE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <input
                    type="text"
                    placeholder="Ex: followers, %, CHF"
                    value={newKPI.unite || ''}
                    onChange={(e) => setNewKPI({ ...newKPI, unite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valeur cible</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Objectif à atteindre"
                    value={newKPI.valeur_cible || ''}
                    onChange={(e) => setNewKPI({ ...newKPI, valeur_cible: parseFloat(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Périodicité</label>
                  <select
                    value={newKPI.periodicite || ''}
                    onChange={(e) => setNewKPI({ ...newKPI, periodicite: (e.target.value as ClientKPIPeriodicite) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Sélectionner --</option>
                    {Object.entries(CLIENT_KPI_PERIODICITE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddKPI}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer le KPI
                </button>
                <button
                  onClick={() => setIsAddingKPI(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Annuler
                </button>
              </div>
            </Card>
          ) : (
            <button
              onClick={() => setIsAddingKPI(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-brand-orange hover:bg-brand-orange/5 transition-all text-gray-600 hover:text-brand-orange font-semibold"
            >
              <Plus className="w-5 h-5" />
              Ajouter un nouveau KPI
            </button>
          )}
        </>
      )}
    </div>
  );
}
