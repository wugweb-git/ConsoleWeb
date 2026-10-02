import { useState, useEffect } from 'react';
import { Database, Search, Plus, Trash2, Edit, RefreshCw, Eye, Copy, AlertCircle, Filter, Upload, Download, XCircle } from 'lucide-react';
import { notifySuccess, notifyError } from '../utils/notify';
import { copyToClipboard } from '../utils/clipboard';
import { ConfirmDialog } from './ConfirmDialog';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { StatCard } from './ui/StatCard';
import { Badge } from './Badge';

interface AdminDatabaseBrowserProps {
  onBack?: () => void;
}

interface KVRecord {
  key: string;
  value: any;
}

// Resilient fetch that reads auth from localStorage (same as SuperAdmin)
function getStoredAuthToken(): string | null {
  try {
    const storageKey = `sb-${projectId}-auth-token`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const accessToken = parsed?.access_token;
    if (!accessToken) return null;
    const expiresAt = parsed?.expires_at;
    if (expiresAt && Date.now() / 1000 > expiresAt) return null;
    return accessToken;
  } catch {
    return null;
  }
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ead79e26`;

async function dbFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const authToken = getStoredAuthToken();
  const token = authToken || publicAnonKey;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'apikey': publicAnonKey,
    ...(options.headers as Record<string, string> || {}),
  };
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const text = await response.text();
  let responseData: any;
  try {
    responseData = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`);
  }
  if (!response.ok) {
    throw new Error(responseData?.error || responseData?.message || `HTTP ${response.status}`);
  }
  return (responseData.data !== undefined ? responseData.data : responseData) as T;
}

export function AdminDatabaseBrowser({ onBack }: AdminDatabaseBrowserProps) {
  const [records, setRecords] = useState<KVRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [prefixFilter, setPrefixFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<KVRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; description?: string; confirmLabel?: string;
    variant?: 'destructive' | 'warning' | 'default'; onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await dbFetch<Array<{ key: string; value: any }>>('/admin/all-tenants');
      const entries = Array.isArray(data) ? data : [];
      setRecords(entries.map(e => ({ key: e.key, value: e.value })));
    } catch (err: any) {
      const msg = err?.message || 'Failed to load KV records';
      console.error('[DatabaseBrowser] Load error:', err);
      setLoadError(msg);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const prefixes = Array.from(new Set(records.map(r => {
    const parts = r.key.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : parts[0];
  }))).sort();

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(record.value).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrefix = prefixFilter === 'all' || record.key.startsWith(prefixFilter);
    return matchesSearch && matchesPrefix;
  });

  const handleAddRecord = async () => {
    try {
      const parsedValue = JSON.parse(newValue);
      await dbFetch('/admin/kv-set', {
        method: 'POST',
        body: JSON.stringify({ key: newKey, value: parsedValue }),
      });
      setShowAddModal(false);
      setNewKey('');
      setNewValue('');
      notifySuccess('Record added successfully');
      await loadRecords();
    } catch (error: any) {
      notifyError(error, 'Failed to add record');
    }
  };

  const handleDeleteRecord = (key: string) => {
    setConfirmDialog({
      title: 'Purge KV Record',
      description: `Irreversible deletion of unique identifier "${key}" from the master cluster. Proceed?`,
      confirmLabel: 'Delete Permanently',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await dbFetch('/admin/kv-delete', {
            method: 'POST',
            body: JSON.stringify({ key }),
          });
          notifySuccess(`Record "${key}" deleted`);
          setConfirmDialog(null);
          await loadRecords();
        } catch (err: any) {
          notifyError(err, 'Failed to delete record');
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleEditRecord = async () => {
    if (!selectedRecord) return;
    try {
      const parsedValue = JSON.parse(newValue);
      await dbFetch('/admin/kv-set', {
        method: 'POST',
        body: JSON.stringify({ key: selectedRecord.key, value: parsedValue }),
      });
      setShowEditModal(false);
      setSelectedRecord(null);
      setNewValue('');
      notifySuccess('Record updated successfully');
      await loadRecords();
    } catch (error: any) {
      notifyError(error, 'Failed to update record');
    }
  };

  const openEditModal = (record: KVRecord) => {
    setSelectedRecord(record);
    setNewValue(JSON.stringify(record.value, null, 2));
    setShowEditModal(true);
  };

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) notifySuccess('Payload copied to clipboard');
    else notifyError('Could not copy to clipboard — please copy manually.');
  };

  const handleExportCSV = () => {
    const headers = ['Key', 'Value'];
    const rows = filteredRecords.map(r => [
      r.key,
      JSON.stringify(r.value)
    ]);
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kv-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          notifyError(new Error('CSV file is empty or has no data rows'), 'Import failed');
          return;
        }
        const dataRows = lines.slice(1);
        let imported = 0;
        let failed = 0;
        for (const line of dataRows) {
          try {
            const match = line.match(/^"?([^"]*)"?\s*,\s*"?(.*)"?\s*$/);
            if (!match) { failed++; continue; }
            const key = match[1].trim();
            const rawValue = match[2].replace(/""/g, '"');
            if (!key) { failed++; continue; }
            let parsedValue: any;
            try { parsedValue = JSON.parse(rawValue); } catch { parsedValue = rawValue; }
            await dbFetch('/admin/kv-set', {
              method: 'POST',
              body: JSON.stringify({ key, value: parsedValue }),
            });
            imported++;
          } catch {
            failed++;
          }
        }
        if (imported > 0) {
          notifySuccess(`Imported ${imported} record${imported > 1 ? 's' : ''} successfully${failed > 0 ? ` (${failed} failed)` : ''}`);
          await loadRecords();
        } else {
          notifyError(new Error(`All ${failed} rows failed to import`), 'Import failed');
        }
      } catch (err) {
        notifyError(err, 'Failed to read CSV file');
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">
      <AdminPageHeader
        title="KV Explorer"
        description="Low-level access to the persistent key-value cluster"
        icon={Database}
        badge="SuperAdmin Power User"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={loadRecords}
              disabled={isLoading}
              className="px-4 py-2.5 bg-card border border-border rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground hover:bg-muted disabled:opacity-30 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-muted-foreground">Force Sync</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Record</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total KV Entries" value={records.length} icon={Database} />
            <StatCard label="Filtered Subset" value={filteredRecords.length} icon={Filter} valueColor="text-info-foreground" />
            <StatCard label="Unique Prefixes" value={prefixes.length} icon={Search} />
            <StatCard label="Table Schema" value="JSON-B" icon={RefreshCw} />
          </div>

          {/* Filter Bar */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Query key identifiers or payload fragments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-[var(--radius-lg)] text-[length:var(--text-sm)] focus:border-accent outline-none transition-all placeholder:text-muted-foreground/60 text-foreground"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border border-border rounded-[var(--radius-lg)]">
                  <span className="text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground/60">Prefix</span>
                  <select
                    value={prefixFilter}
                    onChange={(e) => setPrefixFilter(e.target.value)}
                    className="bg-transparent text-[length:var(--text-sm)] font-[var(--font-weight-bold)] text-foreground outline-none border-none focus:ring-0"
                  >
                    <option value="all">Root Cluster (All)</option>
                    {prefixes.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                   <button
                    onClick={handleExportCSV}
                    disabled={filteredRecords.length === 0}
                    className="px-4 py-3 bg-muted/30 border border-border rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider hover:bg-muted transition-all text-foreground"
                  >
                    Export
                  </button>
                  <button
                    onClick={handleImportCSV}
                    className="px-4 py-3 bg-muted/30 border border-border rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider hover:bg-muted transition-all flex items-center gap-2 text-foreground"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-card border border-border rounded-[var(--radius-2xl)] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/5">
                  <th className="px-6 py-4 text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground border-b border-border">Key Identifier</th>
                  <th className="px-6 py-4 text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground border-b border-border">Payload Fragment</th>
                  <th className="px-6 py-4 text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground">Streaming data from cluster...</p>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground">Zero matches found in current partition</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.key} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary group-hover:animate-pulse" />
                          <code className="text-[length:var(--text-sm)] font-[var(--font-weight-bold)] text-card-foreground break-all">{record.key}</code>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-md">
                        <div className="bg-muted/30 px-3 py-1.5 rounded-[var(--radius-md)] border border-border/50">
                          <code className="text-[length:var(--text-2xs)] text-muted-foreground font-[var(--font-weight-medium)] block overflow-hidden text-ellipsis whitespace-nowrap">
                            {JSON.stringify(record.value)}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedRecord(record); setNewValue(JSON.stringify(record.value, null, 2)); }}
                            className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-foreground"
                            title="Inspect Object"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopy(JSON.stringify(record.value, null, 2))}
                            className="p-2.5 hover:bg-info-bg hover:text-info-foreground rounded-xl transition-all text-foreground"
                            title="Copy JSON"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-foreground"
                            title="Modify Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.key)}
                            className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all text-foreground"
                            title="Purge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals - Simplified & Styled */}
      {(showAddModal || showEditModal || (selectedRecord && !showEditModal)) && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-background border border-border rounded-[var(--radius-2xl)] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-card rounded-t-[var(--radius-2xl)]">
              <div>
                <h3 className="tracking-tight text-foreground">{showAddModal ? 'Insert Cluster Record' : showEditModal ? 'Patch Record' : 'Record Inspector'}</h3>
                <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground mt-0.5">Key: {showAddModal ? 'New' : selectedRecord?.key}</p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(false); if(!showEditModal) setSelectedRecord(null); }}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {showAddModal && (
                <div>
                  <label className="text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground block mb-2">Key Identifier</label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="e.g., tenantId:entity:unique-id"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-[var(--radius-lg)] text-sm font-[var(--font-weight-bold)] focus:border-accent outline-none text-foreground"
                  />
                </div>
              )}
              
              <div>
                <label className="text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground block mb-2">Payload (Validated JSON-B)</label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  readOnly={!showAddModal && !showEditModal}
                  rows={15}
                  className={`w-full px-4 py-3 bg-muted/30 border border-border rounded-[var(--radius-lg)] text-[length:var(--text-xs)] font-mono focus:border-accent outline-none custom-scrollbar text-foreground ${!showAddModal && !showEditModal ? 'cursor-default' : ''}`}
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-border bg-card rounded-b-[var(--radius-2xl)] flex gap-4">
              {showAddModal || showEditModal ? (
                <>
                  <button
                    onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedRecord(null); }}
                    className="flex-1 px-6 py-3 border border-border rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider hover:bg-muted transition-all text-foreground"
                  >
                    Abort
                  </button>
                  <button
                    onClick={showAddModal ? handleAddRecord : handleEditRecord}
                    disabled={showAddModal && (!newKey || !newValue)}
                    className="flex-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-30"
                  >
                    {showAddModal ? 'Commit Insert' : 'Apply Patch'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleCopy(newValue)}
                    className="flex-1 px-6 py-3 border border-border rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider hover:bg-muted transition-all flex items-center justify-center gap-2 text-foreground"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Payload
                  </button>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-[var(--radius-lg)] text-[length:var(--text-2xs)] font-[var(--font-weight-semibold)] tracking-wider"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog !== null}
        title={confirmDialog?.title || ''}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant || 'destructive'}
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}