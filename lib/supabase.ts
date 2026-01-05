import { createBrowserClient } from '@supabase/ssr';

/**
 * Client Supabase pour les composants Client (browser)
 * 
 * Utilise automatiquement:
 * - JWT Supabase Auth dans le cookie
 * - Session persistante
 * - Auto-refresh des tokens
 * 
 * Usage:
 * - Composants Client: ✅ OUI (avec 'use client')
 * - Server Components: ❌ NON (utiliser createServerClient)
 * - API Routes: ❌ NON (utiliser supabaseAdmin)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
