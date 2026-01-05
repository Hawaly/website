/**
 * Script pour reset le mot de passe d'un utilisateur Supabase Auth
 * Usage: npx tsx scripts/reset-user-password.ts
 */

// Charger les variables d'environnement
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabaseAdmin';

async function resetPassword() {
  const email = 'contact@urstory.ch';
  const newPassword = 'Compta2025!'; // 👈 Change ce mot de passe

  console.log(`\n🔄 Reset password pour: ${email}\n`);

  try {
    // 1. Récupérer l'auth_user_id depuis app_user
    const { data: appUser, error: appUserError } = await supabaseAdmin
      .from('app_user')
      .select('auth_user_id')
      .eq('email', email)
      .single();

    if (appUserError || !appUser?.auth_user_id) {
      console.error('❌ Utilisateur non trouvé dans app_user');
      return;
    }

    console.log(`✅ User trouvé: ${appUser.auth_user_id}`);

    // 2. Mettre à jour le mot de passe via Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      appUser.auth_user_id,
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Erreur update password:', error);
      return;
    }

    console.log('✅ Mot de passe mis à jour avec succès!');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Nouveau password: ${newPassword}\n`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

resetPassword();
