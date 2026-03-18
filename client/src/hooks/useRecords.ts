import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { LeaveRecord, QueryParams } from '../types';

export function useRecords(params?: QueryParams) {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecords(params);
      setRecords(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { records, loading, error, refetch: fetch };
}
