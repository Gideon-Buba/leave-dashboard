import React from 'react';

interface Props {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({ count, onDelete, onClear }: Props) {
  return (
    <div className="bulk-bar">
      <div className="bulk-bar-left">
        <div className="bulk-bar-check">✓</div>
        <span className="bulk-bar-label">
          <strong>{count}</strong> record{count !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="bulk-bar-actions">
        <button className="btn btn-sm btn-ghost-white" onClick={onClear}>
          Clear selection
        </button>
        <button className="btn btn-sm btn-bulk-delete" onClick={onDelete}>
          🗑 Delete {count} record{count !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
