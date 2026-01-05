import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl } from '@/lib/storageHelpers';
import { requireSession, loadContractOr403 } from '@/lib/authz';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { id: contractId } = await params;

    // Charger contrat avec vérification ownership
    const contrat = await loadContractOr403(contractId, session);
    if (contrat instanceof NextResponse) return contrat;

    // Get the download URL (signed URL for Supabase, local path for dev)
    const downloadUrl = await getDownloadUrl(contrat.file_path);
    
    return NextResponse.redirect(downloadUrl);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur téléchargement contrat:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

