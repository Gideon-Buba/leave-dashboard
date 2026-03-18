import React from 'react';
import { LeaveRecord } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  records: LeaveRecord[];
  total: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (field: string) => void;
  onView: (r: LeaveRecord) => void;
  onEdit: (r: LeaveRecord) => void;
  onDelete: (r: LeaveRecord) => void;
}

const COLS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'irNo', label: 'IR No.', sortable: true },
  { key: 'rank', label: 'Rank', sortable: true },
  { key: 'leaveType', label: 'Leave Type', sortable: true },
  { key: 'paidStatus', label: 'Paid/Unpaid', sortable: true },
  { key: 'startDate', label: 'Start Date', sortable: true },
  { key: 'endDate', label: 'End Date', sortable: true },
  { key: 'resumptionDate', label: 'Resumption', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

export function RecordsTable({ records, total, sortBy, sortDir, onSort, onView, onEdit, onDelete }: Props) {
  return (
    <div className="table-card">
      <div className="table-top-bar">
        <div className="table-top-left">
          <span className="table-top-title">Leave Records</span>
          <span className="record-count-badge">{records.length}</span>
        </div>
        <span style={{ fontSize: '0.77rem', color: 'var(--grey-500)' }}>
          {records.length < total ? `Filtered — showing ${records.length} of ${total}` : `${total} total records`}
        </span>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className={[col.sortable ? 'sortable' : '', sortBy === col.key ? 'col-sorted' : ''].join(' ')}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="sort-arrow">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={COLS.length}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🗂️</div>
                    <div className="table-empty-msg">No records match your filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
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
                  <td>{r.startDate}</td>
                  <td>{r.endDate}</td>
                  <td>{r.resumptionDate || '—'}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-outline" onClick={() => onView(r)}>View</button>
                      <button className="btn btn-sm btn-outline" onClick={() => onEdit(r)}>Edit</button>
                      <button className="btn btn-sm btn-danger-outline" onClick={() => onDelete(r)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
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
