import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl } from '@/lib/storageHelpers';
import { requireSession, loadInvoiceOr403 } from '@/lib/authz';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { id: invoiceId } = await params;

    // Charger facture avec vérification ownership
    const invoice = await loadInvoiceOr403(invoiceId, session);
    if (invoice instanceof NextResponse) return invoice;

    if (!invoice.pdf_path) {
      return NextResponse.json(
        { error: 'PDF non trouvé pour cette facture' },
        { status: 404 }
      );
    }

    // Get the download URL (signed URL for Supabase, local path for dev)
    const downloadUrl = await getDownloadUrl(invoice.pdf_path);
    
    // NextResponse.redirect requires an absolute URL
    // If it's a relative path, convert to absolute using the request origin
    if (downloadUrl.startsWith('/')) {
      const absoluteUrl = new URL(downloadUrl, request.url);
      return NextResponse.redirect(absoluteUrl);
    }
    
    return NextResponse.redirect(downloadUrl);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur téléchargement facture:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

