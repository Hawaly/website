import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getDownloadUrl } from '@/lib/storageHelpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;

    // Récupérer les informations du contrat
    const { data: contrat, error: contratError } = await supabase
      .from('contrat')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contratError || !contrat) {
      return NextResponse.json(
        { error: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

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

