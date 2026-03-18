import React from 'react';
import { LeaveStatus } from '../types';

interface Props { status: LeaveStatus; }

const CLASS_MAP: Record<LeaveStatus, string> = {
  Overdue: 'status-overdue',
  Ongoing: 'status-ongoing',
  Upcoming: 'status-upcoming',
  Completed: 'status-completed',
};

export function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge ${CLASS_MAP[status] ?? ''}`}>
      {status}
    </span>
  );
}
