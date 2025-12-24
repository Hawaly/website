import { supabase } from './supabaseClient';

/**
 * Génère un numéro de contrat unique au format CTR-YYYY-NNNN
 * Ex: CTR-2025-0001
 */
export async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Récupérer le dernier contrat de l'année en cours
  const { data, error } = await supabase
    .from('contrat')
    .select('contrat_number')
    .like('contrat_number', `CTR-${year}-%`)
    .order('contrat_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Erreur lors de la récupération du dernier numéro:', error);
    // En cas d'erreur, on commence à 1
    return `CTR-${year}-0001`;
  }

  // Si aucun contrat cette année, commencer à 0001
  if (!data || data.length === 0) {
    return `CTR-${year}-0001`;
  }

  // Extraire le numéro et incrémenter
  const lastNumber = data[0].contrat_number;
  const match = lastNumber.match(/CTR-\d{4}-(\d{4})/);
  
  if (match) {
    const lastNum = parseInt(match[1], 10);
    const newNum = lastNum + 1;
    return `CTR-${year}-${newNum.toString().padStart(4, '0')}`;
  }

  // Fallback
  return `CTR-${year}-0001`;
}

/**
 * Upload un fichier PDF vers Supabase Storage
 */
export async function uploadContractToStorage(
  contractNumber: string,
  pdfBuffer: Buffer
): Promise<string> {
  const fileName = `${contractNumber}.pdf`;
  const filePath = `${new Date().getFullYear()}/${fileName}`;

  const { error } = await supabase.storage
    .from('contracts')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false, // Ne pas écraser si existe déjà
    });

  if (error) {
    throw new Error(`Erreur lors de l'upload du PDF: ${error.message}`);
  }

  return filePath;
}

/**
 * Récupère l'URL publique (signée) d'un contrat
 */
export async function getContractDownloadUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from('contracts')
    .createSignedUrl(filePath, 3600); // URL valide 1 heure

  if (!data?.signedUrl) {
    throw new Error('Impossible de générer l\'URL de téléchargement');
  }

  return data.signedUrl;
}

