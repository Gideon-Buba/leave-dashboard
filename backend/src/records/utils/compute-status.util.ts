export type LeaveStatus = 'Overdue' | 'Ongoing' | 'Upcoming' | 'Completed';

export function computeStatus(record: {
  startDate: string;
  endDate: string;
  resumptionDate?: string;
}): LeaveStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(record.startDate);
  const end = new Date(record.endDate);
  const resumption = record.resumptionDate ? new Date(record.resumptionDate) : null;

  if (resumption && today > resumption) return 'Overdue';
  if (today >= start && today <= end) return 'Ongoing';
  if (today < start) return 'Upcoming';
  return 'Completed';
}
