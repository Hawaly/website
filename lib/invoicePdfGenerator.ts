import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { Client, Mandat, Invoice, InvoiceItem, CompanySettings } from '@/types/database';
import { formatCurrency, DEFAULT_TVA_RATE } from './invoiceHelpers';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  invoice: Invoice;
  client: Client;
  mandat?: Mandat | null;
  items: InvoiceItem[];
  companySettings: CompanySettings;
}

// =========================
// DESIGN SYSTEM
// =========================

// Typographic scale (ratio 1.25 - Minor Third)
const TYPE = {
  title: 24,       // FACTURE title
  h1: 12,          // Section headers
  h2: 10.5,        // Subsection / emphasis
  body: 9,         // Normal text
  small: 8,        // Secondary info
  tiny: 7,         // Footer, legal
};

// Spacing scale (base 6px)
const SPACE = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 36,
};

// Colors - urstory.ch brand palette
const COLOR = {
  primary: rgb(0.992, 0.349, 0.016),   // #FD5904 - Brand orange
  primaryLight: rgb(1.0, 0.478, 0.239), // #FF7A3D - Brand orange light
  primaryBg: rgb(0.99, 0.96, 0.94),    // Light orange tint for backgrounds
  text: rgb(0.12, 0.12, 0.12),         // Near black
  textMuted: rgb(0.4, 0.4, 0.4),       // Gray
  border: rgb(0.85, 0.85, 0.85),       // Light border
  white: rgb(1, 1, 1),
};

// Page margins (balanced)
const MARGIN = {
  left: 55,
  right: 55,
  top: 50,
  bottom: 50,
};

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const settings = data.companySettings;
  
  const contentWidth = width - MARGIN.left - MARGIN.right;
  const rightEdge = width - MARGIN.right;

  // Helper: format date
  const fmtDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}.${d.getFullYear()}`;
  };

  // Helper: right-aligned text
  const drawRight = (text: string, x: number, y: number, size: number, font: PDFFont, color = COLOR.text) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: x - w, y, size, font, color });
  };

  // Helper: wrap text
  const wrapText = (text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const creditorName = settings.represented_by || settings.agency_name || 'Mohamad Hawaley';
  const ibanToDisplay = settings.qr_iban || settings.iban;

  // =========================
  // HEADER: Logo + Company Info (left) | Invoice Info (right)
  // =========================
  let logoImage;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logos', 'urstoryBlack.png');
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch {
    // Logo optional
  }

  let leftY = height - MARGIN.top;

  // Logo
  if (logoImage) {
    const logoDims = logoImage.scaleToFit(70, 40);
    page.drawImage(logoImage, {
      x: MARGIN.left,
      y: leftY - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });
    leftY -= logoDims.height + SPACE.md;
  }

  // Company name
  page.drawText('urstory.ch', {
    x: MARGIN.left,
    y: leftY,
    size: TYPE.h1,
    font: bold,
    color: COLOR.text,
  });
  leftY -= SPACE.lg;

  // Company details
  const companyLines = [
    creditorName,
    settings.address,
    `${settings.zip_code || ''} ${settings.city || ''}`.trim(),
    settings.email,
    settings.phone,
  ].filter(Boolean);

  companyLines.forEach(line => {
    page.drawText(line as string, {
      x: MARGIN.left,
      y: leftY,
      size: TYPE.body,
      font: regular,
      color: COLOR.textMuted,
    });
    leftY -= SPACE.md;
  });

  // === RIGHT SIDE: FACTURE title + invoice details ===
  let rightY = height - MARGIN.top;

  // Title: FACTURE
  const titleText = 'FACTURE';
  drawRight(titleText, rightEdge, rightY, TYPE.title, bold, COLOR.primary);
  rightY -= SPACE.xxl;

  // Decorative line
  page.drawRectangle({
    x: rightEdge - 170,
    y: rightY + SPACE.sm,
    width: 170,
    height: 2.5,
    color: COLOR.primary,
  });
  rightY -= SPACE.lg;

  // Invoice info with proper alignment
  const infoData = [
    { label: 'N° facture', value: data.invoice.invoice_number, bold: true },
    { label: 'Date', value: fmtDate(new Date(data.invoice.issue_date)), bold: false },
    ...(data.invoice.due_date ? [{ label: 'Échéance', value: fmtDate(new Date(data.invoice.due_date)), bold: false }] : []),
    { label: 'N° client', value: data.client.id.toString().padStart(4, '0'), bold: false },
  ];

  const labelX = rightEdge - 170;
  const valueX = rightEdge - 80;

  infoData.forEach(info => {
    page.drawText(info.label, {
      x: labelX,
      y: rightY,
      size: TYPE.small,
      font: regular,
      color: COLOR.textMuted,
    });
    page.drawText(info.value, {
      x: valueX,
      y: rightY,
      size: TYPE.body,
      font: info.bold ? bold : regular,
      color: COLOR.text,
    });
    rightY -= SPACE.lg;
  });

  // =========================
  // PAYMENT INFO BOX
  // =========================
  leftY -= SPACE.md;
  const paymentBoxTop = leftY;
  const paymentBoxHeight = 75;
  const paymentBoxWidth = contentWidth * 0.52;

  // Background
  page.drawRectangle({
    x: MARGIN.left,
    y: paymentBoxTop - paymentBoxHeight,
    width: paymentBoxWidth,
    height: paymentBoxHeight,
    color: COLOR.primaryBg,
    borderColor: COLOR.border,
    borderWidth: 0.5,
  });

  // Payment header
  let payY = paymentBoxTop - SPACE.lg;
  page.drawText('Coordonnées de paiement', {
    x: MARGIN.left + SPACE.md,
    y: payY,
    size: TYPE.h2,
    font: bold,
    color: COLOR.text,
  });
  payY -= SPACE.lg + SPACE.xs;

  // IBAN
  if (ibanToDisplay) {
    page.drawText('IBAN', {
      x: MARGIN.left + SPACE.md,
      y: payY,
      size: TYPE.small,
      font: regular,
      color: COLOR.textMuted,
    });
    payY -= SPACE.md;
    page.drawText(ibanToDisplay, {
      x: MARGIN.left + SPACE.md,
      y: payY,
      size: TYPE.body,
      font: bold,
      color: COLOR.text,
    });
    if (settings.qr_iban) {
      page.drawText(' (QR-IBAN)', {
        x: MARGIN.left + SPACE.md + bold.widthOfTextAtSize(ibanToDisplay, TYPE.body),
        y: payY,
        size: TYPE.tiny,
        font: regular,
        color: COLOR.textMuted,
      });
    }
    payY -= SPACE.md + SPACE.xs;
  }

  // Titulaire
  page.drawText('Titulaire:', {
    x: MARGIN.left + SPACE.md,
    y: payY,
    size: TYPE.small,
    font: regular,
    color: COLOR.textMuted,
  });
  page.drawText(creditorName, {
    x: MARGIN.left + SPACE.md + 50,
    y: payY,
    size: TYPE.body,
    font: regular,
    color: COLOR.text,
  });

  // =========================
  // CLIENT INFO: "Facturé à"
  // =========================
  let clientY = paymentBoxTop - paymentBoxHeight - SPACE.xxl;

  page.drawText('Facturé à', {
    x: MARGIN.left,
    y: clientY,
    size: TYPE.h1,
    font: bold,
    color: COLOR.primary,
  });
  clientY -= SPACE.lg;

  // Client name
  const clientName = data.client.company_name || data.client.name;
  page.drawText(clientName, {
    x: MARGIN.left,
    y: clientY,
    size: TYPE.h2,
    font: bold,
    color: COLOR.text,
  });
  clientY -= SPACE.md + SPACE.xs;

  // Client details
  const clientLines = [
    data.client.company_name && data.client.name ? data.client.name : null,
    data.client.address,
    `${data.client.zip_code || ''} ${data.client.locality || ''}`.trim(),
    data.client.represented_by ? `Représenté par : ${data.client.represented_by}` : null,
  ].filter(Boolean);

  clientLines.forEach(line => {
    page.drawText(line as string, {
      x: MARGIN.left,
      y: clientY,
      size: TYPE.body,
      font: regular,
      color: COLOR.text,
    });
    clientY -= SPACE.md;
  });

  // =========================
  // TABLE: Items
  // =========================
  clientY -= SPACE.xl;
  const tableTop = clientY;

  // Column positions
  const cols = {
    desc: MARGIN.left,
    descWidth: contentWidth * 0.48,
    qty: MARGIN.left + contentWidth * 0.48,
    qtyWidth: contentWidth * 0.12,
    unit: MARGIN.left + contentWidth * 0.60,
    unitWidth: contentWidth * 0.08,
    price: MARGIN.left + contentWidth * 0.68,
    priceWidth: contentWidth * 0.16,
    total: rightEdge,
  };

  // Table header
  const headerHeight = 26;
  page.drawRectangle({
    x: MARGIN.left,
    y: tableTop - headerHeight,
    width: contentWidth,
    height: headerHeight,
    color: COLOR.primary,
  });

  const headerY = tableTop - 17;
  page.drawText('Description', { x: cols.desc + SPACE.sm, y: headerY, size: TYPE.body, font: bold, color: COLOR.white });
  page.drawText('Qté', { x: cols.qty + SPACE.sm, y: headerY, size: TYPE.body, font: bold, color: COLOR.white });
  page.drawText('Unité', { x: cols.unit + SPACE.xs, y: headerY, size: TYPE.body, font: bold, color: COLOR.white });
  page.drawText('Prix unit.', { x: cols.price + SPACE.xs, y: headerY, size: TYPE.body, font: bold, color: COLOR.white });
  drawRight('Montant', cols.total - SPACE.sm, headerY, TYPE.body, bold, COLOR.white);

  // Table rows
  let rowY = tableTop - headerHeight - SPACE.lg;
  const rowHeight = 24;

  data.items.forEach((item, index) => {
    if (rowY < MARGIN.bottom + 100) return;

    // Alternate row background
    if (index % 2 === 1) {
      page.drawRectangle({
        x: MARGIN.left,
        y: rowY - rowHeight + SPACE.md,
        width: contentWidth,
        height: rowHeight,
        color: COLOR.primaryBg,
      });
    }

    const descLines = wrapText(item.description, cols.descWidth - SPACE.lg, regular, TYPE.body);
    descLines.forEach((line, idx) => {
      page.drawText(line, {
        x: cols.desc + SPACE.sm,
        y: rowY - (idx * SPACE.md),
        size: TYPE.body,
        font: regular,
        color: COLOR.text,
      });
    });

    // Quantity
    drawRight(item.quantity.toFixed(2), cols.qty + cols.qtyWidth - SPACE.xs, rowY, TYPE.body, regular, COLOR.text);

    // Unit
    page.drawText('pc.', { x: cols.unit + SPACE.xs, y: rowY, size: TYPE.body, font: regular, color: COLOR.textMuted });

    // Unit price
    drawRight(formatCurrency(item.unit_price), cols.price + cols.priceWidth - SPACE.xs, rowY, TYPE.body, regular, COLOR.text);

    // Total
    drawRight(formatCurrency(item.total), cols.total - SPACE.sm, rowY, TYPE.body, bold, COLOR.text);

    rowY -= Math.max(rowHeight, SPACE.md + descLines.length * SPACE.md);
  });

  // =========================
  // TOTALS
  // =========================
  rowY -= SPACE.lg;
  const totalsX = cols.price;

  // Separator line
  page.drawLine({
    start: { x: totalsX, y: rowY + SPACE.md },
    end: { x: rightEdge, y: rowY + SPACE.md },
    thickness: 0.5,
    color: COLOR.border,
  });

  // Sous-total
  page.drawText('Sous-total', { x: totalsX, y: rowY - SPACE.sm, size: TYPE.body, font: regular, color: COLOR.text });
  drawRight(formatCurrency(data.invoice.total_ht), rightEdge - SPACE.sm, rowY - SPACE.sm, TYPE.body, bold, COLOR.text);
  rowY -= SPACE.xl;

  // TVA
  const tvaApplicable = data.invoice.total_tva > 0;
  const tvaLabel = tvaApplicable ? `TVA ${(DEFAULT_TVA_RATE * 100).toFixed(1)}%` : 'TVA (exonéré)';
  const tvaValue = tvaApplicable ? formatCurrency(data.invoice.total_tva) : 'CHF 0.00';
  page.drawText(tvaLabel, { x: totalsX, y: rowY - SPACE.sm, size: TYPE.body, font: regular, color: COLOR.textMuted });
  drawRight(tvaValue, rightEdge - SPACE.sm, rowY - SPACE.sm, TYPE.body, regular, COLOR.textMuted);
  rowY -= SPACE.xl;

  // TOTAL box
  const totalBoxHeight = 30;
  const totalBoxWidth = rightEdge - totalsX + SPACE.md;
  page.drawRectangle({
    x: totalsX - SPACE.sm,
    y: rowY - totalBoxHeight + SPACE.sm,
    width: totalBoxWidth,
    height: totalBoxHeight,
    color: COLOR.primary,
  });

  page.drawText('TOTAL', {
    x: totalsX,
    y: rowY - SPACE.md,
    size: TYPE.h1,
    font: bold,
    color: COLOR.white,
  });
  drawRight(formatCurrency(data.invoice.total_ttc), rightEdge - SPACE.sm, rowY - SPACE.md, TYPE.h1, bold, COLOR.white);

  // =========================
  // FOOTER
  // =========================
  const footerText = tvaApplicable
    ? 'Tous les montants sont indiqués en CHF. Merci pour votre confiance.'
    : 'Exonéré de TVA selon art. 10 al. 2 let. a LTVA (CA < CHF 100\'000). Montants en CHF.';

  page.drawText(footerText, {
    x: MARGIN.left,
    y: MARGIN.bottom + SPACE.lg,
    size: TYPE.tiny,
    font: regular,
    color: COLOR.textMuted,
  });

  drawRight('Page 1', rightEdge, MARGIN.bottom, TYPE.tiny, regular, COLOR.textMuted);

  return await pdfDoc.save();
}
