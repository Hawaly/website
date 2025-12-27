import { NextRequest, NextResponse } from 'next/server';
import { getRecurringInvoices, generateRecurringInvoice } from '@/lib/invoiceReports';

export async function POST(request: NextRequest) {
  try {
    const recurringInvoices = await getRecurringInvoices();
    
    // Filtrer les factures qui doivent être générées
    const toGenerate = recurringInvoices.filter(invoice => {
      if (!invoice.next_generation_date) return false;
      if (invoice.is_recurring === 'oneshot') return false;
      return new Date(invoice.next_generation_date) <= new Date();
    });

    if (toGenerate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune facture à générer',
        generated: []
      });
    }

    const results = [];
    const errors = [];

    for (const invoice of toGenerate) {
      try {
        const newInvoice = await generateRecurringInvoice(invoice.id);
        results.push({
          originalId: invoice.id,
          newInvoice,
          success: true
        });
      } catch (error) {
        errors.push({
          invoiceId: invoice.id,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} facture(s) générée(s)`,
      generated: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Erreur génération batch factures récurrentes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
