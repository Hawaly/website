/**
 * Script de Migration Automatique des Users vers Supabase Auth
 * 
 * Ce script :
 * 1. Récupère tous les app_user sans auth_user_id
 * 2. Crée un compte Supabase Auth pour chacun
 * 3. Lie le auth_user_id dans app_user
 * 4. Génère un rapport de migration
 * 
 * Usage: npx tsx scripts/migrate-users-to-supabase-auth.ts
 */

// Charger les variables d'environnement AVANT d'importer supabaseAdmin
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabaseAdmin';
import * as crypto from 'crypto';

interface AppUser {
  id: number;
  email: string;
  password_hash?: string;
  is_active: boolean;
  role_id: number;
}

interface MigrationResult {
  success: boolean;
  email: string;
  auth_user_id?: string;
  error?: string;
  temporaryPassword?: string;
}

/**
 * Génère un mot de passe temporaire sécurisé
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Migre un seul user vers Supabase Auth
 */
async function migrateUser(user: AppUser): Promise<MigrationResult> {
  const temporaryPassword = generateTemporaryPassword();
  
  try {
    // 1. Créer le user dans Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        app_user_id: user.id,
        role_id: user.role_id,
        migrated_at: new Date().toISOString()
      }
    });

    if (authError) {
      return {
        success: false,
        email: user.email,
        error: authError.message
      };
    }

    if (!authUser || !authUser.user) {
      return {
        success: false,
        email: user.email,
        error: 'No user returned from Supabase Auth'
      };
    }

    // 2. Lier auth_user_id dans app_user
    const { error: updateError } = await supabaseAdmin
      .from('app_user')
      .update({ auth_user_id: authUser.user.id })
      .eq('id', user.id);

    if (updateError) {
      // Essayer de supprimer le user Supabase créé
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      
      return {
        success: false,
        email: user.email,
        error: `Failed to link auth_user_id: ${updateError.message}`
      };
    }

    return {
      success: true,
      email: user.email,
      auth_user_id: authUser.user.id,
      temporaryPassword
    };

  } catch (error: any) {
    return {
      success: false,
      email: user.email,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Fonction principale de migration
 */
async function migrateAllUsers() {
  console.log('\n🚀 Migration des Users vers Supabase Auth\n');
  console.log('='.repeat(60));

  // 1. Récupérer tous les users non migrés
  console.log('\n📊 Récupération des users à migrer...');
  const { data: users, error: fetchError } = await supabaseAdmin
    .from('app_user')
    .select('id, email, is_active, role_id, auth_user_id')
    .is('auth_user_id', null);

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des users:', fetchError);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('✅ Aucun user à migrer (tous déjà migrés)');
    process.exit(0);
  }

  console.log(`\n📝 ${users.length} user(s) à migrer\n`);

  // 2. Migrer chaque user
  const results: MigrationResult[] = [];
  const passwords: { email: string; password: string }[] = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`[${i + 1}/${users.length}] Migration de: ${user.email}`);

    const result = await migrateUser(user);
    results.push(result);

    if (result.success) {
      console.log(`  ✅ Succès (auth_user_id: ${result.auth_user_id})`);
      if (result.temporaryPassword) {
        passwords.push({
          email: result.email,
          password: result.temporaryPassword
        });
      }
    } else {
      console.log(`  ❌ Échec: ${result.error}`);
    }
  }

  // 3. Rapport final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE MIGRATION\n');

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  console.log(`✅ Réussies: ${successCount}`);
  console.log(`❌ Échouées: ${failureCount}`);
  console.log(`📊 Total:    ${results.length}\n`);

  // 4. Afficher les erreurs
  if (failureCount > 0) {
    console.log('❌ ERREURS:\n');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.email}: ${r.error}`);
      });
    console.log('');
  }

  // 5. Sauvegarder les mots de passe dans un fichier
  if (passwords.length > 0) {
    const fs = require('fs');
    const passwordsFile = 'migration-passwords.json';
    
    fs.writeFileSync(
      passwordsFile,
      JSON.stringify(passwords, null, 2)
    );

    console.log('🔐 MOTS DE PASSE TEMPORAIRES\n');
    console.log(`📄 Sauvegardés dans: ${passwordsFile}`);
    console.log('⚠️  IMPORTANT: Envoyez ces mots de passe aux users\n');
    console.log('Exemple de message:\n');
    console.log('---');
    console.log('Bonjour,');
    console.log('');
    console.log('Nous avons migré notre système d\'authentification.');
    console.log('Votre nouveau mot de passe temporaire est: [PASSWORD]');
    console.log('');
    console.log('Veuillez le changer lors de votre première connexion.');
    console.log('---\n');
  }

  console.log('='.repeat(60));
  console.log('\n✅ Migration terminée!\n');
}

// Exécuter la migration
migrateAllUsers().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
