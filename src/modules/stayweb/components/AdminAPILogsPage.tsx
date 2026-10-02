import { useState, useEffect } from 'react';
import { FileCode, RefreshCw, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { StatCard } from './ui/StatCard';
import { DataTable, DataTableColumn } from './ui/DataTable';

interface APILog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  status: number;
  duration: number;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  userAgent: string;
  ip: string;
}

export function AdminAPILogsPage() {
  const [logs, setLogs] = useState<APILog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('all');
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    // Simulate loading API logs
    setTimeout(() => {
      const mockLogs: APILog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          method: 'POST',
          endpoint: '/make-server-ead79e26/bookings',
          status: 201,
          duration: 234,
          requestBody: { guestId: 'G-1234', roomId: 'R-101', checkIn: '2024-03-20', checkOut: '2024-03-25' },
          responseBody: { success: true, bookingId: 'BK-5678' },
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.100',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          method: 'GET',
          endpoint: '/make-server-ead79e26/rooms',
          status: 200,
          duration: 145,
          responseBody: { rooms: [] },
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.100',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          method: 'PUT',
          endpoint: '/make-server-ead79e26/rooms/101',
          status: 200,
          duration: 189,
          requestBody: { status: 'occupied' },
          responseBody: { success: true },
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.101',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          method: 'GET',
          endpoint: '/make-server-ead79e26/guests/G-1234',
          status: 404,
          duration: 87,
          responseBody: { error: 'Guest not found' },
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.102',
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          method: 'DELETE',
          endpoint: '/make-server-ead79e26/bookings/BK-9999',
          status: 500,
          duration: 523,
          responseBody: { error: 'Internal server error' },
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.100',
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          method: 'POST',
          endpoint: '/make-server-ead79e26/guests',
          status: 201,
          duration: 312,
          requestBody: { name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210' },
          responseBody: { success: true, guestId: 'G-5678' },
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.103',
        },
      ];
      setLogs(mockLogs);
      setIsLoading(false);
    }, 500);
  };

  const getStatusBg = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-success-bg border-success-border text-success-foreground';
    if (status >= 400 && status < 500) return 'bg-warning-bg border-warning-border text-warning-foreground';
    if (status >= 500) return 'bg-error-bg border-error-border text-error-foreground';
    return 'bg-muted border-border text-muted-foreground';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-info-foreground bg-info-bg border border-info-border';
      case 'POST': return 'text-success-foreground bg-success-bg border border-success-border';
      case 'PUT': return 'text-warning-foreground bg-warning-bg border border-warning-border';
      case 'DELETE': return 'text-error-foreground bg-error-bg border border-error-border';
      default: return 'text-muted-foreground bg-muted border border-border';
    }
  };

  const columns: DataTableColumn<APILog>[] = [
    {
      key: 'method',
      header: 'Method',
      render: (log) => (
        <span className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] w-14 inline-block text-center uppercase tracking-tighter ${getMethodColor(log.method)}`}>
          {log.method}
        </span>
      ),
      sortFn: (a, b) => a.method.localeCompare(b.method)
    },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (log) => <code className="text-xs text-foreground font-mono truncate block max-w-xs xl:max-w-md">{log.endpoint}</code>,
      sortFn: (a, b) => a.endpoint.localeCompare(b.endpoint)
    },
    {
      key: 'status',
      header: 'Status',
      render: (log) => (
        <span className={`px-2 py-0.5 rounded-[var(--radius-sm)] border text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] font-mono ${getStatusBg(log.status)}`}>
          {log.status}
        </span>
      ),
      sortFn: (a, b) => a.status - b.status,
      align: 'center'
    },
    {
      key: 'duration',
      header: 'Latency',
      hideOnMobile: true,
      render: (log) => <span className="text-xs font-[var(--font-weight-medium)] text-muted-foreground">{log.duration}ms</span>,
      sortFn: (a, b) => a.duration - b.duration,
      align: 'right'
    },
    {
      key: 'timestamp',
      header: 'Time',
      hideOnMobile: true,
      render: (log) => <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>,
      sortFn: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      align: 'right'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'success' && log.status >= 200 && log.status < 300) ||
      (filterStatus === 'error' && log.status >= 400);
    const matchesMethod = filterMethod === 'all' || log.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status >= 200 && l.status < 300).length,
    errors: logs.filter(l => l.status >= 400).length,
    avgDuration: logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + l.duration, 0) / logs.length) : 0,
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <AdminPageHeader
        title="API Logs"
        description="Monitor API requests and responses in real-time"
        icon={FileCode}
        badge="Admin Tool"
        actions={
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:opacity-90 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Requests" value={stats.total} icon={FileCode} />
            <StatCard label="Successful" value={stats.success} icon={CheckCircle} valueColor="text-success-foreground" />
            <StatCard label="API Errors" value={stats.errors} icon={XCircle} valueColor="text-error-foreground" />
            <StatCard label="Avg Duration" value={`${stats.avgDuration}ms`} icon={Clock} />
          </div>

          {/* Filters Bar */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by endpoint..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px] text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success (2xx)</option>
                  <option value="error">Errors (4xx+)</option>
                </select>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value as any)}
                  className="px-4 py-2 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px] text-sm"
                >
                  <option value="all">All Methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>
          </div>

          {/* API Events DataTable */}
          <DataTable
            columns={columns}
            data={filteredLogs}
            getRowId={(item) => item.id}
            pageSize={15}
            isLoading={isLoading}
            onRowClick={setSelectedLog}
            emptyTitle="No API logs found"
            emptyDescription="No network activity matches the current filter criteria."
          />
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-[var(--radius-2xl)] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
              <h4>Request Details</h4>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-muted rounded-[var(--radius-md)] transition-colors"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted border border-border rounded-[var(--radius-lg)]">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Method</p>
                  <span className={`inline-block px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-[var(--font-weight-bold)] uppercase tracking-tighter ${getMethodColor(selectedLog.method)}`}>
                    {selectedLog.method}
                  </span>
                </div>
                <div className="p-4 bg-muted border border-border rounded-[var(--radius-lg)]">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-[var(--font-weight-bold)] font-mono ${getStatusBg(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div className="p-4 bg-muted border border-border rounded-[var(--radius-lg)]">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Latency</p>
                  <p className="text-sm font-[var(--font-weight-bold)] text-foreground">{selectedLog.duration}ms</p>
                </div>
                <div className="p-4 bg-muted border border-border rounded-[var(--radius-lg)]">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-[var(--font-weight-bold)] text-foreground">{new Date(selectedLog.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">Request Endpoint</label>
                <div className="p-4 bg-muted border border-border rounded-[var(--radius-lg)]">
                   <code className="text-sm text-foreground font-mono break-all">{selectedLog.endpoint}</code>
                </div>
              </div>

              {/* JSON Payloads */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">Request Body</label>
                  <div className="p-4 bg-muted border border-border rounded-[var(--radius-lg)] flex-1 min-h-[150px] overflow-auto">
                    {selectedLog.requestBody ? (
                      <pre className="text-[length:var(--text-2xs)] text-foreground font-mono whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(selectedLog.requestBody || '{}'), null, 2)}
                      </pre>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No request body</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">Response Payload</label>
                  <div className="p-4 bg-muted border border-border rounded-[var(--radius-lg)] flex-1 min-h-[150px] overflow-auto">
                    {selectedLog.responseBody ? (
                      <pre className="text-[length:var(--text-2xs)] text-foreground font-mono whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(selectedLog.responseBody || '{}'), null, 2)}
                      </pre>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No response body</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Network Details */}
              <div className="p-6 bg-card border border-border rounded-[var(--radius-xl)]">
                <h4 className="mb-4">Connection Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Source IP</span>
                    <code className="text-xs font-[var(--font-weight-bold)] text-foreground">{selectedLog.ip}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User Agent</span>
                    <code className="text-[length:var(--text-2xs)] text-right max-w-md text-foreground">{selectedLog.userAgent}</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-muted/50 border-t border-border shrink-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] font-[var(--font-weight-medium)] hover:opacity-90 transition-all shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}