import { LeaveRecord, Stats, ImportResult, QueryParams, CreateRecordDto } from './types';

const BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      msg = json.message || msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getRecords: (params?: QueryParams): Promise<LeaveRecord[]> => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as [string, string][]).toString()
      : '';
    return fetch(`${BASE}/records${qs}`).then((r) => handleResponse<LeaveRecord[]>(r));
  },

  getRecord: (id: number): Promise<LeaveRecord> =>
    fetch(`${BASE}/records/${id}`).then((r) => handleResponse<LeaveRecord>(r)),

  createRecord: (dto: CreateRecordDto): Promise<LeaveRecord> =>
    fetch(`${BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }).then((r) => handleResponse<LeaveRecord>(r)),

  updateRecord: (id: number, dto: Partial<CreateRecordDto>): Promise<LeaveRecord> =>
    fetch(`${BASE}/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }).then((r) => handleResponse<LeaveRecord>(r)),

  deleteRecord: (id: number): Promise<void> =>
    fetch(`${BASE}/records/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r)),

  deleteRecords: (ids: number[]): Promise<{ deleted: number }> =>
    fetch(`${BASE}/records`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).then((r) => handleResponse<{ deleted: number }>(r)),

  importFile: (file: File): Promise<ImportResult> => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE}/import`, { method: 'POST', body: form }).then((r) =>
      handleResponse<ImportResult>(r),
    );
  },

  exportFile: (): void => {
    window.location.href = `${BASE}/export`;
  },

  getStats: (): Promise<Stats> =>
    fetch(`${BASE}/stats`).then((r) => handleResponse<Stats>(r)),
};
