import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { generateContractNumber } from '@/lib/contractHelpers';
import { generateContractPDF } from '@/lib/pdfGenerator';
import { saveContract } from '@/lib/storageHelpers';
import { getCompanySettings } from '@/lib/companySettings';
import { Client, Mandat } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const body = await request.json();
    const { client_id, mandat_id } = body;

    // Validation
    if (!client_id) {
      return NextResponse.json(
        { error: 'Le client_id est requis' },
        { status: 400 }
      );
    }

    // Récupérer les informations du client
    const { data: client, error: clientError } = await supabase
      .from('client')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les informations du mandat (si fourni)
    let mandat: Mandat | null = null;
    if (mandat_id) {
      const { data: mandatData, error: mandatError } = await supabase
        .from('mandat')
        .select('*')
        .eq('id', mandat_id)
        .single();

      if (mandatError) {
        return NextResponse.json(
          { error: 'Mandat non trouvé' },
          { status: 404 }
        );
      }

      mandat = mandatData;
    }

    // Générer le numéro de contrat unique
    const contractNumber = await generateContractNumber();

    // Récupérer les paramètres de l'agence
    const companySettings = await getCompanySettings();

    // Générer le PDF
    const pdfBuffer = await generateContractPDF({
      contractNumber,
      client: client as Client,
      mandat,
      generatedDate: new Date(),
      companySettings,
    });

    // Sauvegarder le PDF (Supabase Storage sur Vercel, local en dev)
    const filePath = await saveContract(contractNumber, pdfBuffer);

    // Insérer l'enregistrement dans la table contrat
    const { data: contrat, error: insertError } = await supabase
      .from('contrat')
      .insert([
        {
          client_id: client_id,
          mandat_id: mandat_id || null,
          contrat_number: contractNumber,
          file_path: filePath,
          signed_date: null, // Pas encore signé
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erreur lors de l'insertion du contrat: ${insertError.message}`);
    }

    // Retourner le succès avec les informations du contrat
    return NextResponse.json({
      success: true,
      contrat: {
        id: contrat.id,
        contractNumber,
        filePath,
      },
      message: 'Contrat généré avec succès',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur lors de la génération du contrat:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la génération du contrat' },
      { status: 500 }
    );
  }
}

