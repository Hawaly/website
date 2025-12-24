/**
 * Script de diagnostic Supabase Storage
 * Vérifie que les buckets existent et sont accessibles
 */

require('dotenv').config({ path: '.env.local' });

async function testStorage() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🔍 Test de Supabase Storage\n');
  console.log('URL:', supabaseUrl);
  console.log('');

  // Test 1: Lister les buckets
  console.log('📦 1. Liste des buckets disponibles:\n');
  
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Erreur:', bucketsError.message);
  } else if (buckets && buckets.length > 0) {
    console.log('Buckets trouvés:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'privé'}, id: ${bucket.id})`);
    });
    console.log('');
  } else {
    console.log('❌ Aucun bucket trouvé!\n');
    console.log('Vous devez créer les buckets:');
    console.log('  1. contracts (pour PDF contrats et factures)');
    console.log('  2. receipts (pour justificatifs dépenses)\n');
  }

  // Test 2: Vérifier le bucket "contracts"
  console.log('📄 2. Test du bucket "contracts":\n');
  
  const contractsBucket = buckets?.find(b => b.name === 'contracts');
  
  if (!contractsBucket) {
    console.log('❌ Le bucket "contracts" n\'existe PAS\n');
    console.log('Créez-le dans Supabase:');
    console.log('  Storage → New bucket → Name: contracts → Public: NON\n');
  } else {
    console.log('✅ Le bucket "contracts" existe');
    console.log(`   ID: ${contractsBucket.id}`);
    console.log(`   Public: ${contractsBucket.public ? 'Oui' : 'Non'}`);
    
    // Tester l'upload
    console.log('\n   Test d\'upload...');
    
    const testFile = Buffer.from('Test PDF');
    const testPath = 'test/test.pdf';
    
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(testPath, testFile, {
        contentType: 'application/pdf',
        upsert: true,
      });
    
    if (uploadError) {
      console.log(`   ❌ Erreur upload: ${uploadError.message}`);
      console.log(`   → Vérifiez les permissions RLS`);
      console.log(`   → Storage → Policies → Bucket contracts → Disable RLS\n`);
    } else {
      console.log('   ✅ Upload réussi!');
      
      // Nettoyer le fichier de test
      await supabase.storage.from('contracts').remove([testPath]);
      console.log('   ✅ Fichier de test nettoyé\n');
    }
  }

  // Test 3: Vérifier le bucket "receipts"
  console.log('📸 3. Test du bucket "receipts":\n');
  
  const receiptsBucket = buckets?.find(b => b.name === 'receipts');
  
  if (!receiptsBucket) {
    console.log('❌ Le bucket "receipts" n\'existe PAS\n');
    console.log('Créez-le dans Supabase:');
    console.log('  Storage → New bucket → Name: receipts → Public: NON\n');
  } else {
    console.log('✅ Le bucket "receipts" existe');
    console.log(`   ID: ${receiptsBucket.id}`);
    console.log(`   Public: ${receiptsBucket.public ? 'Oui' : 'Non'}\n`);
  }

  console.log('─────────────────────────────────────');
  console.log('\n✨ Diagnostic terminé!\n');
  
  if (!contractsBucket || !receiptsBucket) {
    console.log('⚠️  ACTION REQUISE:');
    console.log('   Créez les buckets manquants dans Supabase Storage\n');
  } else {
    console.log('✅ Tous les buckets sont présents!\n');
  }
}

testStorage().catch(console.error);

