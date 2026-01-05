import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = ['/login', '/client-login', '/', '/hash-password'];

// Routes API publiques
const PUBLIC_API_ROUTES = ['/api/login', '/api/auth/login', '/api/hash-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

  // Ne pas protéger les routes publiques et les assets
  if (isPublicRoute || isPublicApiRoute || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Créer client Supabase avec gestion cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Récupérer la session Supabase Auth
  const { data: { session } } = await supabase.auth.getSession();

  // Routes protégées qui nécessitent authentification
  const protectedRoutes = ['/dashboard', '/client-portal', '/sales'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Si route protégée et pas de session, rediriger vers login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si session existe, récupérer les infos utilisateur pour vérifier le rôle
  if (session) {
    // Récupérer role_id depuis app_user (via cookie ou API)
    // Pour l'instant, on fait une requête simple
    const { data: userData } = await supabase
      .from('app_user')
      .select('role_id, client_id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (userData) {
      const isAdmin = userData.role_id === 1;

      // Si user authentifié essaie d'accéder à /login, rediriger selon rôle
      if (pathname === '/login') {
        const redirectUrl = isAdmin 
          ? new URL('/dashboard', request.url)
          : new URL('/client-portal', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Protéger /dashboard (admin seulement)
      if (pathname.startsWith('/dashboard') && !isAdmin) {
        const clientPortalUrl = new URL('/client-portal', request.url);
        return NextResponse.redirect(clientPortalUrl);
      }

      // Protéger /client-portal (clients seulement)
      if (pathname.startsWith('/client-portal') && isAdmin) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return response;
}

// Configuration du matcher pour appliquer le middleware
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - Static files (_next/static)
     * - Image optimization files (_next/image)
     * - Favicon
     * - Public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
