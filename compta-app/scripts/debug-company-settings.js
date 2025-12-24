/**
 * Script de diagnostic pour vérifier les données company_settings
 * Usage: node scripts/debug-company-settings.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  console.error('Assurez-vous que .env.local contient:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCompanySettings() {
  console.log('🔍 Diagnostic des company_settings...\n');

  try {
    // Récupérer les données
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      return;
    }

    if (!data) {
      console.error('❌ Aucune donnée trouvée dans company_settings !');
      console.error('   La table est peut-être vide.');
      return;
    }

    console.log('✅ Données récupérées depuis la DB:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID:', data.id);
    console.log('Agency Name:', data.agency_name || '(vide)');
    console.log('Represented By:', data.represented_by || '(vide)');
    console.log('Address:', data.address || '(vide)');
    console.log('Zip Code:', data.zip_code || '(vide)');
    console.log('City:', data.city || '(vide)');
    console.log('Country:', data.country || '(vide)');
    console.log('Phone:', data.phone || '(vide)');
    console.log('Email:', data.email || '(vide)');
    console.log('TVA Number:', data.tva_number || '(vide)');
    console.log('IBAN:', data.iban || '(vide)');
    console.log('QR-IBAN:', data.qr_iban || '(vide)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Vérifier les champs requis pour QR-bill
    const requiredFields = ['address', 'zip_code', 'city', 'represented_by'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      console.warn('⚠️  Champs manquants pour QR-bill:');
      missingFields.forEach(field => {
        console.warn(`   - ${field}`);
      });
      console.log('');
    } else {
      console.log('✅ Tous les champs requis sont présents\n');
    }

    // Vérifier si l'adresse contient des valeurs de test
    const testAddresses = ['Rue Exemple', 'Rue de la Paix', 'Example', 'Test'];
    const addressLower = (data.address || '').toLowerCase();
    const hasTestAddress = testAddresses.some(test => addressLower.includes(test.toLowerCase()));

    if (hasTestAddress) {
      console.warn('⚠️  ATTENTION: L\'adresse semble être une valeur de test !');
      console.warn(`   Adresse actuelle: "${data.address}"`);
      console.warn('   Veuillez mettre à jour avec votre vraie adresse dans Supabase.\n');
    }

    // Afficher la requête SQL pour mettre à jour
    console.log('📝 Pour mettre à jour dans Supabase SQL Editor:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`UPDATE company_settings`);
    console.log(`SET`);
    console.log(`  address = 'VOTRE_VRAIE_ADRESSE',`);
    console.log(`  zip_code = 'VOTRE_CODE_POSTAL',`);
    console.log(`  city = 'VOTRE_VILLE',`);
    console.log(`  represented_by = 'Mohamad Hawaley'`);
    console.log(`WHERE id = ${data.id};`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
  }

  process.exit(0);
}

debugCompanySettings();


