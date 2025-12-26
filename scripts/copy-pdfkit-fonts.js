const fs = require('fs');
const path = require('path');

// Chemins source et destination
const sourceFontsDir = path.join(__dirname, '../node_modules/pdfkit/js/data');
const targetBaseDirs = [
  path.join(__dirname, '../.next/server/app/api/invoices/[id]/qr-bill/data'),
  path.join(__dirname, '../.next/server/chunks/data')
];

function copyFonts() {
  console.log('📝 Copie des fichiers de polices PDFKit...');
  
  // Vérifier que le dossier source existe
  if (!fs.existsSync(sourceFontsDir)) {
    console.error('❌ Dossier source des polices non trouvé:', sourceFontsDir);
    return;
  }

  // Lire tous les fichiers .afm
  const fontFiles = fs.readdirSync(sourceFontsDir).filter(f => f.endsWith('.afm'));
  
  if (fontFiles.length === 0) {
    console.warn('⚠️  Aucun fichier .afm trouvé dans', sourceFontsDir);
    return;
  }

  console.log(`   Trouvé ${fontFiles.length} fichiers de polices`);

  // Copier vers chaque destination possible
  targetBaseDirs.forEach(targetDir => {
    // Créer le dossier de destination s'il n'existe pas
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`   ✓ Créé: ${targetDir}`);
    }

    // Copier chaque fichier
    fontFiles.forEach(file => {
      const sourcePath = path.join(sourceFontsDir, file);
      const targetPath = path.join(targetDir, file);
      
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch (err) {
        console.error(`   ✗ Erreur copie ${file}:`, err.message);
      }
    });

    console.log(`   ✓ ${fontFiles.length} fichiers copiés vers ${path.relative(__dirname + '/..', targetDir)}`);
  });

  console.log('✅ Copie des polices terminée');
}

// Exécuter la copie
copyFonts();
