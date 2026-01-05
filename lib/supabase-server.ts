import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client Supabase pour Server Components et Server Actions
 * 
 * Utilise automatiquement:
 * - JWT Supabase Auth dans le cookie
 * - Respect des RLS policies
 * 
 * Usage:
 * - Server Components: ✅ OUI
 * - Server Actions: ✅ OUI
 * - Route Handlers: ✅ OUI (si RLS policies requises)
 * - API Routes qui nécessitent bypass RLS: ❌ NON (utiliser supabaseAdmin)
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );
}
