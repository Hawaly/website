import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateSwissQrBill } from '@/lib/qrBillGenerator';
import { saveQrBill } from '@/lib/storageHelpers';
import { Client, Invoice, CompanySettings } from '@/types/database';
import { requireSession, loadInvoiceOr403 } from '@/lib/authz';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const invoiceId = id;

    // Charger facture avec vérification ownership (admin ou owner)
    const invoiceBase = await loadInvoiceOr403(invoiceId, session);
    if (invoiceBase instanceof NextResponse) return invoiceBase;

    // Récupérer la facture avec le client pour la génération QR-bill
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoice')
      .select(`
        *,
        client:client_id (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les paramètres de l'agence (TOUJOURS depuis la DB, pas de cache)
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError) {
      return NextResponse.json(
        { 
          error: 'Impossible de récupérer les paramètres de l\'agence',
          details: settingsError.message 
        },
        { status: 500 }
      );
    }

    if (!settingsData) {
      return NextResponse.json(
        { error: 'Aucune configuration trouvée dans company_settings' },
        { status: 500 }
      );
    }

    const companySettings = settingsData as CompanySettings;

    // Générer le QR-bill
    const pdfBuffer = await generateSwissQrBill({
      invoice: invoice as Invoice,
      client: invoice.client as Client,
      companySettings,
    });

    // Stocker le QR-bill localement et supprimer l'ancien s'il existe
    const oldQrBillPath = (invoice as Invoice & { qr_bill_path?: string | null }).qr_bill_path || null;
    const qrBillPath = await saveQrBill(
      invoice.invoice_number,
      pdfBuffer,
      oldQrBillPath
    );

    // Mettre à jour la facture avec le nouveau chemin du QR-bill (si le champ existe)
    try {
      await supabaseAdmin
        .from('invoice')
        .update({ qr_bill_path: qrBillPath })
        .eq('id', invoiceId);
    } catch {
      // Le champ qr_bill_path n'existe peut-être pas dans la DB
    }

    // Retourner le PDF avec cache-busting pour forcer le téléchargement de la nouvelle version
    const timestamp = Date.now();
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="QR-${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Generated-At': timestamp.toString(), // Header personnalisé pour cache-busting
      },
    });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la génération du QR-bill' },
      { status: 500 }
    );
  }
}

