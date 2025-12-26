import fs from 'fs';
import path from 'path';

/**
 * Stockage local des PDF (solution temporaire sans Supabase Storage)
 */

const STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Assure que le dossier de stockage existe
 */
function ensureStorageDir(subDir: string) {
  const fullPath = path.join(STORAGE_DIR, subDir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
}

/**
 * Sauvegarde un PDF localement
 * Retourne le chemin relatif (pour servir via /uploads/...)
 */
export function saveContractLocally(
  contractNumber: string,
  pdfBuffer: Buffer | Uint8Array
): string {
  const year = new Date().getFullYear().toString();
  const dir = ensureStorageDir(path.join('contracts', year));
  
  const fileName = `${contractNumber}.pdf`;
  const filePath = path.join(dir, fileName);
  
  fs.writeFileSync(filePath, pdfBuffer);
  
  // Retourner le chemin relatif (pour l'URL)
  return `/uploads/contracts/${year}/${fileName}`;
}

/**
 * Sauvegarde une facture PDF localement
 */
export function saveInvoiceLocally(
  invoiceNumber: string,
  pdfBuffer: Buffer | Uint8Array
): string {
  const year = new Date().getFullYear().toString();
  const dir = ensureStorageDir(path.join('invoices', year));
  
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(dir, fileName);
  
  fs.writeFileSync(filePath, pdfBuffer);
  
  return `/uploads/invoices/${year}/${fileName}`;
}

/**
 * Sauvegarde un justificatif localement
 */
export function saveReceiptLocally(file: File | Buffer, originalName: string): string {
  const year = new Date().getFullYear().toString();
  const dir = ensureStorageDir(path.join('receipts', year));
  
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const ext = originalName.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${ext}`;
  
  const filePath = path.join(dir, fileName);
  
  // Si c'est un Buffer, l'écrire directement
  if (Buffer.isBuffer(file)) {
    fs.writeFileSync(filePath, file);
  } else {
    // Sinon c'est un File (depuis FormData)
    // Cette fonction sera appelée différemment
    throw new Error('saveReceiptLocally ne supporte que les Buffers pour l\'instant');
  }
  
  return `/uploads/receipts/${year}/${fileName}`;
}

/**
 * Sauvegarde un QR-bill PDF localement
 * Supprime l'ancien QR-bill s'il existe (par chemin ET par nom)
 */
export function saveQrBillLocally(
  invoiceNumber: string,
  pdfBuffer: Buffer | Uint8Array,
  oldQrBillPath?: string | null
): string {
  console.log('🗂️  saveQrBillLocally appelée pour:', invoiceNumber);
  const year = new Date().getFullYear().toString();
  const dir = ensureStorageDir(path.join('qr-bills', year));
  
  const fileName = `QR-${invoiceNumber}.pdf`;
  const filePath = path.join(dir, fileName);
  
  console.log('  Dossier:', dir);
  console.log('  Fichier cible:', fileName);
  console.log('  Chemin complet:', filePath);
  
  // Supprimer l'ancien QR-bill s'il existe (par chemin si fourni)
  if (oldQrBillPath) {
    console.log('  Ancien chemin fourni:', oldQrBillPath);
    try {
      const oldPath = oldQrBillPath.startsWith('/uploads/')
        ? path.join(process.cwd(), 'public', oldQrBillPath)
        : oldQrBillPath;
      
      console.log('  Chemin absolu ancien:', oldPath);
      if (fs.existsSync(oldPath)) {
        const stats = fs.statSync(oldPath);
        fs.unlinkSync(oldPath);
        console.log(`  ✅ Ancien QR-bill supprimé (par chemin): ${oldPath} (${stats.size} bytes)`);
      } else {
        console.log(`  ℹ️  Ancien fichier n'existe pas: ${oldPath}`);
      }
    } catch (error) {
      console.warn(`  ⚠️  Erreur lors de la suppression de l'ancien QR-bill (par chemin): ${error}`);
    }
  } else {
    console.log('  Aucun ancien chemin fourni');
  }
  
  // TOUJOURS supprimer le fichier par nom (même si on n'a pas le chemin)
  // Cela garantit qu'on écrase l'ancien fichier
  console.log('  Vérification existence fichier par nom...');
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      fs.unlinkSync(filePath);
      console.log(`  ✅ Ancien QR-bill supprimé (par nom): ${filePath} (${stats.size} bytes)`);
    } else {
      console.log(`  ℹ️  Aucun ancien fichier trouvé à: ${filePath}`);
    }
  } catch (error) {
    console.warn(`  ⚠️  Erreur lors de la suppression de l'ancien QR-bill (par nom): ${error}`);
  }
  
  // Supprimer aussi tous les fichiers QR-bill qui pourraient exister avec des variantes
  // (au cas où il y aurait des fichiers avec des espaces ou autres caractères)
  console.log('  Recherche de variantes...');
  try {
    const files = fs.readdirSync(dir);
    console.log(`  Fichiers trouvés dans le dossier: ${files.length}`);
    const pattern = new RegExp(`^QR-${invoiceNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\(\\d+\\))?\\.pdf$`, 'i');
    let variantsDeleted = 0;
    files.forEach(file => {
      if (pattern.test(file) && file !== fileName) {
        const variantPath = path.join(dir, file);
        try {
          const variantStats = fs.statSync(variantPath);
          fs.unlinkSync(variantPath);
          console.log(`  ✅ Variante supprimée: ${file} (${variantStats.size} bytes)`);
          variantsDeleted++;
        } catch (err) {
          console.warn(`  ⚠️  Erreur suppression variante ${file}:`, err);
        }
      }
    });
    if (variantsDeleted === 0) {
      console.log('  ℹ️  Aucune variante trouvée');
    }
  } catch (error) {
    console.warn(`  ⚠️  Erreur lors de la recherche de variantes: ${error}`);
  }
  
  // Écrire le nouveau fichier (écrase si existe encore)
  console.log('  Écriture du nouveau fichier...');
  fs.writeFileSync(filePath, pdfBuffer);
  const newStats = fs.statSync(filePath);
  console.log(`  ✅ Nouveau QR-bill créé: ${filePath} (${newStats.size} bytes)`);
  
  return `/uploads/qr-bills/${year}/${fileName}`;
}

/**
 * Supprime un fichier QR-bill localement
 */
export function deleteQrBillLocally(qrBillPath: string | null | undefined): void {
  if (!qrBillPath) return;
  
  try {
    // Convertir le chemin relatif en chemin absolu
    const filePath = qrBillPath.startsWith('/uploads/')
      ? path.join(process.cwd(), 'public', qrBillPath)
      : qrBillPath;
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`QR-bill supprimé: ${filePath}`);
    }
  } catch (error) {
    console.warn(`Erreur lors de la suppression du QR-bill: ${error}`);
  }
}

