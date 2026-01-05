import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await createClient();

    // Déconnexion Supabase (supprime automatiquement les cookies)
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Erreur Supabase signOut:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion' },
        { status: 500 }
      );
    }

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
