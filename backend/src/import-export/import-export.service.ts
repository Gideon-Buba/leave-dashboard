import { Injectable } from '@nestjs/common';
import { RecordsService } from '../records/records.service';
import { computeStatus } from '../records/utils/compute-status.util';
import * as XLSX from 'xlsx';
import { Response } from 'express';

export interface ImportIssue {
  ref: string;      // "[SheetName · Row N]"
  name: string;     // officer name if available
  field: string;    // which field triggered the issue
  message: string;  // human-readable description
}

export interface ImportResultDto {
  inserted: number;
  skipped: number;
  warnings: ImportIssue[];  // inserted but incomplete (e.g. missing rank)
  errors: ImportIssue[];    // rejected — required field missing
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function excelSerialToDate(serial: number): string {
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return date.toISOString().split('T')[0];
}

function parseDate(value: any): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && value > 40000) return excelSerialToDate(value);
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return null;
    const d = new Date(t);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  return null;
}

// ─── Column mapping ───────────────────────────────────────────────────────────

function normalizeKey(s: string): string {
  return String(s).toLowerCase().replace(/\s+/g, ' ').trim();
}

const COL_MAP: Record<string, string> = {
  'name': 'name',
  'full name': 'name',
  'ir no. ': 'irNo',
  'ir no.': 'irNo',
  'ir no': 'irNo',
  'ir num': 'irNo',
  'rank': 'rank',
  'leave/action type': 'leaveType',
  'type of leave': 'leaveType',
  'paid/unpaid': 'paidStatus',
  'status': 'paidStatus',
  'start date': 'startDate',
  'end date': 'endDate',
  'duration': 'duration',
  'resumption date': 'resumptionDate',
  'reason for absence': 'reason',
  'remark': 'remark',
  'remarks': 'remark',
};

// Standard column positions for headerless sheets (Extension sheet layout)
const HEADERLESS_POSITIONS: Record<number, string> = {
  1: 'name', 2: 'irNo', 3: 'rank', 4: 'leaveType', 5: 'paidStatus',
  6: 'startDate', 7: 'endDate', 11: 'duration', 12: 'resumptionDate',
  14: 'reason', 15: 'remark',
};

interface ParsedRow {
  name: string;
  irNo: string;
  rank: string;
  leaveType: string;
  paidStatus: string;
  startDate: string | null;
  endDate: string | null;
  duration: string;
  resumptionDate: string | null;
  reason: string;
  remark: string;
}

// ─── Sheet parsing ────────────────────────────────────────────────────────────

function resolveColumnMap(rawRows: any[][]): {
  headerRowIdx: number | null;
  colIndexMap: Record<number, string>;
} {
  for (let i = 0; i < Math.min(20, rawRows.length); i++) {
    const row = rawRows[i];
    const map: Record<number, string> = {};
    let hasName = false;

    for (let j = 0; j < row.length; j++) {
      if (!row[j]) continue;
      const key = normalizeKey(String(row[j]));
      if (COL_MAP[key]) {
        map[j] = COL_MAP[key];
        if (COL_MAP[key] === 'name') hasName = true;
      }
    }

    if (!hasName) continue;

    // Handle Sheet1 quirk: "DURATION" col holds start date when its value is an Excel serial
    const durEntry = Object.entries(map).find(([, v]) => v === 'duration');
    if (durEntry) {
      const durIdx = Number(durEntry[0]);
      const nextRow = rawRows[i + 1];
      if (nextRow && typeof nextRow[durIdx] === 'number' && nextRow[durIdx] > 40000) {
        map[durIdx] = 'startDate';
        map[durIdx + 1] = 'endDate';
      }
    }

    return { headerRowIdx: i, colIndexMap: map };
  }

  return {
    headerRowIdx: null,
    colIndexMap: Object.fromEntries(
      Object.entries(HEADERLESS_POSITIONS).map(([k, v]) => [Number(k), v]),
    ),
  };
}

function extractRow(rawRow: any[], colIndexMap: Record<number, string>): ParsedRow {
  const obj: Record<string, any> = {};
  for (const [idx, field] of Object.entries(colIndexMap)) {
    obj[field] = rawRow[Number(idx)];
  }
  return {
    name: String(obj.name || '').trim(),
    irNo: String(obj.irNo || '').trim(),
    rank: String(obj.rank || '').trim(),
    leaveType: String(obj.leaveType || '').trim(),
    paidStatus: String(obj.paidStatus || '').trim(),
    startDate: parseDate(obj.startDate),
    endDate: parseDate(obj.endDate),
    duration: String(obj.duration || '').trim(),
    resumptionDate: parseDate(obj.resumptionDate),
    reason: String(obj.reason || '').trim(),
    remark: String(obj.remark || '').trim(),
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

interface ValidationResult {
  errors: ImportIssue[];
  warnings: ImportIssue[];
}

/**
 * Required fields → record is rejected if missing (added to errors, not inserted).
 * Warning fields  → record is inserted but a warning is emitted.
 * Optional fields → reason, remark (no validation).
 */
function validate(row: ParsedRow, ref: string): ValidationResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  const required: Array<{ field: keyof ParsedRow; label: string }> = [
    { field: 'irNo',        label: 'IR Number' },
    { field: 'leaveType',   label: 'Leave/Action Type' },
    { field: 'paidStatus',  label: 'Paid/Unpaid' },
    { field: 'startDate',   label: 'Start Date' },
    { field: 'endDate',     label: 'End Date' },
    { field: 'resumptionDate', label: 'Resumption Date' },
    { field: 'duration',    label: 'Duration' },
  ];

  const warnOnly: Array<{ field: keyof ParsedRow; label: string }> = [
    { field: 'rank', label: 'Rank' },
  ];

  for (const { field, label } of required) {
    const val = row[field];
    if (!val || (typeof val === 'string' && !val.trim())) {
      errors.push({
        ref,
        name: row.name || '(unknown)',
        field: label,
        message: `Missing required field "${label}" for ${row.name || 'unnamed officer'} (IR: ${row.irNo || '?'})`,
      });
    }
  }

  for (const { field, label } of warnOnly) {
    const val = row[field];
    if (!val || (typeof val === 'string' && !val.trim())) {
      warnings.push({
        ref,
        name: row.name || '(unknown)',
        field: label,
        message: `Missing "${label}" for ${row.name || 'unnamed officer'} (IR: ${row.irNo || '?'})`,
      });
    }
  }

  return { errors, warnings };
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ImportExportService {
  constructor(private readonly recordsService: RecordsService) {}

  async importFile(file: Express.Multer.File): Promise<ImportResultDto> {
    const allErrors: ImportIssue[] = [];
    const allWarnings: ImportIssue[] = [];
    let inserted = 0;
    let skipped = 0;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 });

      const { headerRowIdx, colIndexMap } = resolveColumnMap(rawRows);
      const dataStartIdx = headerRowIdx !== null ? headerRowIdx + 1 : 1;

      // Skip blank rows immediately after the header
      let dataStart = dataStartIdx;
      while (dataStart < rawRows.length) {
        const nameIdx = Object.entries(colIndexMap).find(([, v]) => v === 'name')?.[0];
        const name = nameIdx !== undefined
          ? String(rawRows[dataStart][Number(nameIdx)] || '').trim()
          : '';
        if (name) break;
        dataStart++;
      }

      for (let i = dataStart; i < rawRows.length; i++) {
        const rawRow = rawRows[i];

        // Row ref shown in messages — 1-indexed, accounting for header
        const sheetRow = i + 1;
        const ref = `[${sheetName} · Row ${sheetRow}]`;

        // Skip section-header rows (S/N column is text like "Secondment")
        const sn = rawRow[0];
        if (sn !== '' && typeof sn === 'string' && isNaN(Number(sn))) {
          continue;
        }

        const parsed = extractRow(rawRow, colIndexMap);

        // Silently skip completely blank rows
        if (!parsed.name) {
          skipped++;
          continue;
        }

        // Validate
        const { errors, warnings } = validate(parsed, ref);

        if (errors.length > 0) {
          allErrors.push(...errors);
          skipped++;
          continue;
        }

        // Dedup: irNo + startDate already in DB
        if (parsed.irNo && parsed.startDate) {
          const existing = await this.recordsService.findByIrNoAndStartDate(
            parsed.irNo,
            parsed.startDate,
          );
          if (existing) {
            skipped++;
            continue;
          }
        }

        // Insert
        try {
          await this.recordsService.bulkInsert([{
            name: parsed.name,
            irNo: parsed.irNo,
            rank: parsed.rank || null,
            leaveType: parsed.leaveType,
            paidStatus: parsed.paidStatus || 'Unpaid',
            startDate: parsed.startDate,
            endDate: parsed.endDate,
            duration: parsed.duration || null,
            resumptionDate: parsed.resumptionDate || null,
            reason: parsed.reason || null,
            remark: parsed.remark || null,
          }]);
          inserted++;
          if (warnings.length > 0) allWarnings.push(...warnings);
        } catch (err) {
          allErrors.push({
            ref,
            name: parsed.name,
            field: 'database',
            message: `DB error for ${parsed.name}: ${err.message}`,
          });
          skipped++;
        }
      }
    }

    return { inserted, skipped, warnings: allWarnings, errors: allErrors };
  }

  // ─── Export ─────────────────────────────────────────────────────────────────

  async exportXlsx(res: Response): Promise<void> {
    const records = await this.recordsService.getAllRaw();

    const data = records.map((r) => ({
      Name: r.name,
      'IR No. ': r.irNo,
      Rank: r.rank || '',
      'Leave/Action Type': r.leaveType,
      'Paid/Unpaid': r.paidStatus,
      'Start date': r.startDate,
      'End date': r.endDate,
      Duration: r.duration || '',
      'Resumption Date': r.resumptionDate || '',
      'Reason for Absence': r.reason || '',
      Remark: r.remark || '',
      Status: computeStatus(r),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Report');

    const today = new Date().toISOString().split('T')[0];
    const filename = `NRS_Leave_Report_${today}.xlsx`;

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
