/**
 * Script pour tester la connexion à Supabase
 * 
 * Usage: node scripts/test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });

// Vérifier les variables d'environnement
console.log('\n🔍 Vérification des variables d\'environnement...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const jwtSecret = process.env.JWT_SECRET;

console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Défini' : '❌ Manquant');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Défini' : '❌ Manquant');
console.log('JWT_SECRET:', jwtSecret ? '✅ Défini' : '❌ Manquant');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Variables d\'environnement manquantes dans .env.local\n');
  process.exit(1);
}

// Tester la connexion à Supabase
async function testConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n🔌 Test de connexion à Supabase...\n');
    
    // Tester avec une requête simple
    const { data, error } = await supabase
      .from('app_user')
      .select('username, is_active')
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion réussie à Supabase!\n');
    console.log('📊 Utilisateurs trouvés:', data.length);
    
    if (data.length > 0) {
      console.log('\n👥 Liste des utilisateurs:');
      data.forEach(user => {
        console.log(`   - ${user.username} (${user.is_active ? 'actif' : 'inactif'})`);
      });
    } else {
      console.log('\n⚠️  Aucun utilisateur trouvé dans la table app_user');
    }
    
    // Tester d'autres tables
    console.log('\n📋 Test des autres tables...\n');
    
    const tables = ['client', 'mandat', 'invoice', 'expense', 'expense_category'];
    
    for (const table of tables) {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`   ${table}: ❌ ${countError.message}`);
      } else {
        console.log(`   ${table}: ✅ ${count} enregistrement(s)`);
      }
    }
    
    console.log('\n✨ Test terminé avec succès!\n');
    return true;
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    return false;
  }
}

testConnection();

