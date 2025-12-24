import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, SESSION_COOKIE_NAME } from './lib/auth';

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = ['/login', '/client-login', '/', '/hash-password', '/api/login'];

// Routes API publiques
const PUBLIC_API_ROUTES = ['/api/login', '/api/hash-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

  // Ne pas protéger les routes publiques et les assets
  if (isPublicRoute || isPublicApiRoute || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Récupérer le cookie de session
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Si pas de cookie et route protégée (client-portal), rediriger vers login
  if (!sessionCookie?.value && pathname.startsWith('/client-portal')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si cookie présent, vérifier la validité du token
  if (sessionCookie?.value) {
    const session = await verifyToken(sessionCookie.value);

    // Si le token est invalide et route protégée, rediriger vers login
    if (!session && (pathname.startsWith('/client-portal') || pathname.startsWith('/dashboard'))) {
      const loginUrl = new URL('/login', request.url);
      // Supprimer le cookie invalide
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Si l'utilisateur est authentifié et essaie d'accéder à /login, rediriger selon son rôle
    if (session && pathname === '/login') {
      // Admin (role_id = 1) -> /dashboard, Client -> /client-portal
      const redirectUrl = session.roleId === 1 
        ? new URL('/dashboard', request.url)
        : new URL('/client-portal', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Protéger les routes dashboard (admin uniquement)
    if (session && pathname.startsWith('/dashboard') && session.roleId !== 1) {
      const clientPortalUrl = new URL('/client-portal', request.url);
      return NextResponse.redirect(clientPortalUrl);
    }

    // Protéger les routes client-portal (clients uniquement)
    if (session && pathname.startsWith('/client-portal') && session.roleId === 1) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Si pas de cookie et route dashboard protégée, rediriger vers login
  if (!sessionCookie?.value && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Continuer normalement
  return NextResponse.next();
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
