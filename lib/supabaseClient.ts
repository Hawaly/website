import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client Supabase singleton
let supabaseInstance: SupabaseClient | null = null;

/**
 * Récupère ou crée le client Supabase
 */
function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Récupération des variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Vérification que les variables sont définies
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies dans .env.local'
    );
  }

  // Création du client Supabase
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export du client via un getter
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => {
    const client = getSupabaseClient();
    return client[prop as keyof SupabaseClient];
  },
});

