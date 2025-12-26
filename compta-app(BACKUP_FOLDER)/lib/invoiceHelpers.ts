import { supabase } from './supabaseClient';

// Taux de TVA par défaut (8.1% en Suisse)
export const DEFAULT_TVA_RATE = 0.081;

/**
 * Génère un numéro de facture unique au format FAC-YYYY-NNNN
 * Ex: FAC-2025-0001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  const { data, error } = await supabase
    .from('invoice')
    .select('invoice_number')
    .like('invoice_number', `FAC-${year}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Erreur lors de la récupération du dernier numéro:', error);
    return `FAC-${year}-0001`;
  }

  if (!data || data.length === 0) {
    return `FAC-${year}-0001`;
  }

  const lastNumber = data[0].invoice_number;
  const match = lastNumber.match(/FAC-\d{4}-(\d{4})/);
  
  if (match) {
    const lastNum = parseInt(match[1], 10);
    const newNum = lastNum + 1;
    return `FAC-${year}-${newNum.toString().padStart(4, '0')}`;
  }

  return `FAC-${year}-0001`;
}

/**
 * Calcule les totaux d'une facture
 */
export function calculateInvoiceTotals(
  items: { quantity: number; unit_price: number }[],
  tvaRate: number = DEFAULT_TVA_RATE
) {
  const total_ht = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  const total_tva = total_ht * tvaRate;
  const total_ttc = total_ht + total_tva;

  return {
    total_ht: Math.round(total_ht * 100) / 100,
    total_tva: Math.round(total_tva * 100) / 100,
    total_ttc: Math.round(total_ttc * 100) / 100,
  };
}

/**
 * Formate un montant en CHF
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(amount);
}

