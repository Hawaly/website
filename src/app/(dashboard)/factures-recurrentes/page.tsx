"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from '@/components/layout/Header';
import {
  Plus,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  History,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getRecurringInvoices, getRecurringInvoiceHistory, InvoiceWithClient, getRecurringInvoiceStatus, canGenerateRecurringInvoice } from "@/lib/invoiceReports";
import { formatCurrency } from "@/lib/invoiceHelpers";
import { INVOICE_RECURRENCE_LABELS, InvoiceRecurrence } from "@/types/database";

export default function FacturesRecurrentesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithClient | null>(null);
  const [history, setHistory] = useState<InvoiceWithClient[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadRecurringInvoices();
  }, []);

  async function loadRecurringInvoices() {
    setIsLoading(true);
    try {
      const data = await getRecurringInvoices();
      setInvoices(data as InvoiceWithClient[]);
    } catch (error) {
      console.error('Erreur chargement factures récurrentes:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadHistory(invoiceId: number) {
    try {
      const data = await getRecurringInvoiceHistory(invoiceId);
      setHistory(data as InvoiceWithClient[]);
      setShowHistory(true);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  }

  async function toggleRecurring(invoiceId: number, currentRecurrence: InvoiceRecurrence) {
    try {
      const newRecurrence = currentRecurrence === 'oneshot' ? 'mensuel' : 'oneshot';
      
      const { error } = await supabase
        .from('invoice')
        .update({ is_recurring: newRecurrence })
        .eq('id', invoiceId);

      if (error) throw error;

      await loadRecurringInvoices();
    } catch (error) {
      console.error('Erreur mise à jour facture récurrente:', error);
      alert('Erreur lors de la mise à jour');
    }
  }

  const activeRecurring = invoices.filter(inv => inv.is_recurring !== 'oneshot');
  const needsGeneration = activeRecurring.filter(inv => {
    if (!inv.next_generation_date) return false;
    return new Date(inv.next_generation_date) <= new Date();
  });

  return (
    <>
      <Header 
        title="Factures Récurrentes" 
        subtitle="Gérez vos factures automatiques et abonnements"
      />
      <main className="p-4 sm:p-6 lg:p-8 animate-fade-in">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Récurrentes actives</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{activeRecurring.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">À générer</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{needsGeneration.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{invoices.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                Factures récurrentes
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Automatisez vos facturations régulières</p>
            </div>
          </div>
          <Link 
            href="/factures/new?recurring=true" 
            className="btn btn-primary px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle récurrente</span>
          </Link>
        </div>

        {/* Alerte pour génération nécessaire */}
        {needsGeneration.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">
                {needsGeneration.length} facture(s) à générer
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Certaines factures récurrentes doivent être générées. Cliquez sur "Générer maintenant" pour créer les factures.
              </p>
            </div>
          </div>
        )}

        {/* Liste des factures */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center">
            <div className="relative inline-flex">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <p className="text-slate-600 font-medium mt-4">Chargement...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-4">Aucune facture récurrente</p>
            <Link href="/factures/new?recurring=true" className="btn btn-primary px-5 py-2.5 inline-flex">
              <Plus className="w-4 h-4" />
              Créer une facture récurrente
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Modèle</th>
                    <th>Client</th>
                    <th>Récurrence</th>
                    <th>Statut</th>
                    <th>Prochaine génération</th>
                    <th>Montant</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const isOverdue = invoice.next_generation_date && 
                      new Date(invoice.next_generation_date) <= new Date();
                    const isActive = invoice.is_recurring !== 'oneshot';
                    const status = getRecurringInvoiceStatus(invoice);
                    const canGenerate = canGenerateRecurringInvoice(invoice);

                    return (
                      <tr key={invoice.id} className="group">
                        <td>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-green-500' : 'bg-slate-300'
                              }`} />
                              <span className="font-semibold text-slate-900">
                                {invoice.invoice_number}
                              </span>
                            </div>
                            {invoice.max_occurrences && (
                              <div className="ml-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                      style={{ width: `${Math.min(((invoice.occurrences_count || 0) / invoice.max_occurrences) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-medium whitespace-nowrap">
                                    {invoice.occurrences_count || 0}/{invoice.max_occurrences}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {invoice.client && (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                {invoice.client.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-700">{invoice.client.name}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className={`badge ${
                              invoice.is_recurring === 'mensuel' ? 'badge-info' :
                              invoice.is_recurring === 'trimestriel' ? 'badge-warning' :
                              invoice.is_recurring === 'annuel' ? 'badge-success' :
                              'badge-slate'
                            }`}>
                              {INVOICE_RECURRENCE_LABELS[invoice.is_recurring]}
                            </span>
                            {invoice.max_occurrences && (
                              <span className="text-xs text-slate-500">
                                {invoice.max_occurrences} mois max
                              </span>
                            )}
                            {!invoice.max_occurrences && isActive && (
                              <span className="text-xs text-emerald-600 font-medium">
                                Illimité ∞
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {status.status === 'completed' && (
                            <span className="badge badge-success">
                              <CheckCircle className="w-3 h-3" />
                              Terminé
                            </span>
                          )}
                          {status.status === 'expired' && (
                            <span className="badge badge-warning">
                              <Clock className="w-3 h-3" />
                              Expiré
                            </span>
                          )}
                          {status.status === 'active' && (
                            <span className="badge badge-info">
                              <RefreshCw className="w-3 h-3" />
                              Actif
                            </span>
                          )}
                          {status.status === 'inactive' && (
                            <span className="badge badge-slate">
                              <Pause className="w-3 h-3" />
                              Inactif
                            </span>
                          )}
                        </td>
                        <td>
                          {invoice.next_generation_date && canGenerate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className={isOverdue ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
                                {new Date(invoice.next_generation_date).toLocaleDateString('fr-FR')}
                              </span>
                              {isOverdue && (
                                <span className="badge badge-warning text-xs">À générer</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900">
                              {formatCurrency(invoice.total_ttc)}
                            </span>
                            {invoice.max_occurrences && (
                              <span className="text-xs text-slate-500">
                                Total prévu: {formatCurrency(invoice.total_ttc * invoice.max_occurrences)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                loadHistory(invoice.id);
                              }}
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="Voir l'historique"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/factures/${invoice.id}`}
                              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                              title="Voir le modèle"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => toggleRecurring(invoice.id, invoice.is_recurring)}
                              className={`p-2 rounded-lg transition-all ${
                                isActive 
                                  ? 'text-green-500 hover:text-red-600 hover:bg-red-50' 
                                  : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={isActive ? 'Désactiver' : 'Activer'}
                            >
                              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Historique */}
        {showHistory && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowHistory(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Historique des générations</h3>
                      <p className="text-sm text-white/80">{selectedInvoice.invoice_number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Aucune facture générée pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((inv) => (
                      <Link
                        key={inv.id}
                        href={`/factures/${inv.id}`}
                        className="block p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{inv.invoice_number}</div>
                            <div className="text-sm text-slate-600 mt-1">
                              Émise le {new Date(inv.issue_date).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-bold text-slate-900">
                              {formatCurrency(inv.total_ttc)}
                            </div>
                            <span className={`badge text-xs mt-1 ${
                              inv.status === 'payee' ? 'badge-success' :
                              inv.status === 'envoyee' ? 'badge-warning' :
                              'badge-slate'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
