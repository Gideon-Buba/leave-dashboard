import React from 'react';
import { IconCheck, IconTrash } from './Icons';

interface Props {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({ count, onDelete, onClear }: Props) {
  return (
    <div className="bulk-bar">
      <div className="bulk-bar-left">
        <div className="bulk-bar-check">
          <IconCheck size={13} strokeWidth={2.5} color="white" />
        </div>
        <span className="bulk-bar-label">
          <strong>{count}</strong> record{count !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="bulk-bar-actions">
        <button className="btn btn-sm btn-ghost-white" onClick={onClear}>
          Clear selection
        </button>
        <button className="btn btn-sm btn-bulk-delete" onClick={onDelete}>
          <IconTrash size={13} strokeWidth={1.75} /> Delete {count} record{count !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
