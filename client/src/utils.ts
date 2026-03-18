/**
 * Formats a YYYY-MM-DD date string for display as DD-MM-YYYY.
 * Returns '—' for empty/null values.
 */
export function fmtDate(date: string | null | undefined): string {
  if (!date) return '—';
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${d}-${m}-${y}`;
}
