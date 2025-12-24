import { NextResponse } from 'next/server';
import { destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    // Suppression du cookie de session
    await destroySession();

    // Créer la réponse avec un header Set-Cookie pour supprimer le cookie
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });

    // Double sécurité: ajouter un header Set-Cookie pour forcer la suppression
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur lors du logout:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la déconnexion' },
      { status: 500 }
    );
  }
}


