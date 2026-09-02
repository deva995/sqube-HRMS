import Papa from 'papaparse';

/**
 * Client-side CSV Exporter
 * Converts any JavaScript object array to a downloadable CSV file.
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string
): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
