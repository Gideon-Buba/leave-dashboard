import React, { useState, useEffect } from 'react';
import { LeaveRecord, CreateRecordDto } from '../types';
import { LEAVE_TYPES, RANKS } from '../constants';
import { StatusBadge } from './StatusBadge';
import { fmtDate } from '../utils';

interface Props {
  mode: 'add' | 'edit' | 'view';
  record?: LeaveRecord;
  onSave: (dto: CreateRecordDto) => Promise<void>;
  onClose: () => void;
  onEdit?: () => void;
}

const empty: CreateRecordDto = {
  name: '', irNo: '', rank: '', leaveType: '',
  paidStatus: 'Unpaid', startDate: '', endDate: '',
  duration: '', resumptionDate: '', reason: '', remark: '',
};

export function RecordModal({ mode, record, onSave, onClose, onEdit }: Props) {
  const [form, setForm] = useState<CreateRecordDto>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setForm({
        name: record.name, irNo: record.irNo, rank: record.rank,
        leaveType: record.leaveType, paidStatus: record.paidStatus,
        startDate: record.startDate, endDate: record.endDate,
        duration: record.duration, resumptionDate: record.resumptionDate,
        reason: record.reason, remark: record.remark,
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [record, mode]);

  const ro = mode === 'view';
  const set = (field: keyof CreateRecordDto, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.irNo.trim()) e.irNo = 'Required';
    if (!form.leaveType.trim()) e.leaveType = 'Required';
    if (!form.startDate) e.startDate = 'Required';
    if (!form.endDate) e.endDate = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const titles = { add: 'Add New Record', edit: `Edit — ${record?.name ?? ''}`, view: record?.name ?? 'View Record' };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-top">
          <div>
            <div className="modal-title">{titles[mode]}</div>
            {mode === 'view' && record && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>
                IR {record.irNo} · {record.rank}
              </div>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {mode === 'view' && record && (
          <div style={{ padding: '0.75rem 1.5rem', background: 'var(--grey-50)', borderBottom: '1px solid var(--grey-200)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <StatusBadge status={record.status} />
            <span style={{ fontSize: '0.78rem', color: 'var(--grey-600)' }}>{record.leaveType} · {record.paidStatus}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-section">Officer Details</div>

              <Field label="Full Name *" error={errors.name}>
                <input className="input" value={form.name} readOnly={ro}
                  onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="IR No. *" error={errors.irNo}>
                <input className="input" value={form.irNo} readOnly={ro}
                  onChange={(e) => set('irNo', e.target.value)} />
              </Field>
              <Field label="Rank">
                {ro
                  ? <input className="input" value={form.rank || ''} readOnly />
                  : <select className="select" value={form.rank || ''} onChange={(e) => set('rank', e.target.value)}>
                      <option value="">— Select rank —</option>
                      {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                }
              </Field>

              <div className="form-section">Leave Details</div>

              <Field label="Leave / Action Type *" error={errors.leaveType}>
                {ro
                  ? <input className="input" value={form.leaveType} readOnly />
                  : <select className="select" value={form.leaveType} onChange={(e) => set('leaveType', e.target.value)}>
                      <option value="">— Select type —</option>
                      {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                }
              </Field>
              <Field label="Paid / Unpaid">
                {ro
                  ? <input className="input" value={form.paidStatus || ''} readOnly />
                  : <select className="select" value={form.paidStatus || 'Unpaid'} onChange={(e) => set('paidStatus', e.target.value)}>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                }
              </Field>

              <div className="form-section">Dates</div>

              <Field label="Start Date *" error={errors.startDate}>
                <input className="input" type={ro ? 'text' : 'date'} value={ro ? fmtDate(form.startDate) : form.startDate} readOnly={ro}
                  onChange={(e) => set('startDate', e.target.value)} />
              </Field>
              <Field label="End Date *" error={errors.endDate}>
                <input className="input" type={ro ? 'text' : 'date'} value={ro ? fmtDate(form.endDate) : form.endDate} readOnly={ro}
                  onChange={(e) => set('endDate', e.target.value)} />
              </Field>
              <Field label="Resumption Date">
                <input className="input" type={ro ? 'text' : 'date'} value={ro ? fmtDate(form.resumptionDate) : (form.resumptionDate || '')} readOnly={ro}
                  onChange={(e) => set('resumptionDate', e.target.value)} />
              </Field>
              <Field label="Duration">
                <input className="input" value={form.duration || ''} readOnly={ro}
                  onChange={(e) => set('duration', e.target.value)} />
              </Field>

              <div className="form-section">Additional Info</div>

              <Field label="Reason for Absence" fullWidth>
                <input className="input" value={form.reason || ''} readOnly={ro}
                  onChange={(e) => set('reason', e.target.value)} />
              </Field>
              <Field label="Remark" fullWidth>
                <input className="input" value={form.remark || ''} readOnly={ro}
                  onChange={(e) => set('remark', e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="modal-footer">
            {ro ? (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                {onEdit && <button type="button" className="btn btn-primary" onClick={onEdit}>Edit Record</button>}
              </>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : mode === 'add' ? 'Create Record' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, error, fullWidth }: {
  label: string; children: React.ReactNode; error?: string; fullWidth?: boolean;
}) {
  return (
    <div className={`form-field${fullWidth ? ' full-width' : ''}`}>
      <label className="form-label">{label}</label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
