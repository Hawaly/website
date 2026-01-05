import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et rôle admin uniquement
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: invoiceId } = await params;

    // Mettre à jour le statut
    const { error: updateError } = await supabaseAdmin
      .from('invoice')
      .update({ status: 'payee' })
      .eq('id', invoiceId);

    if (updateError) {
      throw new Error(`Erreur mise à jour: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Facture marquée comme payée',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur mark-paid:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

