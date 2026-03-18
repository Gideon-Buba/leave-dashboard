import React, { useEffect } from 'react';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };
const TITLES = { success: 'Success', error: 'Error', info: 'Info' };

export function Toast({ message, type = 'info', onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{ICONS[type]}</span>
      <div className="toast-body">
        <div className="toast-title">{TITLES[type]}</div>
        <div className="toast-msg">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
