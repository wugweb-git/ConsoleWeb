import { useState, useEffect } from 'react';
import { Terminal, RefreshCw, AlertCircle, Info, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { StatCard } from './ui/StatCard';
import { DataTable, DataTableColumn } from './ui/DataTable';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: Record<string, unknown>;
}

export function AdminSystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogs = async () => {
    setIsLoading(true);
    // Simulate loading system logs
    setTimeout(() => {
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          source: 'Database',
          message: 'Successfully connected to Postgres KV store',
          details: { host: 'db.supabase.co', port: 5432 },
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          level: 'success',
          source: 'Booking Engine',
          message: 'New booking created successfully',
          details: { bookingId: 'BK-1234', guestName: 'John Doe', room: '101' },
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'warning',
          source: 'Room Service',
          message: 'Room 205 approaching maximum occupancy',
          details: { roomId: '205', current: 3, max: 4 },
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 90000).toISOString(),
          level: 'error',
          source: 'Payment Gateway',
          message: 'Payment processing failed for transaction',
          details: { transactionId: 'TXN-9876', error: 'Insufficient funds', amount: 5000 },
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'info',
          source: 'Email Service',
          message: 'Booking confirmation email sent',
          details: { recipient: 'guest@example.com', bookingId: 'BK-1234' },
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 150000).toISOString(),
          level: 'warning',
          source: 'Inventory',
          message: 'Low stock alert for room type',
          details: { roomType: 'Deluxe', available: 2, threshold: 5 },
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          level: 'success',
          source: 'Check-In',
          message: 'Guest successfully checked in',
          details: { guestId: 'G-5678', roomNumber: '302', checkInTime: new Date().toISOString() },
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 210000).toISOString(),
          level: 'error',
          source: 'OTA Integration',
          message: 'Failed to sync rates with Booking.com',
          details: { channel: 'Booking.com', error: 'Connection timeout' },
        },
        {
          id: '9',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          level: 'info',
          source: 'Authentication',
          message: 'User logged in successfully',
          details: { userId: 'U-123', email: 'admin@wugweb.com', ip: '192.168.1.100' },
        },
        {
          id: '10',
          timestamp: new Date(Date.now() - 270000).toISOString(),
          level: 'warning',
          source: 'Backup Service',
          message: 'Automated backup running longer than expected',
          details: { duration: '15 minutes', expectedDuration: '5 minutes' },
        },
      ];
      setLogs(mockLogs);
      setIsLoading(false);
    }, 500);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-3.5 h-3.5" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'error': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'success': return <CheckCircle className="w-3.5 h-3.5" />;
      default: return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-info-foreground bg-info-bg border-info-border';
      case 'warning': return 'text-warning-foreground bg-warning-bg border-warning-border';
      case 'error': return 'text-error-foreground bg-error-bg border-error-border';
      case 'success': return 'text-success-foreground bg-success-bg border-success-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const columns: DataTableColumn<SystemLog>[] = [
    {
      key: 'level',
      header: 'Level',
      render: (log) => (
        <div className={`px-2 py-0.5 rounded-[var(--radius-sm)] border text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] inline-flex items-center gap-1.5 ${getLevelColor(log.level)}`}>
          {getLevelIcon(log.level)}
          <span className="uppercase tracking-wider">{log.level}</span>
        </div>
      ),
      sortFn: (a, b) => a.level.localeCompare(b.level)
    },
    {
      key: 'source',
      header: 'Source',
      hideOnMobile: true,
      render: (log) => <span className="text-xs font-[var(--font-weight-semibold)] text-muted-foreground uppercase">{log.source}</span>,
      sortFn: (a, b) => a.source.localeCompare(b.source)
    },
    {
      key: 'message',
      header: 'Message',
      render: (log) => <p className="text-xs text-foreground line-clamp-1">{log.message}</p>,
      sortFn: (a, b) => a.message.localeCompare(b.message)
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      hideOnMobile: true,
      render: (log) => <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>,
      sortFn: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      align: 'right'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
    success: logs.filter(l => l.level === 'success').length,
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <AdminPageHeader
        title="System Logs"
        description="View application logs and system events"
        icon={Terminal}
        badge="Admin Tool"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-[var(--radius-md)] flex items-center gap-2 transition-colors ${
                autoRefresh
                  ? 'bg-success-bg text-success-foreground border border-success-border'
                  : 'bg-muted hover:bg-secondary text-foreground border border-border'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span className="text-foreground">{autoRefresh ? 'Auto' : 'Manual'}</span>
            </button>
            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:opacity-90 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Logs" value={stats.total} icon={Terminal} />
            <StatCard label="Info" value={stats.info} icon={Info} valueColor="text-info-foreground" />
            <StatCard label="Success" value={stats.success} icon={CheckCircle} valueColor="text-success-foreground" />
            <StatCard label="Warnings" value={stats.warning} icon={AlertTriangle} valueColor="text-warning-foreground" />
            <StatCard label="Errors" value={stats.error} icon={AlertCircle} valueColor="text-error-foreground" />
          </div>

          {/* Filters & Search */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search logs message or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary text-[length:var(--text-sm)] text-foreground"
                />
              </div>
              <div className="min-w-[200px]">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary text-[length:var(--text-sm)] text-foreground"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs List DataTable */}
          <DataTable
            columns={columns}
            data={filteredLogs}
            getRowId={(item) => item.id}
            pageSize={15}
            isLoading={isLoading}
            onRowClick={setSelectedLog}
            emptyTitle="No system logs found"
            emptyDescription="No events match your current filter settings."
          />
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-[var(--radius-2xl)] shadow-2xl max-w-2xl w-full overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h4 className="text-foreground">Log Details</h4>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-muted rounded-[var(--radius-md)] transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-[var(--font-weight-bold)]">Level</label>
                  <div className={`inline-flex px-3 py-1 rounded-[var(--radius-sm)] border items-center gap-2 text-xs font-[var(--font-weight-bold)] ${getLevelColor(selectedLog.level)}`}>
                    {getLevelIcon(selectedLog.level)}
                    <span className="uppercase">{selectedLog.level}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-[var(--font-weight-bold)]">Source</label>
                  <span className="text-xs font-[var(--font-weight-bold)] px-3 py-1 bg-muted rounded-[var(--radius-sm)] border border-border block w-fit uppercase text-muted-foreground">
                    {selectedLog.source}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-[var(--font-weight-bold)]">Timestamp</label>
                <p className="text-sm font-[var(--font-weight-semibold)] text-foreground">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-[var(--font-weight-bold)]">Message</label>
                <div className="p-4 bg-muted border border-border rounded-[var(--radius-md)]">
                  <p className="text-sm text-foreground leading-relaxed">{selectedLog.message}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-[var(--font-weight-bold)]">Payload Details</label>
                  <pre className="p-4 bg-muted border border-border rounded-[var(--radius-md)] text-[11px] text-foreground overflow-x-auto font-mono">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-muted/50 border-t border-border">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] font-[var(--font-weight-bold)] hover:opacity-90 transition-all shadow-sm"
              >
                Close Log Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}