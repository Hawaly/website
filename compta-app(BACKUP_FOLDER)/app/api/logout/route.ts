import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    // Suppression du cookie de session
    await destroySession();

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur lors du logout:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la déconnexion' },
      { status: 500 }
    );
  }
}


