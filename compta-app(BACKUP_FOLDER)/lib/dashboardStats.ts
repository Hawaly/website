import { supabase } from './supabaseClient';
import { Invoice, Expense, ExpenseCategory } from '@/types/database';

/**
 * Récupère toutes les factures payées pour une période
 */
export async function getPaidInvoices(startDate?: string, endDate?: string) {
  let query = supabase
    .from('invoice')
    .select(`
      *,
      client:client_id (
        id,
        name
      )
    `)
    .eq('status', 'payee');

  if (startDate) {
    query = query.gte('issue_date', startDate);
  }
  if (endDate) {
    query = query.lte('issue_date', endDate);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Erreur récupération factures:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupère toutes les dépenses pour une période
 */
export async function getExpenses(startDate?: string, endDate?: string) {
  let query = supabase
    .from('expense')
    .select(`
      *,
      category:category_id (
        id,
        name
      )
    `);

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Erreur récupération dépenses:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupère les factures envoyées non payées (en attente)
 */
export async function getUnpaidInvoices() {
  const { data, error } = await supabase
    .from('invoice')
    .select(`
      *,
      client:client_id (
        name
      )
    `)
    .eq('status', 'envoyee')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Erreur récupération factures impayées:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupère les dépenses récurrentes (abonnements)
 */
export async function getRecurringExpenses() {
  const { data, error } = await supabase
    .from('expense')
    .select(`
      *,
      category:category_id (
        name
      )
    `)
    .eq('is_recurring', 'mensuel')
    .order('date', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Erreur récupération dépenses récurrentes:', error);
    return [];
  }

  return data || [];
}

/**
 * Calcule les KPIs pour une période
 */
export function calculateKPIs(
  invoices: Invoice[],
  expenses: Expense[]
) {
  const revenue = invoices.reduce((sum, inv) => sum + inv.total_ttc, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = revenue - totalExpenses;

  return {
    revenue,
    expenses: totalExpenses,
    profit,
    invoiceCount: invoices.length,
    expenseCount: expenses.length,
  };
}

/**
 * Agrège le CA par client (top N)
 */
export function aggregateRevenueByClient(
  invoices: (Invoice & { client: { id: number; name: string } | null })[],
  topN: number = 5
) {
  const byClient = new Map<number, { name: string; total: number }>();

  invoices.forEach((invoice) => {
    if (!invoice.client) return;

    const existing = byClient.get(invoice.client.id);
    if (existing) {
      existing.total += invoice.total_ttc;
    } else {
      byClient.set(invoice.client.id, {
        name: invoice.client.name,
        total: invoice.total_ttc,
      });
    }
  });

  // Convertir en array et trier
  return Array.from(byClient.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
}

/**
 * Agrège les dépenses par catégorie
 */
export function aggregateExpensesByCategory(
  expenses: (Expense & { category: ExpenseCategory | null })[]
) {
  const byCategory = new Map<string, number>();

  expenses.forEach((expense) => {
    const categoryName = expense.category?.name || 'Sans catégorie';
    const existing = byCategory.get(categoryName);
    
    if (existing) {
      byCategory.set(categoryName, existing + expense.amount);
    } else {
      byCategory.set(categoryName, expense.amount);
    }
  });

  // Convertir en array et trier
  return Array.from(byCategory.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Utilitaires de dates
 */
export function getMonthRange(year: number, month: number) {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
}

export function getYearRange(year: number) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  return { startDate, endDate };
}

export function getCurrentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

