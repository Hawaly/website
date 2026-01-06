import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et rôle admin uniquement
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: invoiceId } = await params;

    // 1. Supprimer d'abord les items de la facture
    const { error: itemsError } = await supabaseAdmin
      .from('invoice_item')
      .delete()
      .eq('invoice_id', invoiceId);

    if (itemsError) {
      throw new Error(`Erreur suppression items: ${itemsError.message}`);
    }

    // 2. Supprimer la facture
    const { error: invoiceError } = await supabaseAdmin
      .from('invoice')
      .delete()
      .eq('id', invoiceId);

    if (invoiceError) {
      throw new Error(`Erreur suppression facture: ${invoiceError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Facture supprimée avec succès',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur delete invoice:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
