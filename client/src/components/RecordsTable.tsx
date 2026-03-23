import React from 'react';
import { LeaveRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { fmtDate } from '../utils';
import { IconEye, IconEdit, IconTrash, IconFolder, IconSortAsc, IconSortDesc } from './Icons';

interface Props {
  records: LeaveRecord[];
  total: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (field: string) => void;
  onView: (r: LeaveRecord) => void;
  onEdit: (r: LeaveRecord) => void;
  onDelete: (r: LeaveRecord) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

const COLS = [
  { key: 'name',           label: 'Name',           sortable: true },
  { key: 'irNo',           label: 'IR No.',          sortable: true },
  { key: 'rank',           label: 'Rank',            sortable: true },
  { key: 'leaveType',      label: 'Leave Type',      sortable: true },
  { key: 'paidStatus',     label: 'Paid/Unpaid',     sortable: true },
  { key: 'startDate',      label: 'Start Date',      sortable: true },
  { key: 'endDate',        label: 'End Date',        sortable: true },
  { key: 'resumptionDate', label: 'Resumption',      sortable: true },
  { key: 'status',         label: 'Status',          sortable: true },
  { key: 'actions',        label: '',                sortable: false },
];

export function RecordsTable({
  records, total, sortBy, sortDir, onSort,
  onView, onEdit, onDelete,
  selectedIds, onSelectionChange,
}: Props) {
  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id));
  const someSelected = !allSelected && records.some((r) => selectedIds.has(r.id));

  const toggleAll = () => {
    if (allSelected) {
      // deselect all visible
      const next = new Set(selectedIds);
      records.forEach((r) => next.delete(r.id));
      onSelectionChange(next);
    } else {
      // select all visible
      const next = new Set(selectedIds);
      records.forEach((r) => next.add(r.id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className="table-card">
      <div className="table-top-bar">
        <div className="table-top-left">
          <span className="table-top-title">Leave Records</span>
          <span className="record-count-badge">{records.length}</span>
          {selectedIds.size > 0 && (
            <span className="selection-badge">{selectedIds.size} selected</span>
          )}
        </div>
        <span style={{ fontSize: '0.77rem', color: 'var(--grey-500)' }}>
          {records.length < total
            ? `Filtered — showing ${records.length} of ${total}`
            : `${total} total records`}
        </span>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {/* Checkbox header */}
              <th className="col-checkbox">
                <label className="checkbox-wrap" title={allSelected ? 'Deselect all' : 'Select all'}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                  />
                  <span className="checkbox-box" />
                </label>
              </th>

              {COLS.map((col) => (
                <th
                  key={col.key}
                  className={[
                    `col-${col.key}`,
                    col.sortable ? 'sortable' : '',
                    sortBy === col.key ? 'col-sorted' : '',
                  ].join(' ')}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="sort-arrow">
                      {sortDir === 'asc'
                        ? <IconSortAsc size={11} strokeWidth={2.5} />
                        : <IconSortDesc size={11} strokeWidth={2.5} />}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 1}>
                  <div className="table-empty">
                    <div className="table-empty-icon">
                      <IconFolder size={36} color="var(--grey-400)" strokeWidth={1.25} />
                    </div>
                    <div className="table-empty-msg">No records match your filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const checked = selectedIds.has(r.id);
                return (
                  <tr key={r.id} className={checked ? 'row-selected' : ''}>
                    <td className="col-checkbox">
                      <label className="checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(r.id)}
                        />
                        <span className="checkbox-box" />
                      </label>
                    </td>
                    <td className="cell-name">{r.name}</td>
                    <td className="cell-ir">{r.irNo}</td>
                    <td className="cell-rank">{r.rank}</td>
                    <td>{r.leaveType}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: r.paidStatus === 'Paid' ? '#E8F5E9' : 'var(--grey-100)',
                        color: r.paidStatus === 'Paid' ? '#2E7D32' : 'var(--grey-600)',
                      }}>
                        {r.paidStatus}
                      </span>
                    </td>
                    <td>{fmtDate(r.startDate)}</td>
                    <td>{fmtDate(r.endDate)}</td>
                    <td>{fmtDate(r.resumptionDate)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="col-actions">
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => onView(r)} title="View">
                          <IconEye size={13} strokeWidth={1.75} /> View
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => onEdit(r)} title="Edit">
                          <IconEdit size={13} strokeWidth={1.75} /> Edit
                        </button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => onDelete(r)} title="Delete">
                          <IconTrash size={13} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>Showing <strong>{records.length}</strong> of <strong>{total}</strong> records</span>
        <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
  );
}
