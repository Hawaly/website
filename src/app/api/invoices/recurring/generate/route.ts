import { NextRequest, NextResponse } from 'next/server';
import { generateRecurringInvoice } from '@/lib/invoiceReports';

export async function POST(request: NextRequest) {
  try {
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
