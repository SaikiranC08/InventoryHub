import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '@/assets/logo.png';

/**
 * Converts image URL to base64 data URI for embedding in PDF header
 */
const getBase64Image = (imgUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imgUrl;
  });
};

/**
 * Formats currency safely for PDF rendering
 */
const fmtRs = (val) => {
  const num = Number(val || 0);
  return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Generates and downloads the Business & Inventory Health PDF Report
 * Supports:
 * - Full 4-Section Report (sectionFilter = 'ALL')
 * - Individual Section Reports (sectionFilter = 1, 2, 3, or 4)
 * - Custom Date Range filtering
 */
export const generateBusinessHealthPDFReport = async ({
  business = {},
  inventory = [],
  stockRequests = [],
  movements = [],
  dateRange = { startDate: null, endDate: null },
  sectionFilter = 'ALL', // 'ALL' | 1 | 2 | 3 | 4
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // Load logo image data URL
  const logoBase64 = await getBase64Image(logoImg);

  // Colors (RGB)
  const primaryBlue = [37, 99, 235];
  const darkSlate = [15, 23, 42];
  const borderSlate = [226, 232, 240];
  const bgLight = [248, 250, 252];
  const redAlert = [225, 29, 72];
  const greenGood = [16, 185, 129];
  const amberWarn = [217, 119, 6];

  // Helper to draw section header banners
  const drawSectionHeader = (title, subtext) => {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderSlate);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'FD');

    doc.setFillColor(...primaryBlue);
    doc.rect(margin, currentY, 3, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkSlate);
    doc.text(title, margin + 7, currentY + 6);

    if (subtext) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(subtext, margin + 7, currentY + 11);
    }

    currentY += 18;
  };

  // Helper to draw top document header
  const drawHeader = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 28, 'F');

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', margin, 3, 22, 22);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('INVENTORYHUB', logoBase64 ? margin + 26 : margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const subTitleStr = sectionFilter === 'ALL'
      ? 'EXECUTIVE BUSINESS & INVENTORY HEALTH AUDIT REPORT'
      : `EXECUTIVE REPORT — SECTION ${sectionFilter}`;
    doc.text(subTitleStr, logoBase64 ? margin + 26 : margin, 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const busName = business.businessName || 'Active Business';
    doc.text(busName, pageWidth - margin, 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const dateStr = `Generated: ${new Date().toLocaleDateString('en-IN')}`;
    doc.text(dateStr, pageWidth - margin, 16, { align: 'right' });

    let rangeStr = 'Audit Period: All Time';
    if (dateRange.startDate || dateRange.endDate) {
      const start = dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString('en-IN') : 'Beginning';
      const end = dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString('en-IN') : 'Today';
      rangeStr = `Audit Period: ${start} to ${end}`;
    }
    doc.text(rangeStr, pageWidth - margin, 21, { align: 'right' });

    currentY = 34;
  };

  // Draw Main Header
  drawHeader();

  // Audit Confidentiality Banner
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Confidential Official Audit Report — Generated for Business Compliance & Inventory Governance.', margin, currentY);
  currentY += 6;

  // Render Section 1
  if (sectionFilter === 'ALL' || sectionFilter === 1) {
    drawSectionHeader(
      'SECTION 1: Executive Stock Valuation & Audit Report',
      'Overall Inventory Health KPIs, valuation audit, and itemized valuation ledger.'
    );

    const totalSkus = inventory.length;
    const totalUnits = inventory.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalValuation = inventory.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.currentPrice || item.unitPrice || 0);
      return sum + qty * price;
    }, 0);

    const cardWidth = (pageWidth - margin * 2 - 8) / 3;
    const cardHeight = 16;

    // KPI 1: Total SKUs
    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderSlate);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL ACTIVE SKUS', margin + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...darkSlate);
    doc.text(`${totalSkus} SKUs`, margin + 4, currentY + 12);

    // KPI 2: Total Units
    const card2X = margin + cardWidth + 4;
    doc.setFillColor(...bgLight);
    doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL UNITS IN STOCK', card2X + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...darkSlate);
    doc.text(`${totalUnits.toLocaleString('en-IN')} Units`, card2X + 4, currentY + 12);

    // KPI 3: Total Asset Valuation
    const card3X = margin + (cardWidth + 4) * 2;
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(67, 56, 202);
    doc.text('TOTAL INVENTORY VALUATION', card3X + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 27, 75);
    doc.text(fmtRs(totalValuation), card3X + 4, currentY + 12);

    currentY += cardHeight + 6;

    const section1Rows = inventory.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.currentPrice || item.unitPrice || 0);
      const assetValue = qty * price;
      const reorderLvl = Number(item.reorderLevel) || 10;
      let status = 'Optimal';
      if (qty <= 0) status = 'Out of Stock';
      else if (qty <= reorderLvl) status = 'Low Stock';

      return [
        item.sku || 'SKU-N/A',
        item.productName || item.name || 'Unnamed Product',
        item.categoryName || item.category || 'General',
        qty.toString(),
        fmtRs(price),
        fmtRs(assetValue),
        status,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['SKU', 'Product Name', 'Category', 'Stock Qty', 'Unit Price', 'Asset Value', 'Reorder Status']],
      body: section1Rows.length > 0 ? section1Rows : [['—', 'No inventory items recorded', '—', '0', 'Rs. 0.00', 'Rs. 0.00', '—']],
      theme: 'striped',
      headStyles: {
        fillColor: primaryBlue,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 45 },
        2: { cellWidth: 28 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 26, halign: 'right' },
        5: { cellWidth: 28, halign: 'right' },
        6: { cellWidth: 24, halign: 'center' },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 6) {
          const val = data.cell.raw;
          if (val === 'Out of Stock') {
            data.cell.styles.textColor = redAlert;
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Low Stock') {
            data.cell.styles.textColor = amberWarn;
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Optimal') {
            data.cell.styles.textColor = greenGood;
          }
        }
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Render Section 2
  if (sectionFilter === 'ALL' || sectionFilter === 2) {
    drawSectionHeader(
      'SECTION 2: B2B Network Transfer & Collaboration Audit',
      'Inter-business stock transfers, stock request history, and network trade ledger.'
    );

    const transferMovements = movements.filter((m) =>
      ['TRANSFER_IN', 'TRANSFER_OUT', 'B2B_TRANSFER'].includes(m.type || m.movementType)
    );

    const outboundTransfers = movements.filter((m) => (m.type || m.movementType) === 'TRANSFER_OUT');
    const inboundTransfers = movements.filter((m) => (m.type || m.movementType) === 'TRANSFER_IN');

    const totalOutboundUnits = outboundTransfers.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
    const totalInboundUnits = inboundTransfers.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

    const pendingRequests = stockRequests.filter((r) => r.status === 'PENDING').length;
    const approvedRequests = stockRequests.filter((r) => r.status === 'APPROVED').length;
    const counteredRequests = stockRequests.filter((r) => r.status === 'COUNTERED' || r.status === 'REJECTED').length;

    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderSlate);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...darkSlate);
    doc.text(
      `B2B Network Trade Balance:  Inbound Stock: ${totalInboundUnits} Units  |  Outbound Stock: ${totalOutboundUnits} Units  |  Net Transfer: ${totalInboundUnits - totalOutboundUnits} Units`,
      margin + 4,
      currentY + 5.5
    );
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Stock Requests Overview:  Approved: ${approvedRequests}  |  Pending: ${pendingRequests}  |  Countered/Rejected: ${counteredRequests}`,
      margin + 4,
      currentY + 10.5
    );

    currentY += 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkSlate);
    doc.text('Inter-Business Transfers & Network Movements', margin, currentY);
    currentY += 4;

    const b2bTransferRows = transferMovements.slice(0, 10).map((m) => [
      `TRF-#${m.movementId || m.id || 'N/A'}`,
      m.type || m.movementType || 'TRANSFER',
      m.targetBusinessName || m.fromBusinessName || 'Partner Business',
      m.productName || m.sku || 'Product',
      (m.quantity || 0).toString(),
      fmtRs((Number(m.quantity) || 0) * (Number(m.unitPrice) || 0)),
      m.timestamp ? new Date(m.timestamp).toLocaleDateString('en-IN') : '—',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Ref ID', 'Transfer Type', 'Partner Business', 'Item Details', 'Quantity', 'Total Value', 'Date']],
      body:
        b2bTransferRows.length > 0
          ? b2bTransferRows
          : [['—', 'NO_TRANSFER', 'No inter-business transfers recorded in network', '—', '0', 'Rs. 0.00', '—']],
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 28 },
        2: { cellWidth: 42 },
        3: { cellWidth: 38 },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 26, halign: 'right' },
        6: { cellWidth: 22, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkSlate);
    doc.text('Stock Request & Negotiation History', margin, currentY);
    currentY += 4;

    const requestRows = stockRequests.slice(0, 10).map((r) => [
      `REQ-#${r.id || r.requestId || 'N/A'}`,
      r.targetBusinessName || `Business #${r.toBusinessId || r.fromBusinessId || ''}`,
      r.productVariantName || r.sku || `Variant #${r.productVariantId || ''}`,
      (r.quantity || 0).toString(),
      fmtRs(r.offeredUnitPrice || r.unitPrice || 0),
      fmtRs(r.offeredTotalPrice || (r.quantity || 0) * (r.offeredUnitPrice || 0)),
      r.status || 'PENDING',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Req ID', 'Target Partner', 'Product Variant', 'Qty Requested', 'Offered Unit Price', 'Total Offered', 'Status']],
      body: requestRows.length > 0 ? requestRows : [['—', 'No B2B stock requests found', '—', '0', 'Rs. 0.00', 'Rs. 0.00', '—']],
      theme: 'striped',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 38 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' },
        5: { cellWidth: 28, halign: 'right' },
        6: { cellWidth: 20, halign: 'center' },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 6) {
          const val = data.cell.raw;
          if (val === 'APPROVED') {
            data.cell.styles.textColor = greenGood;
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'PENDING') {
            data.cell.styles.textColor = amberWarn;
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'REJECTED' || val === 'COUNTERED') {
            data.cell.styles.textColor = redAlert;
          }
        }
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Render Section 3
  if (sectionFilter === 'ALL' || sectionFilter === 3) {
    drawSectionHeader(
      'SECTION 3: Low Stock & Restock Action Plan',
      'Critical threshold warnings, suggested restock quantities, and projected replenishment budget.'
    );

    const lowStockItems = inventory.filter((item) => {
      const qty = Number(item.quantity) || 0;
      const reorderLvl = Number(item.reorderLevel) || 10;
      return qty <= reorderLvl;
    });

    const outOfStockCount = lowStockItems.filter((i) => (Number(i.quantity) || 0) <= 0).length;

    let totalRestockBudget = 0;
    const restockPlanRows = lowStockItems.map((item) => {
      const qty = Number(item.quantity) || 0;
      const reorderLvl = Number(item.reorderLevel) || 10;
      const targetOptimal = reorderLvl * 2 > 20 ? reorderLvl * 2 : 25;
      const suggestedQty = Math.max(targetOptimal - qty, 10);
      const unitCost = Number(item.unitPrice || item.currentPrice || 0);
      const estBudget = suggestedQty * unitCost;
      totalRestockBudget += estBudget;

      const urgency = qty <= 0 ? 'CRITICAL (OUT OF STOCK)' : 'HIGH (BELOW REORDER LEVEL)';

      return [
        item.sku || 'SKU-N/A',
        item.productName || item.name || 'Product',
        qty.toString(),
        reorderLvl.toString(),
        suggestedQty.toString(),
        fmtRs(unitCost),
        fmtRs(estBudget),
        urgency,
      ];
    });

    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text(
      `RESTOCK ACTION SUMMARY:  Low/Critical Stock Items: ${lowStockItems.length} SKUs  |  Out of Stock: ${outOfStockCount} SKUs`,
      margin + 4,
      currentY + 5.5
    );
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(185, 28, 28);
    doc.text(
      `ESTIMATED REPLENISHMENT BUDGET REQUIRED: ${fmtRs(totalRestockBudget)}`,
      margin + 4,
      currentY + 10.5
    );

    currentY += 18;

    autoTable(doc, {
      startY: currentY,
      head: [['SKU', 'Product Name', 'Current Qty', 'Reorder Level', 'Suggested Restock', 'Unit Cost', 'Est. Restock Budget', 'Urgency Status']],
      body:
        restockPlanRows.length > 0
          ? restockPlanRows
          : [['—', 'All stock levels optimal. No immediate replenishment required.', '—', '—', '0', 'Rs. 0.00', 'Rs. 0.00', 'OPTIMAL']],
      theme: 'striped',
      headStyles: {
        fillColor: redAlert,
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 38 },
        2: { cellWidth: 18, halign: 'right' },
        3: { cellWidth: 18, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 24, halign: 'right' },
        7: { cellWidth: 34, halign: 'center' },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 7) {
          const val = data.cell.raw;
          if (val.includes('CRITICAL')) {
            data.cell.styles.textColor = redAlert;
            data.cell.styles.fontStyle = 'bold';
          } else if (val.includes('HIGH')) {
            data.cell.styles.textColor = amberWarn;
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = greenGood;
          }
        }
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Render Section 4
  if (sectionFilter === 'ALL' || sectionFilter === 4) {
    drawSectionHeader(
      'SECTION 4: Stock Movement & Velocity Ledger',
      'Inbound vs. Outbound turnover velocity, fast vs. slow-moving SKUs, and chronological audit log.'
    );

    let totalInboundVelocity = 0;
    let totalOutboundVelocity = 0;

    movements.forEach((m) => {
      const qty = Math.abs(Number(m.quantity) || 0);
      const type = (m.type || m.movementType || '').toUpperCase();
      if (['PURCHASE', 'TRANSFER_IN', 'INBOUND', 'RESTOCK'].includes(type)) {
        totalInboundVelocity += qty;
      } else if (['SALE', 'TRANSFER_OUT', 'OUTBOUND'].includes(type)) {
        totalOutboundVelocity += qty;
      }
    });

    const skuVelocityMap = {};
    movements.forEach((m) => {
      const sku = m.sku || m.productName || 'Unknown SKU';
      const qty = Math.abs(Number(m.quantity) || 0);
      if (!skuVelocityMap[sku]) {
        skuVelocityMap[sku] = { name: m.productName || sku, unitsMoved: 0, movementsCount: 0 };
      }
      skuVelocityMap[sku].unitsMoved += qty;
      skuVelocityMap[sku].movementsCount += 1;
    });

    const sortedVelocity = Object.values(skuVelocityMap).sort((a, b) => b.unitsMoved - a.unitsMoved);
    const fastMovingStr = sortedVelocity.slice(0, 3).map((p) => `${p.name} (${p.unitsMoved} units)`).join(', ') || 'N/A';
    const slowMovingStr = sortedVelocity.slice(-3).reverse().map((p) => `${p.name} (${p.unitsMoved} units)`).join(', ') || 'N/A';

    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderSlate);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...darkSlate);
    doc.text(
      `STOCK VELOCITY STATS:  Total Inbound Stock Added: +${totalInboundVelocity} Units  |  Total Outbound Sold/Transferred: -${totalOutboundVelocity} Units`,
      margin + 4,
      currentY + 5.5
    );
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Fast-Moving SKUs: ${fastMovingStr}`, margin + 4, currentY + 10.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Slow-Moving SKUs: ${slowMovingStr}`, margin + 4, currentY + 14.5);

    currentY += 20;

    const auditRows = movements.slice(0, 15).map((m, idx) => {
      const type = (m.type || m.movementType || 'LOG').toUpperCase();
      const isPositive = ['PURCHASE', 'TRANSFER_IN', 'INBOUND', 'RESTOCK'].includes(type);
      const prefix = isPositive ? '+' : '-';
      const refCode = m.referenceId || m.reference || (type === 'PURCHASE' ? `PO-#${1000 + idx}` : type === 'SALE' ? `SO-#${2000 + idx}` : `REQ-#${3000 + idx}`);
      const price = Number(m.unitPrice || m.price || 0);

      return [
        refCode,
        m.timestamp ? new Date(m.timestamp).toLocaleString('en-IN') : 'Recently',
        type,
        m.productName || m.sku || 'Inventory Item',
        `${prefix}${Math.abs(Number(m.quantity) || 0)}`,
        fmtRs(price),
        m.operator || m.createdBy || business.businessName || 'System Admin',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Ref ID', 'Timestamp', 'Movement Type', 'Product / SKU', 'Qty Change', 'Unit Price', 'Operator / Business']],
      body: auditRows.length > 0 ? auditRows : [['—', '—', 'NO_MOVEMENTS', 'No stock movements recorded in ledger', '0', 'Rs. 0.00', '—']],
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 32 },
        2: { cellWidth: 26 },
        3: { cellWidth: 40 },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 24, halign: 'right' },
        6: { cellWidth: 30, halign: 'left' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Auditor & Manager Signoff Block
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = margin + 10;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('AUDIT COMPLIANCE & MANAGER SIGNOFF BLOCK', margin + 6, currentY + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'I hereby certify that the stock valuation, inter-business ledger, low stock action plan, and movement audit contained in this report is verified.',
    margin + 6,
    currentY + 11
  );

  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 6, currentY + 20, margin + 70, currentY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Inventory Manager / Owner Signature', margin + 6, currentY + 24);

  doc.line(pageWidth - margin - 70, currentY + 20, pageWidth - margin - 6, currentY + 20);
  doc.text('Compliance Stamp & Date', pageWidth - margin - 70, currentY + 24);

  // Add Page Numbers on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `InventoryHub Audit Document  |  ${business.businessName || 'Business'}  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const sanitizeName = (business.businessName || 'Business').replace(/[^a-zA-Z0-9]/g, '_');
  const sectionTag = sectionFilter === 'ALL' ? 'Full_Executive_Audit' : `Section_${sectionFilter}`;
  const filename = `InventoryHub_${sectionTag}_${sanitizeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
