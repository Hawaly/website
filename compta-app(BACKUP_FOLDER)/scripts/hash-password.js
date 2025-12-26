/**
 * Script pour générer un hash bcrypt d'un mot de passe
 * 
 * Usage:
 *   node scripts/hash-password.js monmotdepasse
 * 
 * Ou sans argument pour utiliser le mot de passe par défaut (admin123):
 *   node scripts/hash-password.js
 */

const bcrypt = require('bcryptjs');

// Récupérer le mot de passe depuis les arguments ou utiliser le défaut
const password = process.argv[2] || 'admin123';

// Générer le hash avec un coût de 10 (balance entre sécurité et performance)
const hash = bcrypt.hashSync(password, 10);

console.log('\n🔐 Hash bcrypt généré :\n');
console.log('Mot de passe:', password);
console.log('Hash:', hash);
console.log('\nCopiez ce hash dans votre table app_user (colonne password_hash)\n');

// Vérification que le hash fonctionne
const isValid = bcrypt.compareSync(password, hash);
console.log('✅ Vérification:', isValid ? 'Le hash est valide' : '❌ Erreur de hash');


