/**
 * IconPickerField
 * A visual icon selector for Platform Config forms (amenities, manual charges,
 * HK task types, POS categories, etc.). Replaces the old free-text "Icon Name (Lucide)"
 * input with a searchable, grouped grid of icons.
 *
 * Usage:
 *   <IconPickerField value={iconKey} onChange={setIconKey} itemName="Free WiFi" />
 *
 * Features:
 *   - Grouped icon grid with category headers
 *   - Live search/filter
 *   - Auto-suggest based on item name (uses suggestIconForName)
 *   - Shows selected icon inline
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Sparkles, X, ChevronDown } from 'lucide-react';
import {
  ICON_REGISTRY, ICON_GROUPS, ICON_KEYS,
  getIconByKey, suggestIconForName,
} from '../../utils/iconMapping';

interface IconPickerFieldProps {
  value: string;
  onChange: (key: string) => void;
  /** Current item name — used for auto-suggest */
  itemName?: string;
  label?: string;
  placeholder?: string;
}

export function IconPickerField({
  value,
  onChange,
  itemName = '',
  label = 'Icon',
  placeholder = 'Pick an icon…',
}: IconPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Auto-suggest
  const suggested = useMemo(
    () => itemName ? suggestIconForName(itemName, '') : '',
    [itemName]
  );

  // Filtered groups
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return ICON_GROUPS;
    const q = search.toLowerCase();
    return ICON_GROUPS
      .map(g => ({
        ...g,
        keys: g.keys.filter(k => k.toLowerCase().includes(q)),
      }))
      .filter(g => g.keys.length > 0);
  }, [search]);

  const SelectedIcon = value ? getIconByKey(value) : null;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-foreground mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2 border border-border rounded-[var(--radius-md)] bg-input-background text-[length:var(--text-sm)] text-foreground hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {SelectedIcon ? (
          <>
            <span className="w-7 h-7 rounded-[var(--radius-md)] bg-primary/10 flex items-center justify-center shrink-0">
              <SelectedIcon className="w-4 h-4 text-primary" />
            </span>
            <span className="flex-1 text-left font-[var(--font-weight-medium)]">{value}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown picker */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-popover border border-border rounded-[var(--radius-lg)] shadow-[var(--elevation-xl)] max-h-[360px] flex flex-col overflow-hidden">
          {/* Search + auto-suggest bar */}
          <div className="p-2.5 border-b border-border space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search icons…"
                className="w-full pl-8 pr-8 py-1.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-[var(--radius-sm)] hover:bg-muted text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Auto-suggest chip */}
            {suggested && suggested !== value && (
              <button
                onClick={() => { onChange(suggested); setOpen(false); }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[var(--radius-md)] bg-muted border border-border hover:bg-muted/80 transition-colors text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-foreground">
                  Auto-suggest:
                </span>
                {(() => { const SugIcon = getIconByKey(suggested); return <SugIcon className="w-4 h-4 text-foreground" />; })()}
                <span className="text-[length:var(--text-xs)] text-muted-foreground">{suggested}</span>
              </button>
            )}

            {/* Clear selection */}
            {value && (
              <button
                onClick={() => { onChange(''); setOpen(false); }}
                className="flex items-center gap-1.5 text-[length:var(--text-xs)] text-destructive hover:underline"
              >
                <X className="w-3 h-3" /> Clear selection
              </button>
            )}
          </div>

          {/* Icon grid */}
          <div className="overflow-y-auto flex-1 p-2.5 space-y-3">
            {filteredGroups.length === 0 ? (
              <p className="text-center text-[length:var(--text-sm)] text-muted-foreground py-4">
                No icons match "{search}"
              </p>
            ) : (
              filteredGroups.map(group => (
                <div key={group.label}>
                  <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-8 gap-1">
                    {group.keys.map(key => {
                      const Icon = getIconByKey(key);
                      const isSelected = key === value;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => { onChange(key); setOpen(false); }}
                          title={key}
                          className={`w-full aspect-square flex items-center justify-center rounded-[var(--radius-md)] transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1'
                              : 'text-foreground hover:bg-muted border border-transparent hover:border-border'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}