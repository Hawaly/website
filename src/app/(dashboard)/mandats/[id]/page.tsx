"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { TasksList } from "@/components/mandats/TasksList";
import { ExpensesList } from "@/components/expenses/ExpensesList";
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  Loader2,
  User,
  Share2,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  BarChart3,
  Activity,
  Plus,
  Target
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Mandat,
  Client,
  MANDAT_STATUS_LABELS,
  MANDAT_STATUS_COLORS
} from "@/types/database";

export default function MandatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mandatId = params.id as string;

  const [mandat, setMandat] = useState<Mandat | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalExpenses: 0,
    tasksProgress: 0
  });

  useEffect(() => {
    loadMandat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mandatId]);

  async function loadMandat() {
    try {
      setIsLoading(true);
      setError(null);

      const { data: mandatData, error: mandatError } = await supabase
        .from("mandat")
        .select(`
          *,
          client:client_id (*)
        `)
        .eq("id", mandatId)
        .single();

      if (mandatError) throw mandatError;
      if (!mandatData || !mandatData.client) throw new Error("Mandat non trouvé");

      setMandat(mandatData);
      setClient(mandatData.client);

      const [tasksRes, expensesRes] = await Promise.all([
        supabase.from("mandat_task").select("*").eq("mandat_id", mandatId),
        supabase.from("expense").select("amount").eq("mandat_id", mandatId)
      ]);

      const tasks = tasksRes.data || [];
      const expenses = expensesRes.data || [];

      const completedTasks = tasks.filter(t => t.status === 'terminee').length;
      const pendingTasks = tasks.filter(t => t.status !== 'terminee').length;
      const overdueTasks = tasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'terminee'
      ).length;
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        overdueTasks,
        totalExpenses,
        tasksProgress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
      });

    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement du mandat");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!mandat || !client) return;

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer le mandat "${mandat.title}" ?\n\nCette action est irréversible et supprimera également toutes les tâches associées.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const { error: deleteError } = await supabase
        .from("mandat")
        .delete()
        .eq("id", mandatId);

      if (deleteError) throw deleteError;

      router.push(`/clients/${client.id}`);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Erreur lors de la suppression");
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Chargement..." />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">Chargement du mandat...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !mandat || !client) {
    return (
      <>
        <Header title="Erreur" />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <p className="text-red-900 font-semibold">{error || "Mandat non trouvé"}</p>
            <Link
              href="/mandats"
              className="inline-block mt-4 text-red-700 hover:text-red-900 font-bold"
            >
              Retour à la liste
            </Link>
          </div>
        </main>
      </>
    );
  }

  const daysRemaining = mandat.end_date 
    ? Math.ceil((new Date(mandat.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <Header title={mandat.title} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <Link
            href={`/clients/${client.id}`}
            className="flex items-center text-gray-900 hover:text-brand-orange transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à {client.name}
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/mandats/${mandatId}/strategies`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
            >
              <Target className="w-4 h-4" />
              <span>Stratégies</span>
            </Link>
            <Link
              href={`/mandats/${mandatId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-bold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* En-tête avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 sm:p-8 text-white mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <Link
                href={`/clients/${client.id}`}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold mb-3 transition-colors"
              >
                <User className="w-4 h-4" />
                {client.name}
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{mandat.title}</h1>
              {mandat.mandat_type && (
                <p className="text-white/90 text-lg">{mandat.mandat_type}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <span className={`px-4 py-2 rounded-xl font-bold ${MANDAT_STATUS_COLORS[mandat.status]} shadow-lg`}>
                {MANDAT_STATUS_LABELS[mandat.status]}
              </span>
              {daysRemaining !== null && (
                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-white/80 font-medium">Échéance</div>
                  <div className="text-lg font-bold">
                    {daysRemaining > 0 ? `${daysRemaining}j restants` : 'Terminé'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.completedTasks}</div>
                <div className="text-xs text-gray-600 font-medium">sur {stats.totalTasks}</div>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-700">Tâches terminées</p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.tasksProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 font-medium">{stats.tasksProgress}% complété</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</div>
            </div>
            <p className="text-sm font-bold text-gray-700">Tâches en cours</p>
          </div>

          {stats.overdueTasks > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-600">{stats.overdueTasks}</div>
              </div>
              <p className="text-sm font-bold text-gray-700">Tâches en retard</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalExpenses.toLocaleString('fr-CH')}
                </div>
                <div className="text-xs text-gray-600 font-medium">CHF</div>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-700">Dépenses totales</p>
          </div>
        </div>

        {/* Dates et Description */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {(mandat.start_date || mandat.end_date) && (
            <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b-2 border-gray-200">
              {mandat.start_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Date de début</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(mandat.start_date).toLocaleDateString("fr-FR", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
              {mandat.end_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Date de fin</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(mandat.end_date).toLocaleDateString("fr-FR", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {mandat.description && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Description du mandat
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{mandat.description}</p>
            </div>
          )}
        </div>

        {/* Tâches du mandat */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Tâches du mandat
            </h2>
            <Link
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </Link>
          </div>
          <TasksList mandatId={parseInt(mandatId)} />
        </div>

        {/* Dépenses du mandat */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              Dépenses du mandat
            </h2>
            <Link
              href={`/expenses/new?mandat=${mandatId}`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouvelle dépense
            </Link>
          </div>
          <ExpensesList mandatId={parseInt(mandatId)} />
        </div>
      </main>
    </>
  );
}

