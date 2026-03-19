import React, { useEffect } from 'react';
import { IconCheck, IconAlertCircle, IconInfo, IconX } from './Icons';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const ICON_MAP = {
  success: <IconCheck size={14} color="#2E7D32" strokeWidth={2.5} />,
  error:   <IconAlertCircle size={14} color="#C8102E" strokeWidth={2.5} />,
  info:    <IconInfo size={14} color="#4338CA" strokeWidth={2.5} />,
};
const TITLES = { success: 'Success', error: 'Error', info: 'Info' };

export function Toast({ message, type = 'info', onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{ICON_MAP[type]}</span>
      <div className="toast-body">
        <div className="toast-title">{TITLES[type]}</div>
        <div className="toast-msg">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        <IconX size={14} color="currentColor" strokeWidth={2} />
      </button>
    </div>
  );
}
