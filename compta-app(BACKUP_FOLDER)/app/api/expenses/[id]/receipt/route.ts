import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getReceiptDownloadUrl } from '@/lib/expenseHelpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = params.id;

    const { data: expense, error: expenseError } = await supabase
      .from('expense')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (expenseError || !expense || !expense.receipt_path) {
      return NextResponse.json(
        { error: 'Dépense ou justificatif non trouvé' },
        { status: 404 }
      );
    }

    // Générer URL signée
    const downloadUrl = await getReceiptDownloadUrl(expense.receipt_path);

    return NextResponse.redirect(downloadUrl);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur téléchargement justificatif:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

