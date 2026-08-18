import * as XLSX from 'xlsx';

/**
 * Parses Excel date representation (serial number, Date object, or string)
 * into a standard YYYY-MM-DD format.
 */
export function parseExcelDate(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'number') {
    // Excel dates are numbers representing days since 1900-01-01
    // Offset is 25569 days for 1970-01-01
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    // Check if valid date
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  // If it's a string, try standard parsing or clean it up
  const str = String(value).trim();
  const match = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  // Try parsing dd-mm-yyyy or dd/mm/yyyy
  const matchDMY = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (matchDMY) {
    const d = matchDMY[1].padStart(2, '0');
    const m = matchDMY[2].padStart(2, '0');
    const y = matchDMY[3];
    return `${y}-${m}-${d}`;
  }

  // Fallback to trying to parse with Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }

  return str;
}

/**
 * Parses a reimbursement Excel sheet uploaded by the user.
 * Extract employee details and line items.
 */
export function parseReimbursementExcel(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const getVal = (cellRef) => {
    const cell = sheet[cellRef];
    return cell ? cell.v : '';
  };

  // Extract Metadata based on the template
  const title = getVal('E6') || ''; // e.g. "Reimbursement 26-27"
  const name = getVal('E7') || '';
  const code = getVal('E8') || '';
  const date = parseExcelDate(sheet['N8'] ? sheet['N8'].v : getVal('N8'));
  const reimbursementNo = getVal('E9') || '';
  const department = getVal('E10') || '';

  // Extract Items starting from Row 14 (xlsx uses 0-indexed rows internally if we use sheet_to_json,
  // but we will access cells programmatically).
  // Column letters mapping:
  // C: Sl No, D: Date, E: Vendor Name, F: Mode, G: Nature of Expense, H: From, I: To, J: Purpose, K: Cost Center, L: Work Assigned by, M: kms, N: Amount
  const items = [];
  let row = 14;
  let subTotal = 0;
  let advance = 0;

  while (row <= 200) {
    const cellJ = sheet[`J${row}`];
    const valJ = cellJ ? String(cellJ.v).trim() : '';

    // Stop parsing if we hit Sub Total, Less: Advance or Total Reimbursement
    if (valJ.toLowerCase().includes('sub total') || valJ.toLowerCase().includes('less') || valJ.toLowerCase().includes('total reimburse')) {
      if (valJ.toLowerCase().includes('sub total')) {
        subTotal = Number(getVal(`K${row}`)) || 0;
      }
      if (sheet[`J${row + 1}`] && String(sheet[`J${row + 1}`].v).toLowerCase().includes('advance')) {
        advance = Number(getVal(`K${row + 1}`)) || 0;
      }
      break;
    }

    const slNo = getVal(`C${row}`);
    const itemDate = parseExcelDate(sheet[`D${row}`] ? sheet[`D${row}`].v : getVal(`D${row}`));
    const vendorName = getVal(`E${row}`);
    const mode = getVal(`F${row}`);
    const natureOfExpense = getVal(`G${row}`);
    const from = getVal(`H${row}`);
    const to = getVal(`I${row}`);
    const purpose = getVal(`J${row}`);
    const costCenter = getVal(`K${row}`);
    const workAssignedBy = getVal(`L${row}`);
    const kms = getVal(`M${row}`);
    const amountVal = getVal(`N${row}`);
    
    // Clean amount value (sometimes written as '9411/' in Excel)
    let amount = 0;
    if (amountVal !== null && amountVal !== undefined) {
      const cleanAmt = String(amountVal).replace(/[^0-9.]/g, '');
      amount = parseFloat(cleanAmt) || 0;
    }

    // Check if the row contains actual data
    if (!slNo && !itemDate && !vendorName && !amount) {
      // Empty row, but let's keep scanning in case there are gaps (up to a limit)
      const nextFewRowsEmpty = [1, 2, 3].every(offset => {
        const nextSl = getVal(`C${row + offset}`);
        const nextDate = getVal(`D${row + offset}`);
        const nextVendor = getVal(`E${row + offset}`);
        return !nextSl && !nextDate && !nextVendor;
      });

      if (nextFewRowsEmpty) {
        break;
      }
    } else {
      items.push({
        id: `item-${row}-${Date.now()}`,
        slNo: slNo ? String(slNo) : String(items.length + 1),
        date: itemDate,
        vendorName: String(vendorName || ''),
        mode: String(mode || ''),
        natureOfExpense: String(natureOfExpense || ''),
        from: String(from || ''),
        to: String(to || ''),
        purpose: String(purpose || ''),
        costCenter: String(costCenter || ''),
        workAssignedBy: String(workAssignedBy || ''),
        kms: kms !== '' ? Number(kms) : '',
        amount: amount,
      });
    }
    row++;
  }

  return {
    employeeDetails: {
      title,
      name,
      code,
      date,
      reimbursementNo,
      department
    },
    items,
    advance: advance || 0
  };
}

/**
 * Exports data to an Excel file using the template as a base to keep styling.
 * If templateBuffer is provided (fetched from public/template.xlsx), we edit it.
 * Otherwise, we create a fresh worksheet.
 */
export async function exportToExcel(data, templateBuffer = null) {
  let workbook;
  
  if (templateBuffer) {
    // Read the template file to preserve formatting
    workbook = XLSX.read(new Uint8Array(templateBuffer), { type: 'array', cellStyles: true });
  } else {
    // Fallback: Create workbook from scratch
    workbook = XLSX.utils.book_new();
  }

  const sheetName = workbook.SheetNames[0] || 'Sheet1';
  let sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    sheet = {};
    workbook.Sheets[sheetName] = sheet;
  }

  // Helper to safely write cell value
  const writeCell = (cellRef, value, type = 's') => {
    if (!sheet[cellRef]) {
      sheet[cellRef] = {};
    }
    sheet[cellRef].v = value;
    sheet[cellRef].t = type;
  };

  const { employeeDetails, items, advance, totalReimbursement, totalInWords } = data;

  // Write metadata
  writeCell('E6', employeeDetails.title || 'Reimbursement 26-27');
  writeCell('E7', employeeDetails.name || '');
  writeCell('E8', employeeDetails.code || '');
  writeCell('N8', employeeDetails.date || '');
  writeCell('E9', employeeDetails.reimbursementNo || '');
  writeCell('E10', employeeDetails.department || '');

  // Fill in expense rows. Template has slots from Row 14 to Row 25.
  // We can write up to 12 rows in the standard format.
  // If there are more, we write them, which will overwrite Row 26 etc, unless we insert.
  // Let's clear slots 14-25 first
  for (let r = 14; r <= 25; r++) {
    const cols = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    cols.forEach(col => {
      if (sheet[`${col}${r}`]) {
        sheet[`${col}${r}`].v = '';
      }
    });
  }

  // Write items
  items.forEach((item, index) => {
    const r = 14 + index;
    writeCell(`C${r}`, index + 1, 'n');
    writeCell(`D${r}`, item.date || '');
    writeCell(`E${r}`, item.vendorName || '');
    writeCell(`F${r}`, item.mode || '');
    writeCell(`G${r}`, item.natureOfExpense || '');
    writeCell(`H${r}`, item.from || '');
    writeCell(`I${r}`, item.to || '');
    writeCell(`J${r}`, item.purpose || '');
    writeCell(`K${r}`, item.costCenter || '');
    writeCell(`L${r}`, item.workAssignedBy || '');
    writeCell(`M${r}`, item.kms ? Number(item.kms) : '', 'n');
    writeCell(`N${r}`, item.amount ? Number(item.amount) : 0, 'n');
  });

  // Calculate totals
  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const total = subTotal - (Number(advance) || 0);

  // Totals position in template:
  // Sub Total is in Row 26 (J26 = 'Sub Total', K26 = subTotal) -> wait, template had K26 for value! Let's follow it.
  // Less : Advance is in Row 27 (J27 = 'Less : Advance', K27 = advance)
  // Total Reimbursement is in Row 28 (J28 = 'Total Reimbursemenet', K28 = total)
  // Total in Words is in Row 31 (C31 = 'TOTAL Rs in Words- ...')
  
  // Dynamic offset: if items exceed 12, the totals will push down.
  const totalsOffset = Math.max(0, items.length - 12);
  const rowSubtotal = 26 + totalsOffset;
  const rowAdvance = 27 + totalsOffset;
  const rowTotal = 28 + totalsOffset;
  const rowWords = 31 + totalsOffset;
  
  writeCell(`J${rowSubtotal}`, 'Sub Total');
  writeCell(`K${rowSubtotal}`, subTotal, 'n');

  writeCell(`J${rowAdvance}`, 'Less : Advance');
  writeCell(`K${rowAdvance}`, Number(advance) || 0, 'n');

  writeCell(`J${rowTotal}`, 'Total Reimbursemenet');
  writeCell(`K${rowTotal}`, total, 'n');

  writeCell(`C${rowWords}`, `TOTAL Rs in Words-  ${totalInWords}`);

  // Write out the Excel file
  const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  return s2ab(out);
}
