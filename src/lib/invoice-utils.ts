export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  orderNotes?: string;
  items: OrderItem[];
  createdAt: string;
}

export function getPaymentMethodText(method: string): string {
  switch (method) {
    case 'bank_transfer': return 'Bankas pārskaitījums';
    case 'card': return 'Maksājums ar karti';
    case 'cash_on_delivery': return 'Skaidra nauda piegādes brīdī';
    default: return method;
  }
}

export async function generateAndDownloadInvoice(order: Order): Promise<void> {
  // Import jsPDF dynamically for client-side use
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Load custom fonts that support Latvian characters
  try {
    // Load Noto Sans fonts from public folder
    const [normalFontResponse, boldFontResponse] = await Promise.all([
      fetch('/NotoSans-Light.ttf'),
      fetch('/NotoSans-Bold.ttf')
    ]);
    
    if (normalFontResponse.ok && boldFontResponse.ok) {
      const normalFontArrayBuffer = await normalFontResponse.arrayBuffer();
      const boldFontArrayBuffer = await boldFontResponse.arrayBuffer();
      
      // Convert ArrayBuffer to base64
      const normalFontBase64 = btoa(
        new Uint8Array(normalFontArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const boldFontBase64 = btoa(
        new Uint8Array(boldFontArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Add fonts to jsPDF
      doc.addFileToVFS('NotoSans-Light.ttf', normalFontBase64);
      doc.addFileToVFS('NotoSans-Bold.ttf', boldFontBase64);
      
      doc.addFont('NotoSans-Light.ttf', 'NotoSans', 'normal');
      doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
      
      // Set the custom font as default
      doc.setFont('NotoSans');
    } else {
      // Fallback to helvetica if fonts can't be loaded
      doc.setFont('helvetica');
    }
  } catch (error) {
    console.warn('Could not load custom fonts, using helvetica fallback:', error);
    doc.setFont('helvetica');
  }
  
  // Header - Company Info with gradient-like effect
  doc.setFillColor(30, 64, 175); // Blue background
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  // White border line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(10, 50, pageWidth - 10, 50);
  
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(28);
  doc.setFont('NotoSans', 'bold');
  doc.text('R Ē Ķ I N S', pageWidth / 2, 22, { align: 'center', charSpace: 1 });
  
  doc.setFontSize(11);
  doc.setFont('NotoSans', 'normal');
  doc.text('Martas Mēbeles SIA', pageWidth / 2, 32, { align: 'center' });
  doc.text('Reģ. Nr.: 40003123456 | PVN Nr.: LV40003123456', pageWidth / 2, 38, { align: 'center' });
  doc.text('Adrese: Mūkusalas iela 101, Rīga, LV-1004', pageWidth / 2, 43, { align: 'center' });
  doc.text('Tālrunis: +371 20123456 | E-pasts: info@martasmebeles.lv', pageWidth / 2, 48, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  let yPos = 70;
  
  // Invoice and Customer Info in boxes
  // Invoice Info Box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(15, yPos - 5, 85, 45, 'S');
  
  doc.setFontSize(12);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Rēķina informācija', 20, yPos);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('NotoSans', 'normal');
  yPos += 8;
  doc.text(`Rēķina Nr.: ${order.orderNumber}`, 20, yPos);
  yPos += 6;
  doc.text(`Pasūtījuma datums: ${new Date(order.createdAt).toLocaleDateString('lv-LV')}`, 20, yPos);
  yPos += 6;
  doc.text(`Rēķina datums: ${new Date().toLocaleDateString('lv-LV')}`, 20, yPos);
  yPos += 6;
  
  // Split payment method text if too long
  const paymentText = getPaymentMethodText(order.paymentMethod);
  if (paymentText.length > 25) {
    const lines = doc.splitTextToSize(`Maksājuma veids: ${paymentText}`, 80);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6;
  } else {
    doc.text(`Maksājuma veids: ${paymentText}`, 20, yPos);
    yPos += 6;
  }
  
  // Customer Info Box
  doc.rect(110, 65, 85, 55, 'S');
  
  doc.setFontSize(12);
  doc.setFont('NotoSans', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Pircēja informācija', 115, 70);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('NotoSans', 'normal');
  let customerYPos = 78;
  doc.text(`${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim(), 115, customerYPos);
  customerYPos += 6;
  
  // Split email if too long
  if (order.customerEmail.length > 25) {
    const emailLines = doc.splitTextToSize(`E-pasts: ${order.customerEmail}`, 80);
    doc.text(emailLines, 115, customerYPos);
    customerYPos += emailLines.length * 6;
  } else {
    doc.text(`E-pasts: ${order.customerEmail}`, 115, customerYPos);
    customerYPos += 6;
  }
  
  if (order.customerPhone) {
    doc.text(`Tālrunis: ${order.customerPhone}`, 115, customerYPos);
    customerYPos += 6;
  }
  
  doc.setFont('NotoSans', 'bold');
  doc.text('Norēķinu adrese:', 115, customerYPos);
  customerYPos += 6;
  doc.setFont('NotoSans', 'normal');
  
  // Split address lines properly
  const addressLines = doc.splitTextToSize(order.billingAddress, 80);
  doc.text(addressLines, 115, customerYPos);
  customerYPos += addressLines.length * 6;
  
  doc.text(`${order.billingCity}, ${order.billingPostalCode}`, 115, customerYPos);
  customerYPos += 6;
  doc.text(order.billingCountry, 115, customerYPos);
  
  yPos = Math.max(yPos, customerYPos) + 15;
  
  // Shipping address if different (in separate box)
  if (order.shippingAddress !== order.billingAddress) {
    doc.rect(15, yPos, 180, 30, 'S');
    
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Piegādes adrese:', 20, yPos + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('NotoSans', 'normal');
    let shippingY = yPos + 16;
    
    const shippingLines = doc.splitTextToSize(order.shippingAddress, 170);
    doc.text(shippingLines, 20, shippingY);
    shippingY += shippingLines.length * 6;
    
    doc.text(`${order.shippingCity}, ${order.shippingPostalCode}`, 20, shippingY);
    shippingY += 6;
    doc.text(order.shippingCountry, 20, shippingY);
    
    yPos += 35;
  }
  
  yPos += 10;
  
  // Items Table with better styling
  const tableStartY = yPos;
  
  // Table header with gradient effect
  doc.setFillColor(30, 64, 175);
  doc.rect(15, yPos - 3, pageWidth - 30, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('NotoSans', 'bold');
  doc.text('Nr.', 20, yPos + 4);
  doc.text('Produkta nosaukums', 35, yPos + 4);
  doc.text('Daudzums', 120, yPos + 4, { align: 'center' });
  doc.text('Cena (EUR)', 150, yPos + 4, { align: 'center' });
  doc.text('Kopā (EUR)', 180, yPos + 4, { align: 'center' });
  
  yPos += 12;
  
  // Table border
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  yPos += 8;
  
  // Items with alternating row colors
  doc.setTextColor(0, 0, 0);
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(9);
  
  order.items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos - 4, pageWidth - 30, 10, 'F');
    }
    
    doc.text((index + 1).toString(), 20, yPos);
    
    // Handle long product names better
    const maxNameWidth = 80;
    const nameLines = doc.splitTextToSize(item.name, maxNameWidth);
    if (nameLines.length > 1) {
      doc.text(nameLines[0], 35, yPos);
      if (nameLines.length > 1) {
        doc.text('...', 35 + maxNameWidth - 10, yPos);
      }
    } else {
      doc.text(item.name, 35, yPos);
    }
    
    doc.text(item.quantity.toString(), 120, yPos, { align: 'center' });
    doc.text(`€${Number(item.price).toFixed(2)}`, 150, yPos, { align: 'center' });
    doc.text(`€${(Number(item.price) * item.quantity).toFixed(2)}`, 180, yPos, { align: 'center' });
    
    yPos += 12;
  });
  
  // Table bottom border
  doc.setLineWidth(0.5);
  doc.line(15, yPos - 2, pageWidth - 15, yPos - 2);
  
  yPos += 15;
  
  // Totals section with box
  const totalsBoxY = yPos;
  doc.setDrawColor(200, 200, 200);
  doc.rect(120, yPos - 5, 75, 40, 'S');
  
  doc.setFontSize(10);
  doc.setFont('NotoSans', 'normal');
  
  const subtotal = Number(order.subtotal);
  const pvn = subtotal * 0.21;
  const shippingCost = Number(order.shippingCost);
  const total = Number(order.totalAmount);
  
  const totalsX = 125;
  const valuesX = 185;
  
  doc.text('Starpsumma:', totalsX, yPos);
  doc.text(`€${subtotal.toFixed(2)}`, valuesX, yPos, { align: 'right' });
  yPos += 7;
  
  doc.text('PVN (21%):', totalsX, yPos);
  doc.text(`€${pvn.toFixed(2)}`, valuesX, yPos, { align: 'right' });
  yPos += 7;
  
  doc.text('Piegāde:', totalsX, yPos);
  doc.text(shippingCost > 0 ? `€${shippingCost.toFixed(2)}` : 'Bezmaksas', valuesX, yPos, { align: 'right' });
  yPos += 10;
  
  // Total with highlight
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1);
  doc.line(totalsX, yPos - 3, valuesX, yPos - 3);
  
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.text('KOPĀ APMAKSAI:', totalsX, yPos + 5);
  doc.text(`€${total.toFixed(2)}`, valuesX, yPos + 5, { align: 'right' });
  
  yPos += 15;
  
  // Notes section
  if (order.orderNotes) {
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, yPos, pageWidth - 30, 25, 'S');
    
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    doc.text('Piezīmes:', 20, yPos + 8);
    
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(order.orderNotes, pageWidth - 50);
    doc.text(noteLines, 20, yPos + 16);
    
    yPos += 30;
  }
  
  // Footer with better styling
  const footerY = pageHeight - 35;
  doc.setFillColor(30, 64, 175);
  doc.rect(0, footerY, pageWidth, 35, 'F');
  
  // Footer border line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(10, footerY + 5, pageWidth - 10, footerY + 5);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('NotoSans', 'bold');
  doc.text('Paldies par jūsu pasūtījumu!', pageWidth / 2, footerY + 12, { align: 'center' });
  
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(9);
  doc.text('Jautājumus varat uzdot: info@martasmebeles.lv | +371 20123456', pageWidth / 2, footerY + 20, { align: 'center' });
  doc.text(`Šis dokuments ir ģenerēts automātiski ${new Date().toLocaleDateString('lv-LV')}`, pageWidth / 2, footerY + 27, { align: 'center' });
  
  // Download the PDF
  doc.save(`rekini-${order.orderNumber}.pdf`);
}