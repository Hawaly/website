// Import dynamique de PDFKit pour éviter les problèmes de bundling
// PDFKit sera chargé depuis node_modules au runtime
import { CompanySettings, Client, Invoice } from '@/types/database';

export interface QrBillData {
  invoice: Invoice;
  client: Client;
  companySettings: CompanySettings;
}

/**
 * Génère un QR-bill suisse conforme au standard SIX
 * Retourne un Buffer PDF
 */
export async function generateSwissQrBill(data: QrBillData): Promise<Buffer> {
  try {
    // Charger swissqrbill en mode standalone (génère PDF sans PDFKit)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PDF } = require('swissqrbill');

    const { invoice, client, companySettings } = data;

    // Validation
    if (!companySettings.qr_iban && !companySettings.iban) {
      throw new Error('QR-IBAN ou IBAN requis dans company_settings');
    }

    // Détecter si on utilise un VRAI QR-IBAN ou un IBAN normal
    // Un QR-IBAN doit être différent de l'IBAN normal
    // Si qr_iban existe ET est différent de iban, alors c'est un vrai QR-IBAN
    const hasRealQrIban = !!(
      companySettings.qr_iban && 
      companySettings.iban && 
      companySettings.qr_iban.replace(/\s/g, '') !== companySettings.iban.replace(/\s/g, '')
    );
    
    // Utiliser qr_iban si disponible, sinon iban
    const account = (companySettings.qr_iban || companySettings.iban || '').replace(/\s/g, '');
    
    console.log('🔍 Détection type IBAN:');
    console.log('  qr_iban:', companySettings.qr_iban || '(vide)');
    console.log('  iban:', companySettings.iban || '(vide)');
    console.log('  Est un vrai QR-IBAN?', hasRealQrIban);
    console.log('  Account utilisé:', account.substring(0, 8) + '...');

    // Préparer les données du créditeur (raison individuelle)
    // Utiliser represented_by (Mohamad Hawaley) au lieu de agency_name
    // Toutes les données doivent venir de la base de données
    if (!companySettings.address || !companySettings.zip_code || !companySettings.city) {
      throw new Error('Adresse complète requise dans company_settings (address, zip_code, city)');
    }

    if (!companySettings.represented_by) {
      throw new Error('represented_by requis dans company_settings');
    }

    // Log pour vérifier les valeurs utilisées pour le créditeur
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💳 Données créditeur pour QR-bill:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Name:', companySettings.represented_by);
    console.log('  Address:', companySettings.address);
    console.log('  Zip:', companySettings.zip_code, '→', parseInt(companySettings.zip_code));
    console.log('  City:', companySettings.city);
    console.log('  Account:', account.substring(0, 8) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const creditor = {
      name: companySettings.represented_by,
      address: companySettings.address,
      zip: parseInt(companySettings.zip_code),
      city: companySettings.city,
      country: 'CH',
      account,
    };

    // Log l'objet creditor final qui sera passé à SwissQRBill
    console.log('📦 Objet creditor final:', JSON.stringify(creditor, null, 2));

    // Préparer les données du débiteur (Client) - optionnel selon specs
    // Utiliser company_name au lieu de name pour "Payable par"
    const debtor = (client && (client.company_name || client.name) && client.zip_code) ? {
      name: client.company_name || client.name,
      address: client.address || '',
      zip: parseInt(client.zip_code),
      city: client.locality || '',
      country: 'CH',
    } : undefined;

    // Message (max 140 caractères)
    // Utiliser qr_additional_info si disponible, sinon le numéro de facture par défaut
    const baseMessage = `Facture ${invoice.invoice_number}`;
    const additionalInfo = invoice.qr_additional_info?.trim();
    const message = additionalInfo 
      ? `${baseMessage} - ${additionalInfo}`.substring(0, 140)
      : baseMessage;

    // Configuration du QR-bill selon les specs SIX Group
    // IMPORTANT : QR-Reference (27 chiffres) REQUIERT un QR-IBAN
    // Si IBAN normal → pas de référence structurée (optionnel selon specs SIX)
    const qrBillData: {
      currency: 'CHF';
      amount: number;
      creditor: typeof creditor;
      debtor?: typeof debtor;
      message: string;
      reference?: string;
    } = {
      currency: 'CHF' as const,
      amount: invoice.total_ttc,
      creditor,
      debtor,
      message,
    };

    // Ajouter la référence UNIQUEMENT si c'est un VRAI QR-IBAN
    // La bibliothèque swissqrbill rejette une QR-Reference avec un IBAN normal
    if (hasRealQrIban) {
      // VRAI QR-IBAN → Utiliser QR-Reference (27 chiffres structurés)
      qrBillData.reference = generateQrReference(invoice.id);
      console.log('✅ QR-Reference générée (vrai QR-IBAN détecté)');
    } else {
      // IBAN normal → Pas de référence structurée
      // La bibliothèque swissqrbill ne supporte pas QR-Reference avec IBAN normal
      console.log('ℹ️  Pas de QR-Reference (IBAN normal utilisé)');
    }

    // Log les données finales passées à SwissQRBill
    console.log('📋 Données finales pour SwissQRBill:');
    console.log(JSON.stringify({
      ...qrBillData,
      creditor: qrBillData.creditor,
      account: qrBillData.creditor.account.substring(0, 8) + '...',
    }, null, 2));

    // Générer le PDF en mode standalone (sans PDFKit)
    // La classe PDF de swissqrbill retourne directement un Buffer
    const pdf = new PDF(qrBillData, { language: 'FR' });
    const pdfBuffer = pdf.toBuffer();
    
    console.log('✅ QR-bill généré avec succès');

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('Erreur génération QR-bill:', error);
    throw error;
  }
}

/**
 * Génère une QR-Reference conforme (27 chiffres avec checksum)
 * Format simplifié basé sur l'ID de la facture
 * ⚠️ REQUIERT un QR-IBAN (pas un IBAN normal)
 */
function generateQrReference(invoiceId: number): string {
  // Générer 26 chiffres (l'ID paddé + un numéro aléatoire)
  const idPart = invoiceId.toString().padStart(10, '0');
  const randomPart = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
  const reference26 = idPart + randomPart;

  // Calculer le checksum (modulo 10, algorithme de Luhn modifié)
  const checksum = calculateMod10(reference26);
  
  return reference26 + checksum;
}


/**
 * Calcule le checksum modulo 10 pour les QR-References
 * Basé sur l'algorithme de la norme ISO 7064
 */
function calculateMod10(input: string): string {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;

  for (let i = 0; i < input.length; i++) {
    carry = table[(carry + parseInt(input.charAt(i), 10)) % 10];
  }

  return ((10 - carry) % 10).toString();
}

/**
 * Valide un IBAN suisse (format de base)
 */
export function validateSwissIban(iban: string): boolean {
  // Enlever les espaces
  const cleaned = iban.replace(/\s/g, '');
  
  // IBAN suisse : CH + 2 chiffres de contrôle + 5 chiffres (banque) + 12 chiffres (compte)
  // Total : 21 caractères
  const regex = /^CH\d{19}$/;
  
  return regex.test(cleaned);
}

