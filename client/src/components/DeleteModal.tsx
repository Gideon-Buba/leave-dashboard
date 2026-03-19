import React from 'react';
import { LeaveRecord } from '../types';
import { IconTrash } from './Icons';

interface Props {
  record: LeaveRecord;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ record, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-top">
          <span className="modal-title">Delete Record</span>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="delete-modal-body">
          <div className="delete-modal-icon">
            <IconTrash size={28} color="#C8102E" strokeWidth={1.5} />
          </div>
          <p style={{ fontWeight: 700, color: 'var(--grey-900)', fontSize: '0.95rem' }}>
            Remove {record.name}?
          </p>
          <p className="delete-modal-msg">
            This will permanently delete the leave record for <strong>{record.name}</strong> (IR: {record.irNo}). This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete Record</button>
        </div>
      </div>
    </div>
  );
}
