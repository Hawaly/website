import { createBrowserClient } from '@supabase/ssr';

/**
 * Client Supabase avec authentification pour composants Client
 * 
 * ✅ Utilise automatiquement:
 * - Session Supabase Auth (JWT dans cookies)
 * - RLS policies appliquées selon l'utilisateur connecté
 * - Auto-refresh des tokens
 * 
 * 🔄 Remplace l'ancien client pour compatibilité avec RLS
 */

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

