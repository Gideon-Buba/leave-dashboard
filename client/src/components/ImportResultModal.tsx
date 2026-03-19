import React, { useState } from 'react';
import { ImportResult, ImportIssue } from '../types';
import { IconCheck, IconAlertTriangle, IconX } from './Icons';

interface Props {
  result: ImportResult;
  onClose: () => void;
}

type Tab = 'summary' | 'warnings' | 'errors';

function IssueRow({ issue }: { issue: ImportIssue }) {
  return (
    <div style={{
      padding: '0.65rem 0.75rem',
      borderBottom: '1px solid var(--grey-100)',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '0.5rem 0.75rem',
      alignItems: 'start',
    }}>
      <span style={{
        fontFamily: 'monospace', fontSize: '0.72rem',
        color: 'var(--grey-500)', whiteSpace: 'nowrap', paddingTop: 1,
      }}>
        {issue.ref}
      </span>
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--grey-900)', fontWeight: 500 }}>
          {issue.message}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--grey-500)', marginTop: 2 }}>
          Field: <strong>{issue.field}</strong>
        </div>
      </div>
    </div>
  );
}

export function ImportResultModal({ result, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('summary');

  const hasWarnings = result.warnings.length > 0;
  const hasErrors = result.errors.length > 0;
  const allOk = !hasWarnings && !hasErrors;

  const overallStatus = hasErrors
    ? 'error'
    : hasWarnings
    ? 'warning'
    : 'success';

  const statusMeta = {
    success: { icon: <IconCheck size={16} strokeWidth={2.5} color="white" />, label: 'Import Complete', color: '#2E7D32', bg: '#E8F5E9' },
    warning: { icon: <IconAlertTriangle size={16} strokeWidth={2.5} color="white" />, label: 'Imported with Warnings', color: '#7B3F00', bg: '#FFF3E0' },
    error:   { icon: <IconX size={16} strokeWidth={2.5} color="white" />, label: 'Import Finished with Errors', color: '#C8102E', bg: '#FDECEA' },
  }[overallStatus];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="modal-top">
          <span className="modal-title">Import Report</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Status banner */}
        <div style={{
          background: statusMeta.bg,
          borderBottom: `1px solid var(--grey-200)`,
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: statusMeta.color, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, flexShrink: 0,
          }}>
            {statusMeta.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: statusMeta.color, fontSize: '0.9rem' }}>
              {statusMeta.label}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--grey-600)', marginTop: 2 }}>
              {result.inserted} inserted · {result.skipped} skipped ·{' '}
              {result.warnings.length} warning{result.warnings.length !== 1 ? 's' : ''} ·{' '}
              {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--grey-200)', borderBottom: '1px solid var(--grey-200)' }}>
          {[
            { label: 'Inserted', value: result.inserted, color: '#2E7D32' },
            { label: 'Skipped', value: result.skipped, color: 'var(--grey-600)' },
            { label: 'Warnings', value: result.warnings.length, color: '#E65100' },
            { label: 'Errors', value: result.errors.length, color: '#C8102E' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'white', padding: '0.85rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--grey-500)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Terminology legend */}
        <div style={{
          padding: '0.65rem 1.25rem',
          borderBottom: '1px solid var(--grey-200)',
          background: 'var(--grey-50)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.25rem 2rem',
        }}>
          {[
            { term: 'Inserted', def: 'Records successfully saved to the database.' },
            { term: 'Skipped',  def: 'Records not saved — already exist or failed validation.' },
            { term: 'Warnings', def: 'Saved, but missing the optional Rank field.' },
            { term: 'Errors',   def: 'Rejected due to one or more missing required fields.' },
          ].map(({ term, def }) => (
            <div key={term} style={{ fontSize: '0.75rem', color: 'var(--grey-600)', lineHeight: 1.4 }}>
              <strong style={{ color: 'var(--grey-800)' }}>{term}:</strong> {def}
            </div>
          ))}
        </div>

        {/* Tabs */}
        {(hasWarnings || hasErrors) && (
          <>
            <div style={{ display: 'flex', borderBottom: '2px solid var(--grey-200)', background: 'var(--grey-50)' }}>
              {([
                { key: 'summary',  label: 'Summary' },
                { key: 'warnings', label: `Warnings (${result.warnings.length})`, show: hasWarnings },
                { key: 'errors',   label: `Errors (${result.errors.length})`, show: hasErrors },
              ] as { key: Tab; label: string; show?: boolean }[])
                .filter((t) => t.show !== false)
                .map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      borderBottom: tab === key ? '2px solid var(--red)' : '2px solid transparent',
                      color: tab === key ? 'var(--red)' : 'var(--grey-600)',
                      marginBottom: -2,
                    }}
                  >
                    {label}
                  </button>
                ))
              }
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {tab === 'summary' && (
                <div style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--grey-700)', lineHeight: 1.7 }}>
                  {allOk && <p>All records imported successfully with no issues.</p>}
                  {hasErrors && (
                    <p>
                      <strong style={{ color: 'var(--red)' }}>{result.errors.length} record{result.errors.length !== 1 ? 's' : ''}</strong> were rejected because required fields were missing.
                      Switch to the <strong>Errors</strong> tab to see exactly which rows and fields are affected.
                    </p>
                  )}
                  {hasWarnings && (
                    <p style={{ marginTop: hasErrors ? '0.75rem' : 0 }}>
                      <strong style={{ color: '#E65100' }}>{result.warnings.length} record{result.warnings.length !== 1 ? 's' : ''}</strong> were imported but are missing the <strong>Rank</strong> field.
                      Switch to the <strong>Warnings</strong> tab to see which officers are affected — you can edit them later.
                    </p>
                  )}
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--grey-50)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--grey-600)' }}>
                    <strong>Required fields:</strong> IR Number, Leave/Action Type, Paid/Unpaid, Start Date, End Date, Resumption Date, Duration<br />
                    <strong>Optional (warning if missing):</strong> Rank
                  </div>
                </div>
              )}

              {tab === 'warnings' && (
                <div>
                  {result.warnings.map((w, i) => <IssueRow key={i} issue={w} />)}
                </div>
              )}

              {tab === 'errors' && (
                <div>
                  {result.errors.map((e, i) => <IssueRow key={i} issue={e} />)}
                </div>
              )}
            </div>
          </>
        )}

        {allOk && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--grey-500)', fontSize: '0.85rem' }}>
            All records imported cleanly — no warnings or errors.
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
