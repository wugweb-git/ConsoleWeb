import { useState, useMemo, ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Column Definition ───
export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** Render cell content. Receives the row item. */
  render: (item: T) => ReactNode;
  /** Sort comparator. Return negative/zero/positive. If omitted, column is not sortable. */
  sortFn?: (a: T, b: T) => number;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Min width hint (tailwind class, e.g. 'min-w-[120px]') */
  className?: string;
  /** Hide on small screens */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Unique key extractor */
  getRowId: (item: T) => string;
  /** Rows per page. 0 = no pagination */
  pageSize?: number;
  /** Empty state content */
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Extra action in empty state */
  emptyAction?: ReactNode;
  /** Row click handler */
  onRowClick?: (item: T) => void;
  /** Loading state */
  isLoading?: boolean;
}

type SortDir = 'asc' | 'desc';

export function DataTable<T>({
  columns,
  data,
  getRowId,
  pageSize = 20,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription = '',
  emptyAction,
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(0);

  // ─── Sorting ───
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find(c => c.key === sortKey);
    if (!col?.sortFn) return data;
    const sorted = [...data].sort(col.sortFn);
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [data, sortKey, sortDir, columns]);

  // ─── Pagination ───
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const paginatedData = pageSize > 0
    ? sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : sortedData;

  // Reset page when data changes
  if (currentPage >= totalPages && currentPage > 0) {
    setCurrentPage(0);
  }

  const handleSort = (key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col?.sortFn) return;
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(0);
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground opacity-50" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-foreground" />
      : <ChevronDown className="w-3.5 h-3.5 text-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          {emptyIcon && (
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              {emptyIcon}
            </div>
          )}
          <p className="text-foreground font-[var(--font-weight-semibold)]">{emptyTitle}</p>
          {emptyDescription && (
            <p className="text-muted-foreground mt-1">{emptyDescription}</p>
          )}
          {emptyAction && <div className="mt-4">{emptyAction}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map(col => {
                const isSortable = !!col.sortFn;
                const alignCls = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-muted-foreground font-[var(--font-weight-medium)] text-[length:var(--text-sm)] ${alignCls} ${col.className || ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${isSortable ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''}`}
                    onClick={() => isSortable && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {isSortable && <SortIcon colKey={col.key} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((item) => (
              <tr
                key={getRowId(item)}
                className={`transition-colors hover:bg-muted/30 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map(col => {
                  const alignCls = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-[length:var(--text-sm)] ${alignCls} ${col.className || ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {col.render(item)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-muted-foreground text-[length:var(--text-sm)]">
            Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-[var(--radius-sm)] border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current
              let page = i;
              if (totalPages > 5) {
                const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                page = start + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {page + 1}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-1.5 rounded-[var(--radius-sm)] border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
