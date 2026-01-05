"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Target,
  Briefcase,
  ChevronRight,
  ListTodo,
  Receipt
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
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Chargement du mandat...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !mandat || !client) {
    return (
      <>
        <Header title="Erreur" />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Mandat introuvable</h3>
            <p className="text-red-600 text-sm mb-4">{error || "Ce mandat n'existe pas ou a été supprimé."}</p>
            <Link
              href="/mandats"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux mandats
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
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-slate-500 mb-4 sm:mb-6"
        >
          <Link href="/mandats" className="hover:text-amber-600 transition-colors">Mandats</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/clients/${client.id}`} className="hover:text-amber-600 transition-colors">{client.name}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{mandat.title}</span>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 text-white mb-4 sm:mb-6 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative z-10">
            {/* Top Row: Client & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <Link
                href={`/clients/${client.id}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-sm font-medium transition-all w-fit"
              >
                <User className="w-4 h-4" />
                {client.name}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${MANDAT_STATUS_COLORS[mandat.status]} shadow-lg`}>
                  {MANDAT_STATUS_LABELS[mandat.status]}
                </span>
                {daysRemaining !== null && (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                    daysRemaining <= 0 ? 'bg-red-500/80' : daysRemaining <= 7 ? 'bg-yellow-500/80' : 'bg-white/20'
                  }`}>
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    {daysRemaining > 0 ? `${daysRemaining}j restants` : 'Échéance passée'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Title & Type */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">{mandat.title}</h1>
              {mandat.mandat_type && (
                <p className="text-white/80 text-base sm:text-lg flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {mandat.mandat_type}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href={`/mandats/${mandatId}/strategies`}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-white/90 transition-all font-semibold text-sm shadow-lg"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Stratégies</span>
              </Link>
              <Link
                href={`/mandats/${mandatId}/edit`}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-semibold text-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Modifier</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-all font-semibold text-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isDeleting ? 'Suppression...' : 'Supprimer'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          {/* Progression des tâches */}
          <div className="col-span-2 lg:col-span-1 bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Progression</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.tasksProgress}%</p>
              </div>
            </div>
            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.tasksProgress}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{stats.completedTasks} / {stats.totalTasks} tâches</p>
          </div>

          {/* Tâches en cours */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">En cours</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>

          {/* Tâches en retard */}
          <div className={`bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow ${
            stats.overdueTasks > 0 ? 'border-red-200 bg-red-50/50' : 'border-slate-200/60'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                stats.overdueTasks > 0 
                  ? 'bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/20' 
                  : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/20'
              }`}>
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">En retard</p>
                <p className={`text-xl sm:text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {stats.overdueTasks}
                </p>
              </div>
            </div>
          </div>

          {/* Dépenses */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">Dépenses</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {stats.totalExpenses.toLocaleString('fr-CH')} <span className="text-sm font-normal text-slate-500">CHF</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dates et Description */}
        {(mandat.start_date || mandat.end_date || mandat.description) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6"
          >
            {/* Dates */}
            {(mandat.start_date || mandat.end_date) && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${mandat.description ? 'mb-5 pb-5 border-b border-slate-100' : ''}`}>
                {mandat.start_date && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">Date de début</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(mandat.start_date).toLocaleDateString("fr-FR", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {mandat.end_date && (
                  <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-rose-600 font-medium">Date de fin</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(mandat.end_date).toLocaleDateString("fr-FR", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {mandat.description && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Description
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{mandat.description}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Contenu principal - 2 colonnes sur desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Tâches du mandat */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <ListTodo className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Tâches</h2>
                  <p className="text-xs text-slate-500">{stats.totalTasks} tâche(s)</p>
                </div>
              </div>
              <Link
                href="#"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-xs sm:text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajouter</span>
              </Link>
            </div>
            <div className="p-4 sm:p-5 max-h-[400px] overflow-y-auto">
              <TasksList mandatId={parseInt(mandatId)} />
            </div>
          </motion.div>

          {/* Dépenses du mandat */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Dépenses</h2>
                  <p className="text-xs text-slate-500">{stats.totalExpenses.toLocaleString('fr-CH')} CHF</p>
                </div>
              </div>
              <Link
                href={`/depenses/new?mandat=${mandatId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-xs sm:text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajouter</span>
              </Link>
            </div>
            <div className="p-4 sm:p-5 max-h-[400px] overflow-y-auto">
              <ExpensesList mandatId={parseInt(mandatId)} />
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

