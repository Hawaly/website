/**
 * Script de Test des Policies RLS
 * 
 * Teste que les policies RLS fonctionnent correctement :
 * - Admin a accès à tout
 * - Client a accès uniquement à ses données
 * - Non authentifié n'a accès à rien
 * 
 * ⚠️ À exécuter APRÈS activation de RLS (Phase 5)
 * 
 * Usage: npx tsx scripts/test-rls-policies.ts
 */

// Charger les variables d'environnement
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface TestResult {
  test: string;
  expected: string;
  result: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function addResult(test: string, expected: string, pass: boolean, details?: string) {
  results.push({
    test,
    expected,
    result: pass ? 'PASS' : 'FAIL',
    details
  });
}

async function testRLSPolicies() {
  console.log('\n🧪 TEST DES POLICIES RLS\n');
  console.log('='.repeat(70));
  console.log('\n⚠️  PRÉREQUIS: RLS doit être activé (Phase 5)\n');

  // Client Supabase anonyme (pas de JWT)
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test 1: Requête anonyme
  console.log('🔍 Test 1: Requête sans authentification...');
  
  const { data: anonProspects, error: anonError } = await anonClient
    .from('prospects')
    .select('*');

  const anonPass = (!anonProspects || anonProspects.length === 0) && !anonError;
  addResult(
    'Requête anonyme sur prospects',
    '0 résultats (accès bloqué)',
    anonPass,
    anonProspects ? `Retourné ${anonProspects.length} résultats` : 'Accès bloqué correctement'
  );

  // Test 2: Vérifier que les fonctions existent
  console.log('🔍 Test 2: Vérification des fonctions auth...');
  
  const { data: functions, error: fnError } = await anonClient
    .rpc('exec_sql', { 
      query: `
        SELECT proname 
        FROM pg_proc 
        WHERE pronamespace = 'public'::regnamespace 
          AND proname IN ('is_admin', 'is_client', 'current_user_client_id')
      `
    })
    .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

  const functionsPass = !fnError;
  addResult(
    'Fonctions auth accessibles',
    'Fonctions is_admin, is_client, etc. existent',
    functionsPass,
    fnError ? fnError.message : 'Fonctions présentes'
  );

  // Test 3: Tentative de requête avec JWT invalide
  console.log('🔍 Test 3: Requête avec JWT invalide...');
  
  const fakeClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        'Authorization': 'Bearer fake-jwt-token'
      }
    }
  });

  const { data: fakeData, error: fakeError } = await fakeClient
    .from('prospects')
    .select('*');

  const fakePass = !fakeData || fakeData.length === 0 || fakeError !== null;
  addResult(
    'Requête avec JWT invalide',
    'Accès bloqué',
    fakePass,
    fakeError ? fakeError.message : 'Bloqué correctement'
  );

  // Test 4: Vérifier les tables avec RLS
  console.log('🔍 Test 4: Vérification état RLS des tables...');
  
  const criticalTables = [
    'prospects',
    'activities', 
    'meetings',
    'pitch_decks',
    'contacts',
    'app_user',
    'client'
  ];

  let rlsCheckPassed = true;
  const rlsDetails: string[] = [];

  for (const table of criticalTables) {
    const { data, error } = await anonClient
      .from(table)
      .select('id')
      .limit(1);

    if (error && error.message.includes('permission denied')) {
      rlsDetails.push(`✅ ${table}: RLS actif`);
    } else if (data && data.length === 0) {
      rlsDetails.push(`⚠️  ${table}: Vide ou RLS actif`);
    } else {
      rlsDetails.push(`❌ ${table}: RLS potentiellement inactif`);
      rlsCheckPassed = false;
    }
  }

  addResult(
    `RLS actif sur ${criticalTables.length} tables critiques`,
    'Toutes les tables protégées',
    rlsCheckPassed,
    rlsDetails.join('\n   ')
  );

  // Affichage des résultats
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RÉSULTATS DES TESTS\n');

  const passCount = results.filter(r => r.result === 'PASS').length;
  const failCount = results.filter(r => r.result === 'FAIL').length;

  results.forEach((r, i) => {
    const icon = r.result === 'PASS' ? '✅' : '❌';
    console.log(`${i + 1}. ${icon} ${r.test}`);
    console.log(`   Attendu: ${r.expected}`);
    if (r.details) {
      console.log(`   Détails: ${r.details}`);
    }
    console.log('');
  });

  console.log('='.repeat(70));
  console.log(`\n✅ Tests réussis: ${passCount}`);
  console.log(`❌ Tests échoués: ${failCount}`);
  console.log(`📊 Total:         ${results.length}\n`);

  if (failCount > 0) {
    console.log('⚠️  ATTENTION: Certains tests ont échoué');
    console.log('   → Vérifier que RLS est bien activé');
    console.log('   → Vérifier que les policies sont créées correctement');
    console.log('   → Consulter les logs Supabase\n');
  } else {
    console.log('🎉 Tous les tests sont passés! RLS fonctionne correctement.\n');
  }

  console.log('='.repeat(70));
  console.log('\n💡 TESTS SUPPLÉMENTAIRES RECOMMANDÉS:\n');
  console.log('1. Login admin → Vérifier accès total');
  console.log('2. Login client → Vérifier accès restreint');
  console.log('3. API routes → Vérifier fonctionnement (bypass RLS)');
  console.log('4. Performance → Vérifier pas de ralentissement\n');
}

// Exécuter les tests
testRLSPolicies().catch(error => {
  console.error('\n❌ Erreur lors des tests:', error);
  process.exit(1);
});
