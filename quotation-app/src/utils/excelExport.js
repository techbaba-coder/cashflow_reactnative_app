import XLSX from 'xlsx-js-style';

// ─── Style helpers ────────────────────────────────────────────────────────────

const GRAY = 'CCCCCC';
const font  = (opts = {}) => ({ name: 'Arial', sz: 10, ...opts });

function mkStyle(fontOpts = {}, fillRgb = null, alignOpts = {}) {
  const s = {
    font: font(fontOpts),
    alignment: { vertical: 'top', wrapText: true, ...alignOpts },
  };
  if (fillRgb) s.fill = { patternType: 'solid', fgColor: { rgb: fillRgb } };
  return s;
}

const ST = {
  title:      mkStyle({ bold: true, sz: 12 }, null, { horizontal: 'center', vertical: 'center', wrapText: false }),
  normal:     mkStyle({}, null, { horizontal: 'left' }),
  right:      mkStyle({}, null, { horizontal: 'right' }),
  center:     mkStyle({}, null, { horizontal: 'center' }),
  grayCenter: mkStyle({}, GRAY, { horizontal: 'center', vertical: 'center', wrapText: false }),
  grayRight:  mkStyle({}, GRAY, { horizontal: 'right',  vertical: 'center', wrapText: false }),
  grayLeft:   mkStyle({}, GRAY, { horizontal: 'left',   vertical: 'center', wrapText: false }),
  bold:       mkStyle({ bold: true, sz: 12 }, null, { horizontal: 'left' }),
  boldRight:  mkStyle({ bold: true, sz: 12 }, null, { horizontal: 'right' }),
  amtVal:     mkStyle({ sz: 12 }, null, { horizontal: 'right', wrapText: false }),
  totalVal:   mkStyle({ bold: true, sz: 12 }, GRAY, { horizontal: 'right', vertical: 'center', wrapText: false }),
  tiny:       mkStyle({ sz: 7 }, null, { horizontal: 'left' }),
  tableHdr:   mkStyle({}, GRAY, { horizontal: 'center', vertical: 'center', wrapText: true }),
};

// ─── Cell setter ──────────────────────────────────────────────────────────────

function sc(ws, r, c, value, style) {
  // r and c are 1-indexed
  const addr = XLSX.utils.encode_cell({ r: r - 1, c: c - 1 });
  ws[addr] = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style };
}

function merge(list, r1, c1, r2, c2) {
  list.push({ s: { r: r1 - 1, c: c1 - 1 }, e: { r: r2 - 1, c: c2 - 1 } });
}

function setHeight(rows, r, hpt) {
  while (rows.length < r) rows.push({});
  rows[r - 1] = { hpt };
}

// ─── Sheet 1 – Quotation ──────────────────────────────────────────────────────

function buildSheet1(quotation, settings) {
  const ws = {};
  const merges = [];
  const rows = [];

  // A=1 B=2 C=3 D=4 E=5 F=6 G=7 H=8 I=9 J=10

  // Row 1: Company title
  sc(ws, 1, 2, settings.companyTitle, ST.title);
  merge(merges, 1, 2, 1, 10);

  // Row 2: blank spacer
  merge(merges, 2, 2, 2, 10);

  // Row 3: PAN | GST
  sc(ws, 3, 2, `PAN - ${settings.pan}`, ST.normal);
  sc(ws, 3, 5, `GST NO - ${settings.gstNo}`, ST.right);
  merge(merges, 3, 2, 3, 4);
  merge(merges, 3, 5, 3, 10);
  setHeight(rows, 3, 22.5);

  // Row 4: MSME
  sc(ws, 4, 2, `MSME No - ${settings.msme}`, ST.normal);
  merge(merges, 4, 2, 4, 4);
  setHeight(rows, 4, 22.5);

  // Row 5: Email | Contact
  sc(ws, 5, 2, `Email id : ${settings.email}`, ST.normal);
  sc(ws, 5, 5, `Contact :${settings.contact}`, ST.right);
  merge(merges, 5, 2, 5, 4);
  merge(merges, 5, 5, 5, 10);
  setHeight(rows, 5, 24.75);

  // Row 6: Quotation meta | Project & Location
  const lastDigits = String(quotation.id).slice(-4).toUpperCase();
  const qDate = new Date(quotation.createdAt)
    .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '.');
  const meta =
    `Quotation  : AEQNO${lastDigits}\nQuotation Date: ${qDate}\nOur Reference:\nContact Person: `;
  sc(ws, 6, 2, meta, ST.normal);
  sc(ws, 6, 5, `Project & Location -  ${quotation.clientName}`, ST.normal);
  merge(merges, 6, 2, 6, 4);
  merge(merges, 6, 5, 6, 10);
  setHeight(rows, 6, 60);

  // Row 7: Details of Recipient (gray header)
  sc(ws, 7, 2, 'Details of Recipient (Billed to)', ST.grayLeft);
  merge(merges, 7, 2, 7, 10);
  setHeight(rows, 7, 19.35);

  // Row 8: Client info
  sc(ws, 8, 2, quotation.clientName, ST.bold);
  merge(merges, 8, 2, 8, 10);
  setHeight(rows, 8, 90.75);

  // Row 9: Table headers
  sc(ws, 9, 2, 'Sr. No',      ST.tableHdr);
  sc(ws, 9, 3, ' PARTICULARS',ST.tableHdr);
  sc(ws, 9, 7, 'UNIT',        ST.tableHdr);
  sc(ws, 9, 8, 'AREA',        ST.tableHdr);
  sc(ws, 9, 9, 'Rate',        ST.tableHdr);
  sc(ws, 9, 10,'Amount',      ST.tableHdr);
  merge(merges, 9, 3, 9, 6);

  // Line items from row 10
  let row = 10;
  quotation.items.forEach((item, idx) => {
    const desc = item.description
      ? `${item.particularName}:  \n${item.description}`
      : item.particularName;
    sc(ws, row, 2,  idx + 1,                       ST.center);
    sc(ws, row, 3,  desc,                           ST.normal);
    sc(ws, row, 7,  item.unit  || '',               ST.center);
    sc(ws, row, 8,  parseFloat(item.area)   || 0,  ST.center);
    sc(ws, row, 9,  parseFloat(item.rate)   || 0,  ST.center);
    sc(ws, row, 10, parseFloat(item.amount) || 0,  ST.amtVal);
    merge(merges, row, 3, row, 6);
    setHeight(rows, row, 96);
    row++;
  });

  // ── Totals ──
  const basic    = parseFloat(quotation.total) || 0;
  const cgst     = parseFloat((basic * 0.09).toFixed(2));
  const sgst     = parseFloat((basic * 0.09).toFixed(2));
  const subtotal = basic + cgst + sgst;
  const rounded  = Math.round(subtotal);
  const roundoff = parseFloat((rounded - subtotal).toFixed(2));
  const grand    = rounded;

  const totals = [
    ['BASIC AMOUNT', basic],
    [' CGST 9%',     cgst],
    [' SGST 9%',     sgst],
    ['Roundoff',     roundoff],
  ];

  totals.forEach(([label, val]) => {
    sc(ws, row, 2,  label, ST.right);
    sc(ws, row, 10, val,   ST.amtVal);
    merge(merges, row, 2, row, 9);
    setHeight(rows, row, 19.15);
    row++;
  });

  // Total Value row (gray)
  sc(ws, row, 2,  ' Total  Value', ST.grayRight);
  sc(ws, row, 10, grand,           ST.totalVal);
  merge(merges, row, 2, row, 9);
  setHeight(rows, row, 19.15);
  row++;

  row++; // blank spacer

  // Payment Terms
  sc(ws, row, 2, `Payment Terms : ${settings.paymentTerms || ''}`, ST.bold);
  merge(merges, row, 2, row, 10);
  row++;

  // Terms & Conditions
  const tcText =
    `Terms & Conditions : \n${settings.termsConditions}`;
  sc(ws, row, 2, tcText, ST.tiny);
  merge(merges, row, 2, row, 10);
  setHeight(rows, row, 90);
  row++;

  // Bank Details
  sc(ws, row, 2, `Bank Detail For RTGS    \n                                                                                      \n${settings.bankDetails}\n`, ST.bold);
  merge(merges, row, 2, row, 10);
  setHeight(rows, row, 120.75);
  row++;

  ws['!merges'] = merges;
  ws['!rows']   = rows;
  ws['!cols']   = [
    { wch: 2.95 },  // A
    { wch: 8.2  },  // B
    { wch: 38.3 },  // C
    { wch: 7.5  },  // D
    { wch: 2.8  },  // E
    { wch: 8.3  },  // F
    { wch: 7.4  },  // G
    { wch: 8.2  },  // H
    { wch: 6.9  },  // I
    { wch: 16.1 },  // J
  ];
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: 10 } });
  return ws;
}

// ─── Sheet 2 – Rate Analysis ──────────────────────────────────────────────────

function buildRateAnalysisSheet(ra) {
  const ws = {};
  const merges = [];

  // A=1 B=2 C=3 D=4 E=5 F=6
  sc(ws, 1, 2, ra.title,   ST.bold);
  sc(ws, 1, 6, 'actual ',  ST.normal);

  sc(ws, 2, 1, 'sr.no',   ST.tableHdr);
  sc(ws, 2, 3, 'unit',    ST.tableHdr);
  sc(ws, 2, 4, 'rate',    ST.tableHdr);

  let subtotal = 0;

  ra.rows.forEach((r, i) => {
    const exRow = i + 3;
    sc(ws, exRow, 1, r.sr,   ST.center);
    sc(ws, exRow, 2, r.name, ST.normal);
    if (r.fixedAmt !== '' && r.fixedAmt != null) {
      const amt = parseFloat(r.fixedAmt) || 0;
      sc(ws, exRow, 5, amt, ST.normal);
      subtotal += amt;
    } else {
      const q   = parseFloat(r.qty)  || 0;
      const rt  = parseFloat(r.rate) || 0;
      const amt = q * rt;
      sc(ws, exRow, 3, q,   ST.center);
      sc(ws, exRow, 4, rt,  ST.center);
      sc(ws, exRow, 5, amt, ST.normal);
      subtotal += amt;
    }
  });

  // Row 8: subtotal
  const sumRow = ra.rows.length + 3;
  sc(ws, sumRow, 5, subtotal, ST.normal);

  // Row 9: Overhead
  const overhead = parseFloat((subtotal * (parseFloat(ra.overheadPct) || 0) / 100).toFixed(2));
  sc(ws, sumRow + 1, 1, 7,   ST.center);
  sc(ws, sumRow + 1, 2, 'Overhead / Wastage  , transport , loading,unloading mathadi', ST.normal);
  sc(ws, sumRow + 1, 3, parseFloat(ra.overheadPct) || 0, ST.center);
  sc(ws, sumRow + 1, 4, '%',  ST.center);
  sc(ws, sumRow + 1, 5, overhead, ST.normal);

  // Row 10: Profit
  const profit = parseFloat((subtotal * (parseFloat(ra.profitPct) || 0) / 100).toFixed(2));
  sc(ws, sumRow + 2, 2, `Profit Added @${ra.profitPct} % `, ST.normal);
  sc(ws, sumRow + 2, 5, profit, ST.normal);

  // Row 11: Final
  const finalAmt = parseFloat((subtotal + overhead + profit).toFixed(2));
  sc(ws, sumRow + 3, 2, 'Final Amount Payable', ST.bold);
  sc(ws, sumRow + 3, 5, finalAmt, ST.bold);

  // Row 12: Per sqft
  const sqft    = parseFloat(ra.totalSqft) || 1;
  const perSqft = parseFloat((finalAmt / sqft).toFixed(2));
  sc(ws, sumRow + 4, 2, sqft,     ST.center);
  sc(ws, sumRow + 4, 3, 'sq.ft',  ST.normal);
  sc(ws, sumRow + 4, 5, perSqft,  ST.normal);

  ws['!merges'] = merges;
  ws['!cols']   = [
    { wch: 6  }, // A
    { wch: 40 }, // B
    { wch: 8  }, // C
    { wch: 8  }, // D
    { wch: 12 }, // E
    { wch: 10 }, // F
  ];
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sumRow + 5, c: 6 } });
  return ws;
}

// ─── Sheet 3 – Actual Cost ────────────────────────────────────────────────────

function buildActualSheet(ac) {
  const ws = {};
  const merges = [];

  // A=1 B=2 C=3 D=4 E=5 F=6 G=7 H=8 I=9
  sc(ws, 1, 2, ac.title, ST.bold);

  sc(ws, 2, 1, 'sr.no',  ST.tableHdr);
  sc(ws, 2, 3, 'Unit',   ST.tableHdr);
  sc(ws, 2, 4, 'Rate',   ST.tableHdr);
  sc(ws, 2, 5, 'Amount', ST.tableHdr);

  let subtotal = 0;

  ac.rows.forEach((r, i) => {
    const exRow = i + 3;
    sc(ws, exRow, 1, r.sr,   ST.center);
    sc(ws, exRow, 2, r.name, ST.normal);
    if (r.fixedAmt !== '' && r.fixedAmt != null) {
      const amt = parseFloat(r.fixedAmt) || 0;
      sc(ws, exRow, 5, amt, ST.normal);
      subtotal += amt;
    } else {
      const q   = parseFloat(r.qty)  || 0;
      const rt  = parseFloat(r.rate) || 0;
      const amt = q * rt;
      sc(ws, exRow, 3, q,   ST.center);
      sc(ws, exRow, 4, rt,  ST.center);
      sc(ws, exRow, 5, amt, ST.normal);
      subtotal += amt;
    }
  });

  const sumRow = ac.rows.length + 3;
  sc(ws, sumRow, 5, subtotal, ST.normal);

  // Per sqft ref (col G for row of last data item)
  const lastDataRow = ac.rows.length + 2; // row of last item
  const sqft    = parseFloat(ac.totalSqft)   || 1;
  const pjSqft  = parseFloat(ac.projectSqft) || 0;
  const perSqft = parseFloat((subtotal / sqft).toFixed(2));
  sc(ws, lastDataRow, 7, sqft,    ST.center);
  sc(ws, lastDataRow, 8, perSqft, ST.normal);
  sc(ws, lastDataRow, 9, 'per sq.ft', ST.normal);

  // Projected total
  const projected = parseFloat((pjSqft * perSqft).toFixed(2));
  sc(ws, sumRow, 8, projected, ST.normal);

  // Overhead
  const overhead = parseFloat((subtotal * (parseFloat(ac.overheadPct) || 0) / 100).toFixed(2));
  sc(ws, sumRow + 1, 1, 7,   ST.center);
  sc(ws, sumRow + 1, 2, 'Overhead / Wastage  , transport , loading,unloading mathadi', ST.normal);
  sc(ws, sumRow + 1, 3, parseFloat(ac.overheadPct) || 0, ST.center);
  sc(ws, sumRow + 1, 4, '%',  ST.center);
  sc(ws, sumRow + 1, 5, overhead, ST.normal);

  // Profit
  const profit = parseFloat((subtotal * (parseFloat(ac.profitPct) || 0) / 100).toFixed(2));
  sc(ws, sumRow + 2, 2, `Profit Added @${ac.profitPct} % `, ST.normal);
  sc(ws, sumRow + 2, 5, profit, ST.normal);

  // Final
  const finalAmt = parseFloat((subtotal + overhead + profit).toFixed(2));
  sc(ws, sumRow + 3, 2, 'Final Amount Payable', ST.bold);
  sc(ws, sumRow + 3, 5, finalAmt, ST.bold);

  // Per sqft
  const perSqftFinal = parseFloat((finalAmt / sqft).toFixed(2));
  sc(ws, sumRow + 4, 2, sqft,        ST.center);
  sc(ws, sumRow + 4, 3, 'sq.ft',     ST.normal);
  sc(ws, sumRow + 4, 5, perSqftFinal,ST.normal);

  // Total sqft project
  const totalProject = parseFloat((pjSqft * perSqftFinal).toFixed(2));
  sc(ws, sumRow + 5, 2, pjSqft,       ST.center);
  sc(ws, sumRow + 5, 3, 'sq.ft',      ST.normal);
  sc(ws, sumRow + 5, 5, totalProject, ST.normal);

  ws['!merges'] = merges;
  ws['!cols']   = [
    { wch: 6  }, // A
    { wch: 40 }, // B
    { wch: 8  }, // C
    { wch: 8  }, // D
    { wch: 12 }, // E
    { wch: 4  }, // F
    { wch: 8  }, // G
    { wch: 12 }, // H
    { wch: 10 }, // I
  ];
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sumRow + 6, c: 9 } });
  return ws;
}

// ─── Main export function ─────────────────────────────────────────────────────

export function downloadQuotationExcel(quotation, settings) {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildSheet1(quotation, settings),       'ghatkopar');
  XLSX.utils.book_append_sheet(wb, buildRateAnalysisSheet(settings.rateAnalysis), 'rate analysis');
  XLSX.utils.book_append_sheet(wb, buildActualSheet(settings.actualCost),  'actual');
  XLSX.utils.book_append_sheet(wb, { '!ref': 'A1:A1' },                   'Sheet3');

  const d = new Date().toLocaleDateString('en-IN').replace(/\//g, '_');
  const name = `Quotation_${quotation.clientName.replace(/\s+/g, '_')}_${d}.xlsx`;
  XLSX.writeFile(wb, name);
}
