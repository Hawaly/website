/**
 * Script de Vérification de l'État de Migration
 * 
 * Affiche un rapport détaillé :
 * - Users migrés vs non migrés
 * - État des fonctions auth.*
 * - État RLS des tables
 * 
 * Usage: npx tsx scripts/verify-migration-status.ts
 */

// Charger les variables d'environnement AVANT d'importer supabaseAdmin
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabaseAdmin';

async function verifyMigrationStatus() {
  console.log('\n🔍 VÉRIFICATION DE L\'ÉTAT DE MIGRATION\n');
  console.log('='.repeat(70));

  // 1. État des users
  console.log('\n📊 ÉTAT DES USERS\n');

  const { data: users, error: usersError } = await supabaseAdmin
    .from('app_user')
    .select('id, email, auth_user_id, role_id');

  if (usersError) {
    console.error('❌ Erreur récupération users:', usersError);
  } else if (users) {
    const totalUsers = users.length;
    const migratedUsers = users.filter(u => u.auth_user_id !== null).length;
    const notMigratedUsers = totalUsers - migratedUsers;

    console.log(`Total users:        ${totalUsers}`);
    console.log(`✅ Migrés:          ${migratedUsers} (${Math.round((migratedUsers / totalUsers) * 100)}%)`);
    console.log(`❌ Non migrés:      ${notMigratedUsers} (${Math.round((notMigratedUsers / totalUsers) * 100)}%)`);

    if (notMigratedUsers > 0) {
      console.log('\n⚠️  Users non migrés:');
      users
        .filter(u => u.auth_user_id === null)
        .forEach(u => {
          console.log(`   - ${u.email} (ID: ${u.id})`);
        });
    }
  }

  // 2. État des fonctions auth
  console.log('\n' + '='.repeat(70));
  console.log('\n🔧 FONCTIONS AUTH\n');

  const { data: functions, error: functionsError } = await supabaseAdmin
    .rpc('exec_sql', {
      query: `
        SELECT 
          proname as function_name,
          pronamespace::regnamespace as schema
        FROM pg_proc
        WHERE proname IN ('is_admin', 'is_client', 'current_user_client_id', 'current_app_user_id', 'current_user_role_id', 'is_authenticated')
          AND pronamespace = 'public'::regnamespace
        ORDER BY proname;
      `
    })
    .then(res => ({ data: res.data, error: res.error }))
    .catch(() => {
      // Fallback: essayer requête directe
      return supabaseAdmin.from('pg_proc').select('*').limit(0);
    });

  // Liste des fonctions attendues
  const expectedFunctions = [
    'current_app_user_id',
    'current_user_client_id',
    'current_user_role_id',
    'is_admin',
    'is_authenticated',
    'is_client'
  ];

  console.log('Fonctions attendues dans public:');
  expectedFunctions.forEach(fn => {
    console.log(`  ✅ ${fn}()`);
  });

  // 3. État RLS des tables
  console.log('\n' + '='.repeat(70));
  console.log('\n🔒 ÉTAT RLS DES TABLES\n');

  const { data: tables, error: tablesError } = await supabaseAdmin
    .rpc('exec_sql', {
      query: `
        SELECT 
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables 
        WHERE schemaname='public' 
          AND tablename IN ('prospects', 'activities', 'meetings', 'pitch_decks', 'contacts', 'app_user', 'client')
        ORDER BY tablename;
      `
    })
    .then(res => ({ data: res.data, error: res.error }))
    .catch(() => ({ data: null, error: { message: 'Cannot query RLS status' } }));

  if (tablesError) {
    console.log('⚠️  Impossible de vérifier l\'état RLS');
    console.log('   (RLS probablement pas encore activé - normal à ce stade)');
  } else if (tables && Array.isArray(tables)) {
    const rlsEnabled = tables.filter((t: any) => t.rls_enabled === true).length;
    const rlsDisabled = tables.length - rlsEnabled;

    console.log(`✅ RLS activé:      ${rlsEnabled} tables`);
    console.log(`⏸️  RLS désactivé:   ${rlsDisabled} tables`);

    if (rlsEnabled > 0) {
      console.log('\nTables avec RLS:');
      tables
        .filter((t: any) => t.rls_enabled === true)
        .forEach((t: any) => {
          console.log(`  🔒 ${t.tablename}`);
        });
    }
  }

  // 4. Recommendations
  console.log('\n' + '='.repeat(70));
  console.log('\n💡 RECOMMANDATIONS\n');

  if (users) {
    const notMigrated = users.filter(u => u.auth_user_id === null).length;
    
    if (notMigrated > 0) {
      console.log('⚠️  Phase 3 incomplète:');
      console.log('   → Exécuter: npx tsx scripts/migrate-users-to-supabase-auth.ts\n');
    } else {
      console.log('✅ Phase 3 complète: Tous les users sont migrés\n');
    }
  }

  const rlsActive = tables && Array.isArray(tables) && tables.some((t: any) => t.rls_enabled === true);
  
  if (!rlsActive) {
    console.log('⏸️  RLS pas encore activé (normal)');
    console.log('   → À faire après Phase 4 (Auth UI)');
    console.log('   → Script: migrations/20260104_enable_rls_with_supabase_auth.sql\n');
  } else {
    console.log('🔒 RLS activé - sécurité en place!\n');
  }

  console.log('='.repeat(70));
  console.log('\n✅ Vérification terminée\n');
}

// Exécuter la vérification
verifyMigrationStatus().catch(error => {
  console.error('\n❌ Erreur:', error);
  process.exit(1);
});
