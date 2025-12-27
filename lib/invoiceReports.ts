import { supabase } from './supabaseClient';
import { Invoice, InvoiceStatus } from '@/types/database';

/**
 * Type pour les factures avec relation client
 */
export type InvoiceWithClient = Invoice & {
  client: {
    id: number;
    name: string;
  } | null;
};

/**
 * Interface pour les statistiques mensuelles des factures
 */
export interface MonthlyInvoiceStats {
  month: string; // Format: YYYY-MM
  facturees: {
    count: number;
    total: number;
    invoices: InvoiceWithClient[];
  };
  payees: {
    count: number;
    total: number;
    invoices: InvoiceWithClient[];
  };
  impayees: {
    count: number;
    total: number;
    invoices: InvoiceWithClient[];
  };
  taux_paiement: number; // Pourcentage
}

/**
 * Récupère les factures facturées (envoyées) pour un mois donné
 */
export async function getInvoicedByMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('invoice')
    .select(`
      *,
      client:client_id (
        id,
        name
      )
    `)
    .gte('issue_date', startDate)
    .lte('issue_date', endDate)
    .in('status', ['envoyee', 'payee'])
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Erreur récupération factures facturées:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupère les factures payées pour un mois donné (basé sur la date de paiement ou issue_date si payée)
 */
export async function getPaidByMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('invoice')
    .select(`
      *,
      client:client_id (
        id,
        name
      )
    `)
    .eq('status', 'payee')
    .gte('issue_date', startDate)
    .lte('issue_date', endDate)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Erreur récupération factures payées:', error);
    return [];
  }

  return data || [];
}

/**
 * Génère les statistiques mensuelles complètes
 */
export async function getMonthlyStats(year: number, month: number): Promise<MonthlyInvoiceStats> {
  const invoiced = await getInvoicedByMonth(year, month);
  const paid = invoiced.filter(inv => inv.status === 'payee');
  const unpaid = invoiced.filter(inv => inv.status === 'envoyee');

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const totalInvoiced = invoiced.reduce((sum, inv) => sum + inv.total_ttc, 0);
  const totalPaid = paid.reduce((sum, inv) => sum + inv.total_ttc, 0);
  const totalUnpaid = unpaid.reduce((sum, inv) => sum + inv.total_ttc, 0);

  const paymentRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

  return {
    month: monthStr,
    facturees: {
      count: invoiced.length,
      total: totalInvoiced,
      invoices: invoiced,
    },
    payees: {
      count: paid.length,
      total: totalPaid,
      invoices: paid,
    },
    impayees: {
      count: unpaid.length,
      total: totalUnpaid,
      invoices: unpaid,
    },
    taux_paiement: paymentRate,
  };
}

/**
 * Récupère les statistiques pour plusieurs mois (pour les graphiques)
 */
export async function getMultiMonthStats(startYear: number, startMonth: number, numberOfMonths: number) {
  const stats: MonthlyInvoiceStats[] = [];

  for (let i = 0; i < numberOfMonths; i++) {
    const currentMonth = startMonth + i;
    const year = startYear + Math.floor(currentMonth / 12);
    const month = currentMonth % 12;

    const monthStats = await getMonthlyStats(year, month);
    stats.push(monthStats);
  }

  return stats;
}

/**
 * Récupère les factures récurrentes actives
 */
export async function getRecurringInvoices() {
  const { data, error } = await supabase
    .from('invoice')
    .select(`
      *,
      client:client_id (
        id,
        name
      )
    `)
    .neq('is_recurring', 'oneshot')
    .is('parent_invoice_id', null)
    .order('next_generation_date', { ascending: true });

  if (error) {
    console.error('Erreur récupération factures récurrentes:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupère l'historique des factures générées à partir d'une facture récurrente
 */
export async function getRecurringInvoiceHistory(parentInvoiceId: number) {
  const { data, error } = await supabase
    .from('invoice')
    .select(`
      *,
      client:client_id (
        id,
        name
      )
    `)
    .eq('parent_invoice_id', parentInvoiceId)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Erreur récupération historique factures récurrentes:', error);
    return [];
  }

  return data || [];
}

/**
 * Calcule la prochaine date de génération pour une facture récurrente
 */
/**
 * Calcule le statut et la progression d'une facture récurrente
 */
export function getRecurringInvoiceStatus(invoice: Invoice) {
  if (invoice.is_recurring === 'oneshot') {
    return { status: 'inactive', progress: 0, remaining: 0 };
  }

  const occurrences = invoice.occurrences_count || 0;
  const max = invoice.max_occurrences;

  if (!max) {
    return { status: 'active', progress: 0, remaining: null }; // Illimité
  }

  const remaining = max - occurrences;
  const progress = Math.round((occurrences / max) * 100);

  if (remaining <= 0) {
    return { status: 'completed', progress: 100, remaining: 0 };
  }

  if (invoice.end_date && new Date() > new Date(invoice.end_date)) {
    return { status: 'expired', progress, remaining };
  }

  return { status: 'active', progress, remaining };
}

/**
 * Vérifie si une facture récurrente peut encore générer des factures
 */
export function canGenerateRecurringInvoice(invoice: Invoice): boolean {
  if (invoice.is_recurring === 'oneshot') return false;
  
  // Vérifier max_occurrences
  if (invoice.max_occurrences && invoice.occurrences_count >= invoice.max_occurrences) {
    return false;
  }
  
  // Vérifier end_date
  if (invoice.end_date && new Date() > new Date(invoice.end_date)) {
    return false;
  }
  
  return true;
}

export function calculateNextGenerationDate(
  lastDate: Date,
  recurrence: 'mensuel' | 'trimestriel' | 'annuel',
  recurrenceDay: number
): Date {
  const nextDate = new Date(lastDate);

  switch (recurrence) {
    case 'mensuel':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'trimestriel':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'annuel':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  // Définir le jour du mois
  const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
  nextDate.setDate(Math.min(recurrenceDay, maxDay));

  return nextDate;
}

/**
 * Génère automatiquement une facture à partir d'une facture récurrente
 */
export async function generateRecurringInvoice(parentInvoiceId: number) {
  // Récupérer la facture parente
  const { data: parentInvoice, error: fetchError } = await supabase
    .from('invoice')
    .select(`
      *,
      invoice_item (*)
    `)
    .eq('id', parentInvoiceId)
    .single();

  if (fetchError || !parentInvoice) {
    throw new Error('Facture parente introuvable');
  }

  // Vérifier si la limite d'occurrences est atteinte
  if (parentInvoice.max_occurrences && parentInvoice.occurrences_count >= parentInvoice.max_occurrences) {
    throw new Error('Nombre maximum de générations atteint');
  }

  // Vérifier si la date de fin est dépassée
  if (parentInvoice.end_date && new Date() > new Date(parentInvoice.end_date)) {
    throw new Error('Date de fin de récurrence dépassée');
  }

  // Calculer la nouvelle date de génération
  const issueDate = new Date();
  const nextGenDate = calculateNextGenerationDate(
    issueDate,
    parentInvoice.is_recurring as 'mensuel' | 'trimestriel' | 'annuel',
    parentInvoice.recurrence_day || 1
  );

  // Générer un nouveau numéro de facture
  const invoiceNumber = `${parentInvoice.invoice_number}-${new Date().getTime()}`;

  // Créer la nouvelle facture
  const newInvoice = {
    client_id: parentInvoice.client_id,
    mandat_id: parentInvoice.mandat_id,
    invoice_number: invoiceNumber,
    issue_date: issueDate.toISOString().split('T')[0],
    due_date: new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_ht: parentInvoice.total_ht,
    total_tva: parentInvoice.total_tva,
    total_ttc: parentInvoice.total_ttc,
    status: parentInvoice.auto_send ? 'envoyee' : 'brouillon',
    qr_additional_info: parentInvoice.qr_additional_info,
    is_recurring: 'oneshot' as const,
    recurrence_day: null,
    parent_invoice_id: parentInvoiceId,
    next_generation_date: null,
    auto_send: false,
    max_occurrences: null,
    occurrences_count: 0,
    end_date: null,
  };

  const { data: createdInvoice, error: createError } = await supabase
    .from('invoice')
    .insert(newInvoice)
    .select()
    .single();

  if (createError || !createdInvoice) {
    throw new Error('Erreur lors de la création de la facture');
  }

  // Copier les items de facture
  if (parentInvoice.invoice_item && parentInvoice.invoice_item.length > 0) {
    const items = parentInvoice.invoice_item.map((item: any) => ({
      invoice_id: createdInvoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_item')
      .insert(items);

    if (itemsError) {
      console.error('Erreur lors de la création des items:', itemsError);
    }
  }

  // Mettre à jour la facture parente: incrémenter le compteur et mettre à jour la prochaine date
  const newOccurrenceCount = (parentInvoice.occurrences_count || 0) + 1;
  const shouldContinue = !parentInvoice.max_occurrences || newOccurrenceCount < parentInvoice.max_occurrences;
  const shouldContinueByDate = !parentInvoice.end_date || nextGenDate <= new Date(parentInvoice.end_date);

  const updateData: any = {
    occurrences_count: newOccurrenceCount,
  };

  // Si on doit continuer, mettre à jour next_generation_date, sinon désactiver la récurrence
  if (shouldContinue && shouldContinueByDate) {
    updateData.next_generation_date = nextGenDate.toISOString().split('T')[0];
  } else {
    // Limite atteinte, désactiver la récurrence
    updateData.is_recurring = 'oneshot';
    updateData.next_generation_date = null;
  }

  const { error: updateError } = await supabase
    .from('invoice')
    .update(updateData)
    .eq('id', parentInvoiceId);

  if (updateError) {
    console.error('Erreur lors de la mise à jour de la facture parente:', updateError);
  }

  return createdInvoice;
}
