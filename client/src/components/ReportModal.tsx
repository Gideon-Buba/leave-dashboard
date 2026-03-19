import React, { useState, useCallback } from 'react';
import { LeaveRecord } from '../types';
import { LEAVE_TYPES } from '../constants';
import { api } from '../api';
import { fmtDate } from '../utils';
import { IconX, IconPrinter, IconDownload, IconFileText } from './Icons';

const ALL_COLUMNS = [
  { key: 'irNo',          label: 'IR No'       },
  { key: 'name',          label: 'Name'        },
  { key: 'rank',          label: 'Rank'        },
  { key: 'leaveType',     label: 'Leave Type'  },
  { key: 'paidStatus',    label: 'Paid/Unpaid' },
  { key: 'startDate',     label: 'Start Date'  },
  { key: 'endDate',       label: 'End Date'    },
  { key: 'duration',      label: 'Duration'    },
  { key: 'resumptionDate',label: 'Resumption'  },
  { key: 'status',        label: 'Status'      },
  { key: 'reason',        label: 'Reason'      },
  { key: 'remark',        label: 'Remark'      },
] as const;

type ColKey = typeof ALL_COLUMNS[number]['key'];

const DEFAULT_COLS = new Set<ColKey>([
  'irNo', 'name', 'rank', 'leaveType', 'paidStatus',
  'startDate', 'endDate', 'duration', 'resumptionDate', 'status',
]);

const STATUSES = ['Overdue', 'Ongoing', 'Upcoming', 'Completed'];

const DATE_KEYS = new Set<ColKey>(['startDate', 'endDate', 'resumptionDate']);

function getCellValue(r: LeaveRecord, key: ColKey): string {
  const v = r[key as keyof LeaveRecord];
  if (DATE_KEYS.has(key)) return fmtDate(v as string);
  return v ? String(v) : '—';
}

function buildPrintHtml(
  title: string,
  notes: string,
  cols: readonly { key: ColKey; label: string }[],
  records: LeaveRecord[],
  filters: { dateFrom: string; dateTo: string; leaveType: string; status: string },
): string {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const filterSummary = [
    filters.dateFrom && `From: ${fmtDate(filters.dateFrom)}`,
    filters.dateTo   && `To: ${fmtDate(filters.dateTo)}`,
    filters.leaveType && `Type: ${filters.leaveType}`,
    filters.status   && `Status: ${filters.status}`,
  ].filter(Boolean).join(' · ') || 'All records';

  const statusClass: Record<string, string> = {
    Overdue: 'st-overdue', Ongoing: 'st-ongoing',
    Upcoming: 'st-upcoming', Completed: 'st-completed',
  };

  const rows = records.map((r) =>
    `<tr>${cols.map((c) => {
      const val = getCellValue(r, c.key);
      const cls = c.key === 'status' ? ` class="${statusClass[r.status] || ''}"` : '';
      return `<td${cls}>${val}</td>`;
    }).join('')}</tr>`,
  ).join('');

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<title>${title || 'NRS Leave Report'}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#111;background:#fff;padding:24px 32px}
  .hdr{display:flex;align-items:center;gap:14px;border-bottom:3px solid #C8102E;padding-bottom:12px;margin-bottom:14px}
  .emblem{width:40px;height:40px;background:#C8102E;color:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;letter-spacing:.5px;flex-shrink:0}
  .org-name{font-size:14px;font-weight:800}
  .org-sub{font-size:9.5px;color:#777;margin-top:1px}
  .report-title{font-size:16px;font-weight:800;margin-bottom:3px}
  .report-meta{font-size:9px;color:#777;margin-bottom:12px}
  .report-meta strong{color:#333}
  .notes{font-size:10px;color:#555;margin-bottom:10px;padding:7px 10px;background:#fafafa;border-left:3px solid #C8102E}
  .count{display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;padding:2px 8px;font-size:9px;color:#555;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#C8102E;color:#fff;padding:5px 7px;text-align:left;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
  td{padding:4px 7px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#222;vertical-align:top}
  tr:nth-child(even) td{background:#fafafa}
  tr:last-child td{border-bottom:none}
  .st-overdue{color:#C8102E;font-weight:600}
  .st-ongoing{color:#2E7D32;font-weight:600}
  .st-upcoming{color:#495057;font-weight:600}
  .st-completed{color:#9ca3af;font-weight:600}
  .footer{border-top:1px solid #e5e7eb;padding-top:8px;font-size:8.5px;color:#aaa;display:flex;justify-content:space-between;margin-top:4px}
  @media print{body{padding:0}@page{margin:1.5cm 1.8cm}}
</style>
</head><body>
<div class="hdr">
  <div class="emblem">NRS</div>
  <div>
    <div class="org-name">Nigeria Revenue Service</div>
    <div class="org-sub">Leave Report Dashboard</div>
  </div>
</div>
<div class="report-title">${title || 'Leave Report'}</div>
<div class="report-meta">Generated: <strong>${today}</strong> &nbsp;·&nbsp; Filters: <strong>${filterSummary}</strong></div>
${notes ? `<div class="notes">${notes}</div>` : ''}
<div class="count">${records.length} record${records.length !== 1 ? 's' : ''}</div>
<table>
  <thead><tr>${cols.map((c) => `<th>${c.label}</th>`).join('')}</tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">
  <span>Nigeria Revenue Service — Leave Report Dashboard</span>
  <span>Generated ${today}</span>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
}

function exportCSV(
  title: string,
  cols: readonly { key: ColKey; label: string }[],
  records: LeaveRecord[],
): void {
  const header = cols.map((c) => `"${c.label}"`).join(',');
  const rows = records.map((r) =>
    cols.map((c) => `"${getCellValue(r, c.key).replace(/"/g, '""')}"`).join(','),
  );
  const csv = [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(title || 'NRS_Leave_Report').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  onClose: () => void;
}

export function ReportModal({ onClose }: Props) {
  const [title, setTitle]           = useState('Leave Report');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [notes, setNotes]           = useState('');
  const [selectedCols, setSelectedCols] = useState<Set<ColKey>>(new Set(DEFAULT_COLS));
  const [records, setRecords]       = useState<LeaveRecord[] | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const activeCols = ALL_COLUMNS.filter((c) => selectedCols.has(c.key));

  const toggleCol = (key: ColKey) => {
    setSelectedCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data = await api.getRecords({
        leaveType: filterType || undefined,
        status: filterStatus || undefined,
      });
      if (dateFrom) data = data.filter((r) => r.startDate >= dateFrom);
      if (dateTo)   data = data.filter((r) => r.startDate <= dateTo);
      setRecords(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, dateFrom, dateTo]);

  const handlePrint = () => {
    if (!records) return;
    const html = buildPrintHtml(title, notes, activeCols, records, {
      dateFrom, dateTo, leaveType: filterType, status: filterStatus,
    });
    const win = window.open('', '_blank', 'width=960,height=720');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const handleExportCSV = () => {
    if (!records) return;
    exportCSV(title, activeCols, records);
  };

  return (
    <div className="modal-overlay">
      <div className="modal report-modal">

        <div className="modal-top">
          <span className="modal-title">Generate Report</span>
          <button className="modal-close" onClick={onClose}>
            <IconX size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="report-body">

          {/* ── Left: configuration ── */}
          <div className="report-config">

            <div className="report-section">
              <div className="report-section-label">Report Title</div>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q1 2026 Leave Summary"
              />
            </div>

            <div className="report-section">
              <div className="report-section-label">Date Range</div>
              <div className="report-row">
                <div style={{ flex: 1 }}>
                  <div className="report-field-label">From</div>
                  <input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="report-field-label">To</div>
                  <input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="report-section">
              <div className="report-section-label">Filters</div>
              <div className="report-row">
                <select className="select" style={{ flex: 1 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All Leave Types</option>
                  {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="select" style={{ flex: 1 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="report-section">
              <div className="report-section-label">Columns</div>
              <div className="report-cols-grid">
                {ALL_COLUMNS.map((c) => (
                  <label key={c.key} className="report-col-check">
                    <input
                      type="checkbox"
                      checked={selectedCols.has(c.key)}
                      onChange={() => toggleCol(c.key)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="report-section">
              <div className="report-section-label">
                Notes&nbsp;<span style={{ color: 'var(--grey-400)', fontWeight: 400 }}>(optional)</span>
              </div>
              <textarea
                className="input"
                style={{ resize: 'vertical', minHeight: 64, fontFamily: 'inherit', lineHeight: 1.5 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Appears as a footer note on the printed report…"
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={generate}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Generate Preview'}
            </button>
            {error && (
              <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</div>
            )}
          </div>

          {/* ── Right: preview ── */}
          <div className="report-preview">
            <div className="report-preview-header">
              <span className="report-section-label" style={{ margin: 0 }}>
                Preview
                {records !== null && (
                  <span style={{ color: 'var(--grey-500)', fontWeight: 400, marginLeft: 6 }}>
                    — {records.length} record{records.length !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
              {records !== null && records.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={handleExportCSV}>
                    <IconDownload size={13} /> CSV
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={handlePrint}>
                    <IconPrinter size={13} /> Print / Save PDF
                  </button>
                </div>
              )}
            </div>

            <div className="report-preview-table-wrap">
              {records === null ? (
                <div className="report-empty-state">
                  <IconFileText size={40} color="var(--grey-300)" strokeWidth={1.25} />
                  <p>Configure your filters and click<br /><strong>Generate Preview</strong></p>
                </div>
              ) : records.length === 0 ? (
                <div className="report-empty-state">
                  <IconFileText size={40} color="var(--grey-300)" strokeWidth={1.25} />
                  <p>No records match the selected filters</p>
                </div>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>{activeCols.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        {activeCols.map((c) => (
                          <td
                            key={c.key}
                            className={c.key === 'status' ? `status-cell status-${r.status.toLowerCase()}` : ''}
                          >
                            {getCellValue(r, c.key)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
