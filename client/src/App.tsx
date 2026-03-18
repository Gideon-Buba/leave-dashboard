import React, { useState, useCallback, useMemo } from 'react';
import { StatsBar } from './components/StatsBar';
import { Toolbar } from './components/Toolbar';
import { RecordsTable } from './components/RecordsTable';
import { RecordModal } from './components/RecordModal';
import { DeleteModal } from './components/DeleteModal';
import { ImportResultModal } from './components/ImportResultModal';
import { BulkActionBar } from './components/BulkActionBar';
import { BulkDeleteModal } from './components/BulkDeleteModal';
import { Toast } from './components/Toast';
import { DonutChart } from './components/DonutChart';
import { LeaveTypeBar } from './components/LeaveTypeBar';
import { useRecords } from './hooks/useRecords';
import { useStats } from './hooks/useStats';
import { api } from './api';
import { LeaveRecord, CreateRecordDto, ImportResult } from './types';

interface ToastState { message: string; type: 'success' | 'error' | 'info'; }

const STATUS_COLORS: Record<string, string> = {
  Overdue: '#C8102E',
  Ongoing: '#2E7D32',
  Upcoming: '#495057',
  Completed: '#ADB5BD',
};

const LEAVE_TYPE_COLORS = ['#C8102E', '#9B0D22', '#6D0819', '#343A40', '#495057', '#6C757D'];

export default function App() {
  const [search, setSearch] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { records, loading, refetch } = useRecords({
    search: search || undefined,
    leaveType: leaveType || undefined,
    status: status || undefined,
    sortBy,
    sortDir,
  });

  // Unfiltered records for charts
  const { records: allRecords } = useRecords({});
  const { stats, refetch: refetchStats } = useStats();

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveRecord | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type });
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortDir('asc'); }
  };

  const handleSave = async (dto: CreateRecordDto) => {
    try {
      if (modalMode === 'add') {
        await api.createRecord(dto);
        showToast('Record created successfully', 'success');
      } else if (modalMode === 'edit' && selectedRecord) {
        await api.updateRecord(selectedRecord.id, dto);
        showToast('Record updated successfully', 'success');
      }
      setModalMode(null);
      setSelectedRecord(null);
      refetch();
      refetchStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteRecord(deleteTarget.id);
      showToast(`${deleteTarget.name}'s record deleted`, 'success');
      setDeleteTarget(null);
      refetch();
      refetchStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const result = await api.deleteRecords(ids);
      showToast(`Deleted ${result.deleted} record${result.deleted !== 1 ? 's' : ''}`, 'success');
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      refetch();
      refetchStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await api.importFile(file);
      setImportResult(result);
      refetch();
      refetchStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Chart data from all records
  const statusSegments = useMemo(() => {
    const counts: Record<string, number> = { Overdue: 0, Ongoing: 0, Upcoming: 0, Completed: 0 };
    allRecords.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });
    return Object.entries(counts).map(([label, value]) => ({
      label, value, color: STATUS_COLORS[label],
    }));
  }, [allRecords]);

  const leaveTypeItems = useMemo(() => {
    const counts: Record<string, number> = {};
    allRecords.forEach((r) => { counts[r.leaveType] = (counts[r.leaveType] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: LEAVE_TYPE_COLORS[i % LEAVE_TYPE_COLORS.length] }));
  }, [allRecords]);

  const hasFilters = !!(search || leaveType || status);

  const handleStatusFilter = (s: string | null) => {
    setStatus(s ?? '');
  };

  const handleDonutClick = (label: string) => {
    setStatus((prev) => (prev === label ? '' : label));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="header-emblem">FIRS</div>
          <div>
            <div className="header-title">Leave Report Dashboard</div>
            <div className="header-sub">Federal Inland Revenue Service</div>
          </div>
        </div>
        <div className="header-meta">
          <strong>{stats?.total ?? '—'} Officers</strong>
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      <main className="main">
        <StatsBar stats={stats} activeFilter={status || null} onFilter={handleStatusFilter} />

        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-card-title">Leave Status Distribution</div>
            <DonutChart
              segments={statusSegments}
              total={allRecords.length}
              onSegmentClick={handleDonutClick}
              activeLabel={status || undefined}
            />
          </div>
          <div className="chart-card">
            <div className="chart-card-title">Leave Type Breakdown</div>
            <LeaveTypeBar items={leaveTypeItems} total={allRecords.length} />
          </div>
        </div>

        <Toolbar
          search={search}
          leaveType={leaveType}
          status={status}
          onSearch={setSearch}
          onLeaveType={setLeaveType}
          onStatus={setStatus}
          onImport={handleImport}
          onExport={api.exportFile}
          onAdd={() => { setSelectedRecord(null); setModalMode('add'); }}
          onClearFilters={() => { setSearch(''); setLeaveType(''); setStatus(''); }}
          hasFilters={hasFilters}
        />

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading records…
          </div>
        ) : (
          <RecordsTable
            records={records}
            total={allRecords.length}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onView={(r) => { setSelectedRecord(r); setModalMode('view'); }}
            onEdit={(r) => { setSelectedRecord(r); setModalMode('edit'); }}
            onDelete={(r) => setDeleteTarget(r)}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        )}
      </main>

      {modalMode && (
        <RecordModal
          mode={modalMode}
          record={selectedRecord || undefined}
          onSave={handleSave}
          onClose={() => { setModalMode(null); setSelectedRecord(null); }}
          onEdit={modalMode === 'view' ? () => setModalMode('edit') : undefined}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          record={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {importResult && (
        <ImportResultModal
          result={importResult}
          onClose={() => setImportResult(null)}
        />
      )}

      {bulkDeleteOpen && (
        <BulkDeleteModal
          count={selectedIds.size}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}

      {selectedIds.size > 0 && !bulkDeleteOpen && (
        <BulkActionBar
          count={selectedIds.size}
          onDelete={() => setBulkDeleteOpen(true)}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      <div className="toast-container">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
