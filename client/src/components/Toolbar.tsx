import React, { useRef } from 'react';
import { LEAVE_TYPES } from '../constants';
import { IconSearch, IconUpload, IconDownload, IconPlus, IconX, IconFileText } from './Icons';

interface Props {
  search: string;
  leaveType: string;
  status: string;
  onSearch: (v: string) => void;
  onLeaveType: (v: string) => void;
  onStatus: (v: string) => void;
  onImport: (file: File) => void;
  onExport: () => void;
  onAdd: () => void;
  onReport: () => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

const STATUSES = ['Overdue', 'Ongoing', 'Upcoming', 'Completed'];

export function Toolbar({
  search, leaveType, status,
  onSearch, onLeaveType, onStatus,
  onImport, onExport, onAdd, onReport, onClearFilters, hasFilters,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="toolbar">
      <div className="toolbar-filters">
        <div className="input-icon-wrap" style={{ maxWidth: 240 }}>
          <IconSearch size={14} color="var(--grey-400)" />
          <input
            className="input input-with-icon"
            placeholder="Search name, IR No., type…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <select className="select" style={{ maxWidth: 180 }} value={leaveType} onChange={(e) => onLeaveType(e.target.value)}>
          <option value="">All Leave Types</option>
          {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="select" style={{ maxWidth: 160 }} value={status} onChange={(e) => onStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button className="btn btn-sm btn-danger-outline" onClick={onClearFilters}>
            <IconX size={12} strokeWidth={2.5} /> Clear
          </button>
        )}
      </div>
      <div className="toolbar-sep" />
      <div className="toolbar-actions">
        <input
          type="file"
          accept=".xlsx,.csv"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) { onImport(file); e.target.value = ''; }
          }}
        />
        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          <IconUpload size={14} /> Import
        </button>
        <button className="btn btn-secondary" onClick={onExport}>
          <IconDownload size={14} /> Export
        </button>
        <button className="btn btn-secondary" onClick={onReport}>
          <IconFileText size={14} /> Report
        </button>
        <button className="btn btn-primary" onClick={onAdd}>
          <IconPlus size={14} /> Add Record
        </button>
      </div>
    </div>
  );
}
