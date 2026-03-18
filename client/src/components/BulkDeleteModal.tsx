import React from 'react';

interface Props {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BulkDeleteModal({ count, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-top">
          <span className="modal-title">Delete {count} Records</span>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="delete-modal-body">
          <div className="delete-modal-icon">🗑️</div>
          <p style={{ fontWeight: 700, color: 'var(--grey-900)', fontSize: '0.95rem' }}>
            Delete {count} selected record{count !== 1 ? 's' : ''}?
          </p>
          <p className="delete-modal-msg">
            This will permanently remove <strong>{count} leave record{count !== 1 ? 's' : ''}</strong> from the database. This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete {count} Records
          </button>
        </div>
      </div>
    </div>
  );
}
