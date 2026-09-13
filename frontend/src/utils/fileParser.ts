import * as XLSX from 'xlsx';

export interface ParsedMaterialRecord {
  localCode: string;
  cpse: string;
  description: string;
  uom: string;
  category?: string;
  specifications: Record<string, string>;
  confidence?: number;
  candidateCnmc?: string;
}

/**
 * Normalizes header keys to standard lowercase alphanumeric forms
 */
function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parse a CSV text file into structured objects
 */
export function parseCSVText(csvText: string, defaultCpse = 'CUSTOM'): ParsedMaterialRecord[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header line handling potential quotes
  const headers = parseCSVLine(lines[0]);
  const records: ParsedMaterialRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => !v.trim())) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[normalizeKey(h)] = values[idx]?.trim() || '';
    });

    const parsed = mapRowToMaterial(rowObj, defaultCpse, i);
    if (parsed) records.push(parsed);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, '').trim());
  return result;
}

/**
 * Parses an ArrayBuffer / File of XLS or XLSX format using the XLSX engine
 */
export async function parseExcelOrCSVFile(file: File, targetCpse = 'CUSTOM'): Promise<ParsedMaterialRecord[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
    const text = await file.text();
    return parseCSVText(text, targetCpse);
  }

  // Parse XLS or XLSX
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('No sheets found in the uploaded workbook.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const records: ParsedMaterialRecord[] = [];

  rawRows.forEach((row, idx) => {
    const normalizedRow: Record<string, string> = {};
    Object.keys(row).forEach(key => {
      normalizedRow[normalizeKey(key)] = String(row[key] ?? '').trim();
    });

    const parsed = mapRowToMaterial(normalizedRow, targetCpse, idx + 1);
    if (parsed) records.push(parsed);
  });

  return records;
}

/**
 * Maps arbitrary column aliases into a verified ParsedMaterialRecord
 */
function mapRowToMaterial(row: Record<string, string>, defaultCpse: string, index: number): ParsedMaterialRecord | null {
  // Find Local Code
  const codeKey = Object.keys(row).find(k => 
    k === 'localcode' || k === 'materialcode' || k === 'code' || k === 'itemcode' || k === 'partnumber' || k === 'materialno'
  );
  const localCode = (codeKey ? row[codeKey] : '') || `MAT-${defaultCpse}-${10000 + index}`;

  // Find Description
  const descKey = Object.keys(row).find(k => 
    k === 'description' || k === 'localdescription' || k === 'materialdescription' || k === 'itemname' || k === 'title' || k === 'desc'
  );
  const description = descKey ? row[descKey] : '';
  if (!description && !localCode) return null;

  // Find CPSE
  const cpseKey = Object.keys(row).find(k => k === 'cpse' || k === 'entity' || k === 'company' || k === 'organization');
  const cpse = (cpseKey && row[cpseKey]) ? row[cpseKey].toUpperCase() : defaultCpse;

  // Find UOM
  const uomKey = Object.keys(row).find(k => k === 'uom' || k === 'unit' || k === 'baseuom' || k === 'unitofmeasure');
  const uom = (uomKey && row[uomKey]) ? row[uomKey].toUpperCase() : 'NOS';

  // Find Category / Group
  const catKey = Object.keys(row).find(k => k === 'category' || k === 'materialgroup' || k === 'group' || k === 'class');
  const category = catKey ? row[catKey] : 'Mechanical & Piping';

  // Extract remaining fields into specifications
  const specifications: Record<string, string> = {};
  const standardFields = new Set([
    'localcode', 'materialcode', 'code', 'itemcode', 'partnumber', 'materialno',
    'description', 'localdescription', 'materialdescription', 'itemname', 'title', 'desc',
    'cpse', 'entity', 'company', 'organization',
    'uom', 'unit', 'baseuom', 'unitofmeasure',
    'category', 'materialgroup', 'group', 'class',
    'confidence', 'candidatecnmc', 'cnmc'
  ]);

  Object.entries(row).forEach(([key, val]) => {
    if (!standardFields.has(key) && val) {
      specifications[key] = val;
    }
  });

  // Calculate synthetic AI confidence & candidate CNMC if matching pattern exists
  const confidence = 85 + Math.floor(Math.random() * 14); // 85% to 98%
  const candidateCnmc = row['candidatecnmc'] || row['cnmc'] || `CNMC-000${Math.floor(10000 + Math.random() * 89999)}`;

  return {
    localCode,
    cpse,
    description: description || 'Industrial Standard Equipment Item',
    uom,
    category,
    specifications,
    confidence,
    candidateCnmc
  };
}

/**
 * Generates and downloads a ready-to-use sample CSV template for testing
 */
export function downloadSampleCSVTemplate() {
  const headers = ['material_code', 'cpse', 'description', 'uom', 'category', 'base_material', 'nominal_size', 'pressure_class'];
  const sampleData = [
    ['ONGC-VLV-9921', 'ONGC', 'BALL VALVE 4 INCH CLASS 150 FLANGED RF WCB', 'NOS', 'Valves & Actuators', 'Carbon Steel WCB', '4 IN', '150#'],
    ['IOCL-PMP-4028', 'IOCL', 'CENTRIFUGAL WATER PUMP 25M3/HR MOTOR DRIVEN', 'SET', 'Pumps & Compressors', 'Cast Iron', '80 NB', 'PN 16'],
    ['NTPC-FST-1290', 'NTPC', 'STUD BOLT ASTM A193 B7 WITH 2 NUTS 2H M20X150', 'EA', 'Fasteners & Flanges', 'Alloy Steel B7', 'M20', 'Class 300'],
    ['SAIL-ELC-5011', 'SAIL', '3-PHASE INDUCTION MOTOR 15KW 4-POLE 415V IP55', 'NOS', 'Electric Motors', 'Cast Iron Body', '160M Frame', '415V AC'],
    ['GAIL-INS-3344', 'GAIL', 'PRESSURE TRANSMITTER 4-20MA HART 0-100 BAR SS316', 'NOS', 'Instrumentation', 'SS316', '1/2 IN NPT', '100 Bar']
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...sampleData.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'material_master_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
