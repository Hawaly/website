import { NextRequest, NextResponse } from 'next/server';
import { getReceiptDownloadUrl } from '@/lib/expenseHelpers';
import { requireSession, loadExpenseOr403 } from '@/lib/authz';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { id: expenseId } = await params;

    // Charger dépense avec vérification ownership
    const expense = await loadExpenseOr403(expenseId, session);
    if (expense instanceof NextResponse) return expense;

    if (!expense.receipt_path) {
      return NextResponse.json(
        { error: 'Justificatif non trouvé pour cette dépense' },
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

