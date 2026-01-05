import { supabaseAdmin } from './supabaseAdmin';
import { CompanySettings } from '@/types/database';

/**
 * Récupère les paramètres de l'agence depuis la base de données
 * Utilise supabaseAdmin pour bypasser RLS
 */
export async function getCompanySettings(): Promise<CompanySettings> {
  const { data, error } = await supabaseAdmin
    .from('company_settings')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(`Impossible de récupérer company_settings: ${error?.message || 'No data'}`);
  }

  return data as CompanySettings;
}

/**
 * Formate l'adresse complète de l'agence
 */
export function formatCompanyAddress(settings: CompanySettings): string {
  const parts: string[] = [];
  
  if (settings.address) parts.push(settings.address);
  
  const location: string[] = [];
  if (settings.zip_code) location.push(settings.zip_code);
  if (settings.city) location.push(settings.city);
  if (location.length > 0) parts.push(location.join(' '));
  
  if (settings.country) parts.push(settings.country);
  
  return parts.join(', ');
}

