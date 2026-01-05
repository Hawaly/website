import { NextRequest, NextResponse } from 'next/server';
import { generateRecurringInvoice } from '@/lib/invoiceReports';
import { requireRole } from '@/lib/authz';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et droits admin uniquement
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID de facture manquant' },
        { status: 400 }
      );
    }

    const newInvoice = await generateRecurringInvoice(invoiceId);

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      message: 'Facture générée avec succès'
    });
  } catch (error) {
    console.error('Erreur génération facture récurrente:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
