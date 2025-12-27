"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from '@/components/layout/Header';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  PieChart
} from "lucide-react";
import { getMonthlyStats, MonthlyInvoiceStats } from "@/lib/invoiceReports";
import { formatCurrency } from "@/lib/invoiceHelpers";
import Link from "next/link";

export default function RapportsMensuelsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [stats, setStats] = useState<MonthlyInvoiceStats | null>(null);

  useEffect(() => {
    loadMonthlyStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  async function loadMonthlyStats() {
    setIsLoading(true);
    try {
      const monthStats = await getMonthlyStats(selectedYear, selectedMonth);
      setStats(monthStats);
    } catch (error) {
      console.error('Erreur chargement stats mensuelles:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function navigateMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  }

  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });

  if (isLoading) {
    return (
      <>
        <Header title="Rapports Mensuels" subtitle="Analyse détaillée de vos factures par mois" />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <p className="text-slate-500 font-medium">Chargement des données...</p>
          </div>
        </main>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Header title="Rapports Mensuels" subtitle="Analyse détaillée de vos factures par mois" />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-800 font-semibold">Erreur lors du chargement des statistiques</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Rapports Mensuels" subtitle="Analyse détaillée de vos factures par mois" />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in">
        
        {/* Sélecteur de mois */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {monthName}
              </h2>
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* KPIs du mois */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Factures émises */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Facturées</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {formatCurrency(stats.facturees.total)}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="badge badge-info">
                  {stats.facturees.count} facture(s)
                </div>
              </div>
            </div>
          </motion.div>

          {/* Factures payées */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Payées</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-600">
                {formatCurrency(stats.payees.total)}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="badge badge-success">
                  {stats.payees.count} facture(s)
                </div>
              </div>
            </div>
          </motion.div>

          {/* Factures impayées */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Impayées</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-amber-600">
                {formatCurrency(stats.impayees.total)}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="badge badge-warning">
                  {stats.impayees.count} facture(s)
                </div>
              </div>
            </div>
          </motion.div>

          {/* Taux de paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Taux de paiement</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                {stats.taux_paiement.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.taux_paiement}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Détails des factures */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Factures payées */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Factures Payées</h3>
                  <p className="text-sm text-white/80">{stats.payees.count} facture(s) - {formatCurrency(stats.payees.total)}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {stats.payees.invoices.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Aucune facture payée ce mois</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.payees.invoices.slice(0, 5).map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/factures/${invoice.id}`}
                      className="block p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900">{invoice.invoice_number}</div>
                          <div className="text-sm text-slate-600 truncate">
                            {invoice.client?.name || 'Client inconnu'}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-emerald-600">
                            {formatCurrency(invoice.total_ttc)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {stats.payees.invoices.length > 5 && (
                    <Link
                      href="/factures"
                      className="block text-center py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Voir toutes les factures payées ({stats.payees.invoices.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Factures impayées */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Factures Impayées</h3>
                  <p className="text-sm text-white/80">{stats.impayees.count} facture(s) - {formatCurrency(stats.impayees.total)}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {stats.impayees.invoices.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Toutes les factures sont payées !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.impayees.invoices.slice(0, 5).map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/factures/${invoice.id}`}
                      className="block p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900">{invoice.invoice_number}</div>
                          <div className="text-sm text-slate-600 truncate">
                            {invoice.client?.name || 'Client inconnu'}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-amber-600">
                            {formatCurrency(invoice.total_ttc)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {stats.impayees.invoices.length > 5 && (
                    <Link
                      href="/factures"
                      className="block text-center py-2 text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      Voir toutes les factures impayées ({stats.impayees.invoices.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Link
            href="/factures"
            className="btn btn-primary px-6 py-3"
          >
            <FileText className="w-4 h-4" />
            Voir toutes les factures
          </Link>
        </div>
      </main>
    </>
  );
}
