import { supabase } from './supabaseClient';

/**
 * Upload un fichier justificatif vers Supabase Storage
 * Retourne le chemin du fichier uploadé
 */
export async function uploadReceipt(file: File): Promise<string> {
  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${fileExt}`;
  const filePath = `${new Date().getFullYear()}/${fileName}`;

  // Upload vers le bucket 'receipts'
  const { error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Erreur lors de l'upload: ${error.message}`);
  }

  return filePath;
}

/**
 * Récupère l'URL publique (signée) d'un justificatif
 */
export async function getReceiptDownloadUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from('receipts')
    .createSignedUrl(filePath, 3600); // Valide 1 heure

  if (!data?.signedUrl) {
    throw new Error('Impossible de générer l\'URL de téléchargement');
  }

  return data.signedUrl;
}

/**
 * Supprime un fichier justificatif
 */
export async function deleteReceipt(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('receipts')
    .remove([filePath]);

  if (error) {
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }
}

/**
 * Formate un montant en CHF
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(amount);
}

