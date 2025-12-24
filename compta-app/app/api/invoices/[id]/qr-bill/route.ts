import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { generateSwissQrBill } from '@/lib/qrBillGenerator';
import { saveQrBill } from '@/lib/storageHelpers';
import { Client, Invoice, CompanySettings } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestTimestamp = Date.now();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 NOUVELLE REQUÊTE QR-BILL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Timestamp:', new Date(requestTimestamp).toISOString());
  console.log('  Invoice ID:', params.id);
  console.log('  URL:', request.url);
  
  try {
    const invoiceId = params.id;

    // Récupérer la facture avec le client
    const { data: invoice, error: invoiceError } = await supabase
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
    // On récupère directement depuis Supabase pour avoir les données à jour
    console.log('📥 Récupération company_settings depuis Supabase...');
    const { data: settingsData, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();
    
    console.log('📥 Résultat récupération:', {
      hasData: !!settingsData,
      hasError: !!settingsError,
      errorCode: settingsError?.code,
    });

    if (settingsError) {
      console.error('❌ ERREUR récupération company_settings:', {
        code: settingsError.code,
        message: settingsError.message,
        details: settingsError.details,
        hint: settingsError.hint,
      });
      return NextResponse.json(
        { 
          error: 'Impossible de récupérer les paramètres de l\'agence',
          details: settingsError.message 
        },
        { status: 500 }
      );
    }

    if (!settingsData) {
      console.error('❌ Aucune donnée dans company_settings !');
      return NextResponse.json(
        { error: 'Aucune configuration trouvée dans company_settings' },
        { status: 500 }
      );
    }

    const companySettings = settingsData as CompanySettings;
    
    // Log détaillé pour vérifier les valeurs récupérées depuis la DB
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Company Settings récupérés depuis DB:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ID:', companySettings.id);
    console.log('  Address:', companySettings.address || '(VIDE)');
    console.log('  Zip Code:', companySettings.zip_code || '(VIDE)');
    console.log('  City:', companySettings.city || '(VIDE)');
    console.log('  Represented By:', companySettings.represented_by || '(VIDE)');
    console.log('  IBAN:', companySettings.iban || '(VIDE)');
    console.log('  QR-IBAN:', companySettings.qr_iban || '(VIDE)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Vérifier si l'adresse semble être une valeur de test
    const testAddresses = ['Rue Exemple', 'Rue de la Paix', 'Example', 'Test'];
    const addressLower = (companySettings.address || '').toLowerCase();
    const hasTestAddress = testAddresses.some(test => addressLower.includes(test.toLowerCase()));
    
    if (hasTestAddress) {
      console.warn('⚠️  ATTENTION: L\'adresse semble être une valeur de test !');
      console.warn(`   Adresse actuelle: "${companySettings.address}"`);
      console.warn('   Veuillez mettre à jour avec votre vraie adresse dans Supabase.');
    }

    // Générer le QR-bill
    const pdfBuffer = await generateSwissQrBill({
      invoice: invoice as Invoice,
      client: invoice.client as Client,
      companySettings,
    });

    // Stocker le QR-bill localement et supprimer l'ancien s'il existe
    // Note: Si un champ qr_bill_path existe dans la table invoice, on le récupère
    console.log('💾 Sauvegarde du QR-bill...');
    const oldQrBillPath = (invoice as Invoice & { qr_bill_path?: string | null }).qr_bill_path || null;
    if (oldQrBillPath) {
      console.log('  Ancien chemin trouvé:', oldQrBillPath);
    } else {
      console.log('  Aucun ancien chemin trouvé dans la DB');
    }
    
    const qrBillPath = await saveQrBill(
      invoice.invoice_number,
      pdfBuffer,
      oldQrBillPath
    );
    
    console.log('✅ QR-bill sauvegardé:', qrBillPath);

    // Mettre à jour la facture avec le nouveau chemin du QR-bill (si le champ existe)
    // On essaie de mettre à jour, mais on ignore l'erreur si le champ n'existe pas
    try {
      await supabase
        .from('invoice')
        .update({ qr_bill_path: qrBillPath })
        .eq('id', invoiceId);
    } catch (updateError) {
      // Le champ qr_bill_path n'existe peut-être pas dans la DB
      // Ce n'est pas grave, on continue quand même
      console.warn('Impossible de mettre à jour qr_bill_path:', updateError);
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
    console.error('Erreur génération QR-bill:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la génération du QR-bill' },
      { status: 500 }
    );
  }
}

