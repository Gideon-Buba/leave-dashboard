export type LeaveStatus = 'Overdue' | 'Ongoing' | 'Upcoming' | 'Completed';

export interface LeaveRecord {
  id: number;
  name: string;
  irNo: string;
  rank: string;
  leaveType: string;
  paidStatus: 'Paid' | 'Unpaid';
  startDate: string;
  endDate: string;
  duration: string;
  resumptionDate: string;
  reason: string;
  remark: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  overdue: number;
  ongoing: number;
  upcoming: number;
  completed: number;
  unpaid: number;
}

export interface ImportIssue {
  ref: string;        // e.g. "[Active Leave Cases · Row 15]"
  name: string;       // officer name (if available)
  field: string;      // which field is missing
  message: string;    // human-readable
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  warnings: ImportIssue[];   // inserted but incomplete (e.g. missing rank)
  errors: ImportIssue[];     // rejected — required field missing
}

export interface QueryParams {
  search?: string;
  leaveType?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CreateRecordDto {
  name: string;
  irNo: string;
  rank?: string;
  leaveType: string;
  paidStatus?: 'Paid' | 'Unpaid';
  startDate: string;
  endDate: string;
  duration?: string;
  resumptionDate?: string;
  reason?: string;
  remark?: string;
}
