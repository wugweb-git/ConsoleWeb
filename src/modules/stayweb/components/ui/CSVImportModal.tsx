import { useState, useCallback, ReactNode } from 'react';
import { Upload, Download, X, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

// ─── Column spec for CSV format instructions ───
export interface CSVColumnSpec {
  /** Column header name exactly as it appears in the CSV */
  name: string;
  /** Whether this column is required */
  required?: boolean;
  /** Example value shown in the instructions & template */
  example: string;
  /** Short description of accepted values */
  description?: string;
}

// ─── Template row type ───
export interface CSVTemplateRow {
  [key: string]: string;
}

interface CSVImportModalProps {
  /** Modal title, e.g. "Import Rooms via .CSV" */
  title: string;
  /** Column specifications for format instructions */
  columns: CSVColumnSpec[];
  /** Sample data rows for the template download (1–2 rows) */
  templateRows: CSVTemplateRow[];
  /** Template filename, e.g. "room-import-template.csv" */
  templateFilename?: string;
  /** Called when modal should close */
  onClose: () => void;
  /**
   * Parse a single CSV data row (string[]) into your domain object.
   * Return the object on success, or `null` to skip the row.
   * Throw to count the row as failed.
   * @param cells - positional array of cell values
   * @param index - row index (0-based)
   * @param record - header-keyed object mapping column headers to cell values
   */
  parseRow: (cells: string[], index: number, record?: Record<string, string>) => any | null;
  /**
   * Called with all successfully parsed rows.
   * Should persist them (e.g. addRoom, addGuest, etc.).
   * Return { imported: number; skipped?: number; failed?: number }
   */
  onImport: (rows: any[]) => Promise<{ imported: number; skipped?: number; failed?: number }>;
  /** Optional preview renderer. Gets the parsed rows. Default renders a simple table. */
  renderPreview?: (rows: any[]) => ReactNode;
  /** Extra description text below the column table */
  extraNotes?: string;
}

/**
 * Reusable CSV Import Modal.
 *
 * Every "Import .CSV" button across the app opens this modal, which provides:
 *  1. 📋 CSV Format Instructions (column table)
 *  2. Download template.csv button
 *  3. Drag-and-drop upload zone
 *  4. Data preview
 *  5. Import confirmation
 */
export function CSVImportModal({
  title,
  columns,
  templateRows,
  templateFilename = 'import-template.csv',
  onClose,
  parseRow,
  onImport,
  renderPreview,
  extraNotes,
}: CSVImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseStats, setParseStats] = useState<{ total: number; parsed: number; failed: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped?: number; failed?: number } | null>(null);

  // ─── Template download ───
  const downloadTemplate = useCallback(() => {
    const headerRow = columns.map(c => c.name).join(',');
    const dataRows = templateRows.map(row =>
      columns.map(c => {
        const val = row[c.name] ?? c.example ?? '';
        // Quote values containing commas or semicolons
        return val.includes(',') || val.includes(';') ? `"${val}"` : val;
      }).join(',')
    );
    const csv = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = templateFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, templateRows, templateFilename]);

  // ─── CSV parser helper ───
  const parseCSVLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  // ─── File processing ───
  const handleFileUpload = useCallback(async (file: File) => {
    setError('');
    setParsedRows([]);
    setParseStats(null);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());

      if (lines.length < 2) {
        setError('CSV file is empty or has no data rows (needs header + at least 1 data row).');
        return;
      }

      // Parse headers from first row for header-keyed record
      const headers = parseCSVLine(lines[0]);
      const dataLines = lines.slice(1);
      const rows: any[] = [];
      let failed = 0;

      for (let i = 0; i < dataLines.length; i++) {
        try {
          const cells = parseCSVLine(dataLines[i]);
          // Build a header→value record for header-aware parsing
          const record: Record<string, string> = {};
          headers.forEach((h, idx) => {
            if (h) record[h.trim()] = (cells[idx] ?? '').trim();
          });
          const parsed = parseRow(cells, i, record);
          if (parsed !== null) {
            rows.push(parsed);
          }
        } catch {
          failed++;
        }
      }

      setParsedRows(rows);
      setParseStats({ total: dataLines.length, parsed: rows.length, failed });

      if (rows.length === 0 && failed > 0) {
        setError(`All ${failed} rows failed to parse. Check that your CSV matches the column format above.`);
      } else if (rows.length === 0) {
        setError('No valid data rows found. Make sure the file has data below the header row.');
      }
    } catch (err) {
      setError(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [parseRow]);

  // ─── Drop handlers ───
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      handleFileUpload(file);
    } else {
      setError('Please upload a .csv file');
    }
  }, [handleFileUpload]);

  // ─── Import action ───
  const handleImportClick = useCallback(async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setError('');
    try {
      const result = await onImport(parsedRows);
      setImportResult(result);
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  }, [parsedRows, onImport]);

  const hasData = parsedRows.length > 0;
  const isComplete = importResult !== null && ((importResult.imported ?? 0) > 0 || (importResult.skipped ?? 0) > 0);

  /** Resolve a column display-name to the matching key in the parsed row object.
   *  Tries: exact match → lowercase → camelCase conversion → strip parentheses then camelCase */
  const resolveRowValue = (row: any, colName: string): string => {
    if (row[colName] !== undefined) return String(row[colName]);
    const lower = colName.toLowerCase();
    if (row[lower] !== undefined) return String(row[lower]);
    // camelCase: "Max Occupancy" → "maxOccupancy", "Base Price (INR)" → "basePrice"
    const stripped = colName.replace(/\s*\(.*?\)\s*/g, '').trim();
    const camel = stripped
      .split(/[\s\-_]+/)
      .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
    if (row[camel] !== undefined) return String(row[camel]);
    // Also try lowercase camel
    if (row[camel.toLowerCase()] !== undefined) return String(row[camel.toLowerCase()]);
    return '—';
  };

  return (
    <div
      className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-[var(--radius-lg)] border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-[var(--radius-md)] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-card-foreground">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-[var(--radius-md)] transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ─── 📋 CSV Format Instructions ─── */}
          <div className="bg-muted border border-border rounded-[var(--radius-md)] p-5">
            <h4 className="text-accent-foreground flex items-center gap-2 mb-3">
              <span>📋</span> CSV Format Instructions
            </h4>
            <p className="text-muted-foreground text-[length:var(--text-sm)] mb-4">
              Upload a CSV file with the following columns:
              <span className="font-[var(--font-weight-semibold)] text-card-foreground ml-1">
                {columns.map(c => c.name).join(', ')}
              </span>
            </p>

            {/* Column specification table */}
            <div className="border border-border rounded-[var(--radius-md)] overflow-hidden mb-4">
              <table className="w-full text-[length:var(--text-sm)]">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="px-3 py-2 text-left text-muted-foreground font-[var(--font-weight-medium)]">Column</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-[var(--font-weight-medium)]">Required</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-[var(--font-weight-medium)]">Example</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-[var(--font-weight-medium)] hidden sm:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {columns.map((col) => (
                    <tr key={col.name} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-card-foreground font-[var(--font-weight-medium)]">
                        {col.name}
                      </td>
                      <td className="px-3 py-2">
                        {col.required ? (
                          <span className="text-destructive font-[var(--font-weight-medium)]">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <code className="px-1.5 py-0.5 bg-muted rounded-[var(--radius-sm)] text-card-foreground text-[length:var(--text-xs)]">
                          {col.example}
                        </code>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                        {col.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {extraNotes && (
              <p className="text-muted-foreground text-[length:var(--text-xs)] mb-4 leading-relaxed">
                {extraNotes}
              </p>
            )}

            {/* Download Template button */}
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors text-[length:var(--text-sm)] font-[var(--font-weight-medium)]"
            >
              <Download className="w-4 h-4" />
              Download template.csv
            </button>
          </div>

          {/* ─── Success state ─── */}
          {isComplete && (
            <div className={`border rounded-[var(--radius-md)] p-5 flex items-start gap-3 ${
              (importResult.imported ?? 0) > 0
                ? 'bg-success-bg border-success-border'
                : 'bg-warning-bg border-warning-border'
            }`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                (importResult.imported ?? 0) > 0 ? 'text-success' : 'text-warning'
              }`} />
              <div>
                <p className={`font-[var(--font-weight-semibold)] ${
                  (importResult.imported ?? 0) > 0 ? 'text-success-foreground' : 'text-warning-foreground'
                }`}>
                  {(importResult.imported ?? 0) > 0 ? 'Import complete' : 'No new items to import'}
                </p>
                <p className={`text-[length:var(--text-sm)] mt-1 ${
                  (importResult.imported ?? 0) > 0 ? 'text-success-foreground' : 'text-warning-foreground'
                }`}>
                  {(importResult.imported ?? 0) > 0 ? `${importResult.imported} imported` : ''}
                  {importResult.skipped ? `${(importResult.imported ?? 0) > 0 ? ', ' : ''}${importResult.skipped} skipped (already exist)` : ''}
                  {importResult.failed ? `, ${importResult.failed} failed` : ''}
                </p>
              </div>
            </div>
          )}

          {/* ─── Drag & Drop Zone ─── */}
          {!isComplete && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[var(--radius-lg)] p-10 transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                id="csv-import-upload"
                accept=".csv,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  // Reset so re-selecting same file works
                  e.target.value = '';
                }}
                className="hidden"
              />
              <label htmlFor="csv-import-upload" className="flex flex-col items-center gap-3 cursor-pointer">
                <div className="w-16 h-16 bg-muted rounded-[var(--radius-full)] flex items-center justify-center">
                  <Upload className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-card-foreground font-[var(--font-weight-medium)]">
                    Drag & drop CSV file here or{' '}
                    <span className="text-accent font-[var(--font-weight-semibold)]">browse</span>
                  </p>
                  <p className="text-muted-foreground text-[length:var(--text-sm)] mt-1">
                    .csv or .txt files accepted
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* ─── Error ─── */}
          {error && (
            <div className="bg-error-bg border border-error-border rounded-[var(--radius-md)] p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-[length:var(--text-sm)]">{error}</p>
            </div>
          )}

          {/* ─── Parse stats ─── */}
          {parseStats && !isComplete && (
            <div className="flex items-center gap-4 text-[length:var(--text-sm)]">
              <span className="text-muted-foreground">
                {parseStats.total} rows read
              </span>
              <span className="text-success-foreground font-[var(--font-weight-medium)]">
                {parseStats.parsed} valid
              </span>
              {parseStats.failed > 0 && (
                <span className="text-destructive font-[var(--font-weight-medium)]">
                  {parseStats.failed} failed
                </span>
              )}
            </div>
          )}

          {/* ─── Data Preview ─── */}
          {hasData && !isComplete && (
            <div>
              <h4 className="text-card-foreground mb-3">
                Preview ({parsedRows.length} {parsedRows.length === 1 ? 'row' : 'rows'})
              </h4>
              {renderPreview ? (
                renderPreview(parsedRows)
              ) : (
                <div className="max-h-56 overflow-y-auto border border-border rounded-[var(--radius-md)]">
                  <table className="w-full text-[length:var(--text-sm)]">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        {columns.slice(0, 5).map(col => (
                          <th key={col.name} className="px-3 py-2 text-left text-muted-foreground font-[var(--font-weight-medium)]">
                            {col.name}
                          </th>
                        ))}
                        {columns.length > 5 && (
                          <th className="px-3 py-2 text-left text-muted-foreground font-[var(--font-weight-medium)]">…</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.slice(0, 10).map((row, i) => (
                        <tr key={i}>
                          {columns.slice(0, 5).map(col => (
                            <td key={col.name} className="px-3 py-2 text-card-foreground truncate max-w-[180px]">
                              {resolveRowValue(row, col.name)}
                            </td>
                          ))}
                          {columns.length > 5 && (
                            <td className="px-3 py-2 text-muted-foreground">…</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 10 && (
                    <p className="px-3 py-2 text-muted-foreground text-[length:var(--text-xs)] bg-muted/30">
                      + {parsedRows.length - 10} more rows
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Footer Actions ─── */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-muted text-card-foreground rounded-[var(--radius-md)] hover:bg-muted/80 transition-colors font-[var(--font-weight-medium)]"
            >
              {isComplete ? 'Done' : 'Cancel'}
            </button>
            {!isComplete && (
              <button
                onClick={handleImportClick}
                disabled={parsedRows.length === 0 || isImporting}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-[var(--font-weight-medium)] flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Importing…
                  </>
                ) : (
                  `Import ${parsedRows.length} ${parsedRows.length === 1 ? 'Row' : 'Rows'}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}