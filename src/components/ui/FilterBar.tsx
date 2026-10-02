import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (filterId: string, value: string) => void;
  onClearFilters?: () => void;
  actions?: React.ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  actions,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(filterValues).some(v => v && v !== 'all');

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1" style={{ minWidth: '200px', maxWidth: '320px' }}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--muted-foreground)' }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2"
          style={{
            backgroundColor: 'var(--input-background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      {/* Filter dropdowns */}
      {filters.map(filter => (
        <div key={filter.id} className="relative">
          <select
            value={filterValues[filter.id] || 'all'}
            onChange={e => onFilterChange?.(filter.id, e.target.value)}
            className="appearance-none px-3 py-2 pr-8 cursor-pointer"
            style={{
              backgroundColor: 'var(--input-background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--foreground)',
            }}
          >
            <option value="all">{filter.label}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Filter
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: 'var(--muted-foreground)' }}
          />
        </div>
      ))}

      {/* Clear filters */}
      {hasActiveFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      )}

      {/* Right-side actions */}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
