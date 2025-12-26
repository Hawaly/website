import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    // Vérifier que la facture existe
    const { data: invoice, error: fetchError } = await supabase
      .from('invoice')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    const { error: updateError } = await supabase
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

