import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Client, Mandat, CompanySettings } from '@/types/database';

interface ContractData {
  contractNumber: string;
  client: Client;
  mandat?: Mandat | null;
  generatedDate: Date;
  companySettings: CompanySettings;
}

/**
 * Génère un PDF de contrat avec pdf-lib
 * Retourne un Uint8Array du PDF généré
 */
export async function generateContractPDF(data: ContractData): Promise<Uint8Array> {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  
  // Ajouter une page
  const page = pdfDoc.addPage([595, 842]); // A4 en points
  const { width, height } = page.getSize();
  
  // Charger les polices
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let y = height - 50; // Position verticale de départ
  
  // En-tête de l'agence (depuis companySettings)
  const settings = data.companySettings;
  const agencyName = settings.represented_by || settings.agency_name || 'YourStory Agency';
  
  page.drawText(agencyName, {
    x: width / 2 - 80,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 30;
  
  // Adresse depuis la base de données
  if (settings.address || settings.zip_code || settings.city) {
    const addressParts: string[] = [];
    if (settings.address) addressParts.push(settings.address);
    if (settings.zip_code) addressParts.push(settings.zip_code);
    if (settings.city) addressParts.push(settings.city);
    if (settings.country) addressParts.push(settings.country);
    
    const fullAddress = addressParts.join(', ');
    page.drawText(fullAddress, {
      x: width / 2 - (fullAddress.length * 3),
      y,
      size: 10,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  }
  
  // Contact depuis la base de données
  const contactParts: string[] = [];
  if (settings.phone) contactParts.push(`Tél: ${settings.phone}`);
  if (settings.email) contactParts.push(`Email: ${settings.email}`);
  
  if (contactParts.length > 0) {
    const contactLine = contactParts.join(' | ');
    page.drawText(contactLine, {
      x: width / 2 - (contactLine.length * 3),
      y,
      size: 10,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  }
  
  y -= 25;
  
  // Ligne de séparation
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 30;
  
  // Titre du document
  page.drawText('CONTRAT DE PRESTATION', {
    x: width / 2 - 90,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 25;
  
  page.drawText(`N° ${data.contractNumber}`, {
    x: width / 2 - 50,
    y,
    size: 12,
    font: fontNormal,
    color: rgb(0, 0, 0),
  });
  y -= 40;
  
  // Informations client
  page.drawText('CLIENT', {
    x: 50,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 25;
  
  page.drawText(data.client.name, {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 18;
  
  if (data.client.company_name) {
    page.drawText(`Entreprise : ${data.client.company_name}`, {
      x: 50,
      y,
      size: 10,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  }
  
  if (data.client.address || data.client.zip_code) {
    let address = 'Adresse : ';
    if (data.client.address) address += data.client.address;
    if (data.client.zip_code) address += address.length > 10 ? ', ' + data.client.zip_code : data.client.zip_code;
    
    page.drawText(address, {
      x: 50,
      y,
      size: 10,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  }
  
  if (data.client.email) {
    page.drawText(`Email : ${data.client.email}`, {
      x: 50,
      y,
      size: 10,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  }
  
  if (data.client.phone) {
    page.drawText(`Téléphone : ${data.client.phone}`, {
      x: 50,
      y,
      size: 10,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  }
  
  y -= 30;
  
  // Informations du mandat (si présent)
  if (data.mandat) {
    page.drawText('OBJET DU CONTRAT', {
      x: 50,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 25;
    
    page.drawText(data.mandat.title, {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 18;
    
    if (data.mandat.mandat_type) {
      page.drawText(`Type : ${data.mandat.mandat_type}`, {
        x: 50,
        y,
        size: 10,
        font: fontNormal,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    }
    
    if (data.mandat.description) {
      const lines = wrapText(data.mandat.description, 90);
      lines.forEach((line) => {
        if (y < 100) return; // Éviter de sortir de la page
        page.drawText(line, {
          x: 50,
          y,
          size: 10,
          font: fontNormal,
          color: rgb(0, 0, 0),
        });
        y -= 15;
      });
    }
    
    if (data.mandat.start_date) {
      page.drawText(`Date de début : ${new Date(data.mandat.start_date).toLocaleDateString('fr-FR')}`, {
        x: 50,
        y,
        size: 10,
        font: fontNormal,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    }
    
    if (data.mandat.end_date) {
      page.drawText(`Date de fin : ${new Date(data.mandat.end_date).toLocaleDateString('fr-FR')}`, {
        x: 50,
        y,
        size: 10,
        font: fontNormal,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    }
    
    y -= 30;
  }
  
  // Conditions générales
  if (y > 200) {
    page.drawText('CONDITIONS GÉNÉRALES', {
      x: 50,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 25;
    
    const conditions = [
      `1. Le présent contrat définit les modalités de collaboration entre ${agencyName} et le client.`,
      '2. Les prestations seront réalisées selon les termes convenus et dans les délais impartis.',
      '3. La facturation sera effectuée selon les modalités définies avec le client.',
      '4. Ce contrat peut être modifié par avenant signé par les deux parties.',
    ];
    
    conditions.forEach((condition) => {
      if (y < 150) return;
      const lines = wrapText(condition, 100);
      lines.forEach((line) => {
        if (y < 150) return;
        page.drawText(line, {
          x: 50,
          y,
          size: 9,
          font: fontNormal,
          color: rgb(0, 0, 0),
        });
        y -= 13;
      });
      y -= 5;
    });
  }
  
  // Signatures (en bas de page)
  const signY = 150;
  
  page.drawText(`Pour ${agencyName}`, {
    x: 70,
    y: signY,
    size: 10,
    font: fontNormal,
    color: rgb(0, 0, 0),
  });
  
  page.drawLine({
    start: { x: 70, y: signY - 40 },
    end: { x: 220, y: signY - 40 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Date : ________________', {
    x: 70,
    y: signY - 55,
    size: 9,
    font: fontNormal,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Pour le Client', {
    x: 350,
    y: signY,
    size: 10,
    font: fontNormal,
    color: rgb(0, 0, 0),
  });
  
  page.drawLine({
    start: { x: 350, y: signY - 40 },
    end: { x: 500, y: signY - 40 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Date : ________________', {
    x: 350,
    y: signY - 55,
    size: 9,
    font: fontNormal,
    color: rgb(0, 0, 0),
  });
  
  // Pied de page
  const footerText = `Document généré le ${data.generatedDate.toLocaleDateString('fr-FR')} à ${data.generatedDate.toLocaleTimeString('fr-FR')}`;
  page.drawText(footerText, {
    x: width / 2 - 110,
    y: 30,
    size: 8,
    font: fontNormal,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  // Sérialiser le PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Helper pour wrapper le texte sur plusieurs lignes
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach((word) => {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine) lines.push(currentLine.trim());
  
  return lines;
}

