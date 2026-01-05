import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Récupère ou crée le client Supabase Admin (lazy initialization)
 */
function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // Vérifier les variables d'environnement
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in environment variables');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY - Required for admin operations');
  }

  // Créer le client
  supabaseAdminInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Log de confirmation (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Supabase Admin Client initialized (service_role)');
  }

  return supabaseAdminInstance;
}

/**
 * Client Supabase Admin avec service_role key (lazy initialization)
 * 
 * ⚠️ ATTENTION:
 * - BYPASS tous les RLS (Row Level Security)
 * - À utiliser UNIQUEMENT dans les API routes backend et scripts
 * - NE JAMAIS exposer côté client
 * - NE JAMAIS commit la service_role key
 * 
 * Usage:
 * - API routes: ✅ OUI (accès total requis)
 * - Scripts: ✅ OUI (migration, tests)
 * - Composants client: ❌ NON (utiliser supabase normal)
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => {
    const client = getSupabaseAdmin();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
