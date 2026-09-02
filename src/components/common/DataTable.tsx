import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { exportToCsv } from '../../utils/csvExporter';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  id?: string;
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchField?: keyof T | ((row: T) => string);
  exportFilename?: string;
  pageSize?: number;
  actions?: React.ReactNode;
  filterOptions?: {
    label: string;
    key: keyof T;
    options: { label: string; value: any }[];
  }[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  id,
  data,
  columns,
  title,
  subtitle,
  searchPlaceholder = 'Search records...',
  searchField,
  exportFilename = 'Sqbe_HRMS_Export',
  pageSize = 10,
  actions,
  filterOptions,
  emptyMessage = 'No records found matching criteria.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  // Filtering & Search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) => {
        if (typeof searchField === 'function') {
          return searchField(row).toLowerCase().includes(q);
        }
        if (searchField && row[searchField]) {
          return String(row[searchField]).toLowerCase().includes(q);
        }
        // Fallback: search all values
        return Object.values(row).some((val) =>
          String(val).toLowerCase().includes(q)
        );
      });
    }

    // Dropdown Filters
    if (filterOptions && Object.keys(selectedFilters).length > 0) {
      Object.entries(selectedFilters).forEach(([key, val]) => {
        if (val && val !== 'ALL') {
          result = result.filter((row) => String(row[key]) === val);
        }
      });
    }

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, searchField, filterOptions, selectedFilters, sortKey, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    exportToCsv(filteredData, exportFilename);
  };

  return (
    <div id={id} className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 backdrop-blur-xs">
        <div>
          {title && (
            <h3 className="text-base font-bold text-slate-900 font-heading">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-white/80 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 shadow-2xs backdrop-blur-xs transition-all"
            />
          </div>

          {/* Filters */}
          {filterOptions?.map((filter) => (
            <div key={String(filter.key)} className="relative">
              <select
                value={selectedFilters[String(filter.key)] || 'ALL'}
                onChange={(e) => {
                  setSelectedFilters((prev) => ({
                    ...prev,
                    [String(filter.key)]: e.target.value,
                  }));
                  setCurrentPage(1);
                }}
                className="pl-2.5 pr-7 py-1.5 bg-white/80 hover:bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs backdrop-blur-xs"
              >
                <option value="ALL">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Export CSV button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-200/90 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs backdrop-blur-xs"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Additional custom action buttons */}
          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-100/60 backdrop-blur-xs text-slate-700 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3.5 ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-slate-200/50 transition-colors' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/90 bg-white/40">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-indigo-50/50 transition-colors duration-100"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3.5 align-middle text-slate-800 ${
                        col.className || ''
                      }`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '-')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 bg-slate-50/70 backdrop-blur-xs">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredData.length > 0
              ? (currentPage - 1) * pageSize + 1
              : 0}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800">
            {filteredData.length}
          </span>{' '}
          entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-white/80 border border-slate-200/90 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-semibold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-white/80 border border-slate-200/90 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
