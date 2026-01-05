"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from '@/components/layout/Header';
import { 
  Package, Save, X, AlertCircle, Plus, Trash2, Edit2, 
  CheckCircle, ListChecks, FileText, Receipt, GripVertical
} from "lucide-react";
import type { 
  ServicePackageComplete, 
  ServicePackageUpdate,
  PackageFeature,
  PackageTaskTemplate 
} from "@/types/service-packages";
import { BILLING_FREQUENCY_LABELS, PACKAGE_TASK_TYPE_LABELS } from "@/types/service-packages";

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [packageData, setPackageData] = useState<ServicePackageComplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'features' | 'tasks' | 'templates'>('info');

  const [formData, setFormData] = useState<Partial<ServicePackageUpdate>>({});
  const [newFeature, setNewFeature] = useState({ title: '', description: '' });
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    type: 'production' as const,
    days_after_start: 0,
    priority: 1 
  });

  useEffect(() => {
    loadPackage();
  }, [resolvedParams.id]);

  async function loadPackage() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/packages/${resolvedParams.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du chargement');
      }

      setPackageData(result.package);
      setFormData({
        name: result.package.name,
        slug: result.package.slug,
        description: result.package.description,
        tagline: result.package.tagline,
        price: result.package.price,
        currency: result.package.currency,
        billing_frequency: result.package.billing_frequency,
        color: result.package.color,
        icon: result.package.icon,
        badge: result.package.badge,
        is_featured: result.package.is_featured,
        is_active: result.package.is_active,
        is_visible: result.package.is_visible,
        display_order: result.package.display_order,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveInfo() {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/packages/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      await loadPackage();
      alert('Pack mis à jour avec succès !');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddFeature() {
    if (!newFeature.title) {
      alert('Le titre est requis');
      return;
    }

    try {
      const response = await fetch(`/api/packages/${resolvedParams.id}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFeature,
          display_order: packageData?.features?.length || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'ajout');
      }

      setNewFeature({ title: '', description: '' });
      await loadPackage();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  }

  async function handleDeleteFeature(featureId: number) {
    if (!confirm('Supprimer cette feature ?')) return;

    try {
      const response = await fetch(
        `/api/packages/${resolvedParams.id}/features/${featureId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      await loadPackage();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  }

  async function handleAddTask() {
    if (!newTask.title) {
      alert('Le titre est requis');
      return;
    }

    try {
      const response = await fetch(`/api/packages/${resolvedParams.id}/task-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          display_order: packageData?.task_templates?.length || 0,
          status: 'todo',
          is_active: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'ajout');
      }

      setNewTask({ 
        title: '', 
        description: '', 
        type: 'production',
        days_after_start: 0,
        priority: 1 
      });
      await loadPackage();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  }

  async function handleDeleteTask(taskId: number) {
    if (!confirm('Supprimer cette tâche template ?')) return;

    try {
      const response = await fetch(
        `/api/packages/${resolvedParams.id}/task-templates/${taskId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      await loadPackage();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header title="Chargement..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header title="Erreur" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-medium">Pack non trouvé</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header title={`Éditer: ${packageData.name}`} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-brand-orange" />
              {packageData.name}
            </h1>
            <p className="text-gray-600 mt-2">{packageData.tagline}</p>
          </div>

          <button
            onClick={() => router.push('/packages')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
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

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-xl border-2 border-gray-200 p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'info'
                ? 'bg-brand-orange text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Informations
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'features'
                ? 'bg-brand-orange text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Features ({packageData.features?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-brand-orange text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListChecks className="w-5 h-5 inline mr-2" />
            Tâches ({packageData.task_templates?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-brand-orange text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Templates
          </button>
        </div>

        {/* Tab Content: Info */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du pack
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none font-mono text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix
                </label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence
                </label>
                <select
                  value={formData.billing_frequency || 'one_time'}
                  onChange={(e) => setFormData({ ...formData, billing_frequency: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                >
                  {Object.entries(BILLING_FREQUENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured || false}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-brand-orange rounded"
                />
                <span className="text-sm font-medium">En vedette ⭐</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-brand-orange rounded"
                />
                <span className="text-sm font-medium">Actif</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_visible || false}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  className="w-4 h-4 text-brand-orange rounded"
                />
                <span className="text-sm font-medium">Visible</span>
              </label>
            </div>

            <button
              onClick={handleSaveInfo}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl hover:shadow-brand-lg transition-all font-semibold disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab Content: Features */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {/* Add Feature */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter une feature</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Titre de la feature *"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                />
                <input
                  type="text"
                  placeholder="Description (optionnel)"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                />
                <button
                  onClick={handleAddFeature}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter la feature
                </button>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Features actuelles ({packageData.features?.length || 0})
              </h3>
              {!packageData.features || packageData.features.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune feature pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {packageData.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{feature.title}</p>
                        {feature.description && (
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Add Task */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter une tâche template</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Titre de la tâche *"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none resize-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                  >
                    {Object.entries(PACKAGE_TASK_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Jours après début"
                    value={newTask.days_after_start}
                    onChange={(e) => setNewTask({ ...newTask, days_after_start: parseInt(e.target.value) })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Priorité (1-3)"
                    min="1"
                    max="3"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                  />
                </div>
                <button
                  onClick={handleAddTask}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter la tâche
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tâches templates ({packageData.task_templates?.length || 0})
              </h3>
              {!packageData.task_templates || packageData.task_templates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune tâche template pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {packageData.task_templates.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                    >
                      <ListChecks className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                            {PACKAGE_TASK_TYPE_LABELS[task.type]}
                          </span>
                          <span>J+{task.days_after_start}</span>
                          <span>Priorité {task.priority}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Templates */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Templates Mandat & Facture</h3>
              <p className="text-gray-600 mb-6">
                Configurez les templates de mandat et de facturation pour ce pack
              </p>
              <p className="text-sm text-gray-500">
                Cette fonctionnalité sera disponible prochainement via l'API
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
