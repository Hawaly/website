/**
 * Script de Rollback RLS (Urgence)
 * 
 * Désactive RLS sur toutes les tables en cas de problème critique
 * 
 * ⚠️ À utiliser UNIQUEMENT en cas d'urgence
 * ⚠️ Consulter l'équipe avant d'exécuter
 * 
 * Usage: npx tsx scripts/rollback-rls.ts
 */

// Charger les variables d'environnement AVANT d'importer supabaseAdmin
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabaseAdmin';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function confirmRollback(): Promise<boolean> {
  console.log('\n⚠️  ROLLBACK RLS - MODE URGENCE\n');
  console.log('='.repeat(70));
  console.log('\nCette action va:');
  console.log('  1. Désactiver RLS sur TOUTES les tables');
  console.log('  2. Supprimer TOUTES les policies RLS');
  console.log('  3. Retourner à l\'état avant Phase 5\n');
  console.log('⚠️  ATTENTION: Cette action ne peut pas être annulée facilement!\n');
  console.log('='.repeat(70));
  
  const answer = await question('\nÊtes-vous SÛR de vouloir continuer? (tapez "OUI ROLLBACK" pour confirmer): ');
  
  return answer.trim() === 'OUI ROLLBACK';
}

async function rollbackRLS() {
  const confirmed = await confirmRollback();
  rl.close();

  if (!confirmed) {
    console.log('\n❌ Rollback annulé par l\'utilisateur\n');
    process.exit(0);
  }

  console.log('\n🔄 Démarrage du rollback RLS...\n');

  // Liste des tables à traiter
  const tables = [
    'audit_log', 'expense', 'expense_category', 'invoice_item', 'mandat',
    'video_script', 'role', 'social_media_strategy', 'user_session',
    'activity_log', 'app_user', 'client', 'company_settings', 'contrat',
    'mandat_task', 'invoice', 'activities', 'prospects', 'contacts',
    'meetings', 'meeting_minutes', 'pipeline_history', 'pitch_deck_assets',
    'pitch_decks', 'pitch_deck_versions', 'pitch_deck_templates',
    'video_task_details', 'video_figurant', 'editorial_calendar',
    'editorial_post', 'persona', 'pilier_contenu', 'kpi'
  ];

  let successCount = 0;
  let failCount = 0;

  // 1. Désactiver RLS sur toutes les tables
  console.log('📝 Étape 1/2: Désactivation de RLS...\n');

  for (const table of tables) {
    try {
      // Vérifier que la table existe
      const { error: checkError } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(0);

      if (checkError && checkError.message.includes('does not exist')) {
        console.log(`  ⏭️  ${table}: Table n'existe pas (skip)`);
        continue;
      }

      // Désactiver RLS via SQL direct
      const { error: disableError } = await supabaseAdmin.rpc('exec_sql', {
        query: `ALTER TABLE IF EXISTS public.${table} DISABLE ROW LEVEL SECURITY;`
      }).catch(() => ({ error: { message: 'Cannot execute RPC' } }));

      if (disableError) {
        console.log(`  ❌ ${table}: ${disableError.message}`);
        failCount++;
      } else {
        console.log(`  ✅ ${table}: RLS désactivé`);
        successCount++;
      }

    } catch (error: any) {
      console.log(`  ❌ ${table}: ${error.message}`);
      failCount++;
    }
  }

  // 2. Supprimer toutes les policies
  console.log('\n📝 Étape 2/2: Suppression des policies...\n');

  const policyPrefixes = ['admin_all_', 'client_select_', 'client_view_', 'authenticated_', 'user_'];

  for (const table of tables) {
    for (const prefix of policyPrefixes) {
      try {
        const policyName = `${prefix}${table}`;
        
        const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
          query: `DROP POLICY IF EXISTS ${policyName} ON public.${table};`
        }).catch(() => ({ error: { message: 'Cannot execute RPC' } }));

        if (!dropError) {
          console.log(`  🗑️  Policy ${policyName} supprimée`);
        }

      } catch (error) {
        // Ignorer les erreurs (policy n'existe peut-être pas)
      }
    }
  }

  // 3. Rapport final
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RAPPORT DE ROLLBACK\n');
  console.log(`✅ Succès:  ${successCount} tables`);
  console.log(`❌ Échecs:  ${failCount} tables`);
  console.log(`📊 Total:   ${tables.length} tables\n`);

  if (failCount > 0) {
    console.log('⚠️  Certaines tables n\'ont pas pu être traitées');
    console.log('   → Vérifier manuellement dans Supabase Dashboard');
    console.log('   → SQL Editor > Exécuter: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname=\'public\';\n');
  }

  console.log('='.repeat(70));
  console.log('\n📋 PROCHAINES ACTIONS:\n');
  console.log('1. Vérifier que l\'app fonctionne à nouveau');
  console.log('2. Identifier la cause du problème initial');
  console.log('3. Corriger les policies RLS');
  console.log('4. Tester en environnement de staging');
  console.log('5. Réactiver RLS quand prêt\n');

  console.log('💾 BACKUP RECOMMANDÉ:\n');
  console.log('Avant de réactiver RLS:');
  console.log('  pg_dump -d database > backup_before_rls.sql\n');

  console.log('='.repeat(70));
  console.log('\n✅ Rollback terminé\n');
}

// Exécuter le rollback
rollbackRLS().catch(error => {
  console.error('\n❌ Erreur fatale lors du rollback:', error);
  console.error('\n⚠️  CONTACTEZ UN ADMINISTRATEUR IMMÉDIATEMENT\n');
  process.exit(1);
});
