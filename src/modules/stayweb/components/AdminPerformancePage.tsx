import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { StatCard } from './ui/StatCard';
import { AlertBanner } from './ui/AlertBanner';

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  requestsPerMin: number;
  activeConnections: number;
}

interface HistoricalData {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
}

export function AdminPerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    responseTime: 0,
    requestsPerMin: 0,
    activeConnections: 0,
  });
  const [historical, setHistorical] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMetrics();
    loadHistorical();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMetrics();
        loadHistorical();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMetrics = async () => {
    setIsLoading(true);
    // Simulate loading metrics with some variation
    setTimeout(() => {
      setMetrics({
        cpu: 35 + Math.random() * 20,
        memory: 62 + Math.random() * 15,
        disk: 48 + Math.random() * 5,
        responseTime: 120 + Math.random() * 80,
        requestsPerMin: 45 + Math.random() * 20,
        activeConnections: 12 + Math.floor(Math.random() * 8),
      });
      setIsLoading(false);
    }, 300);
  };

  const loadHistorical = () => {
    const now = Date.now();
    const data: HistoricalData[] = [];
    
    for (let i = 20; i >= 0; i--) {
      data.push({
        timestamp: new Date(now - i * 5000).toISOString(),
        cpu: 30 + Math.random() * 30,
        memory: 55 + Math.random() * 20,
        responseTime: 100 + Math.random() * 100,
      });
    }
    
    setHistorical(data);
  };

  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 40" className="w-full h-16" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="transition-all duration-300"
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <AdminPageHeader
        title="Performance Monitor"
        description="Real-time performance metrics and diagnostics"
        icon={Activity}
        badge="Admin Tool"
        actions={
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-[var(--radius-md)] flex items-center gap-2 transition-colors ${
              autoRefresh
                ? 'bg-success-bg text-success-foreground border border-success-border'
                : 'bg-muted hover:bg-secondary text-foreground border border-border'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto-Refresh' : 'Manual Refresh'}</span>
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-[var(--radius-md)] flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-[var(--font-weight-medium)]">CPU Usage</p>
                    <h3 className="text-foreground">{metrics.cpu.toFixed(1)}%</h3>
                  </div>
                </div>
                {metrics.cpu > 50 ? (
                  <TrendingUp className="w-5 h-5 text-destructive" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-success" />
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.cpu >= 90 ? 'bg-destructive' : metrics.cpu >= 70 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${metrics.cpu}%` }}
                />
              </div>
              <div className="pt-2">
                {renderSparkline(
                  historical.map(h => h.cpu),
                  metrics.cpu >= 90 ? 'var(--destructive)' : metrics.cpu >= 70 ? 'var(--warning)' : 'var(--success)'
                )}
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-[var(--radius-md)] flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-[var(--font-weight-medium)]">Memory Usage</p>
                    <h3 className="text-foreground">{metrics.memory.toFixed(1)}%</h3>
                  </div>
                </div>
                {metrics.memory > 70 ? (
                  <TrendingUp className="w-5 h-5 text-warning" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-success" />
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.memory >= 95 ? 'bg-destructive' : metrics.memory >= 80 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${metrics.memory}%` }}
                />
              </div>
              <div className="pt-2">
                {renderSparkline(
                  historical.map(h => h.memory),
                  metrics.memory >= 95 ? 'var(--destructive)' : metrics.memory >= 80 ? 'var(--warning)' : 'var(--success)'
                )}
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-[var(--radius-md)] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-[var(--font-weight-medium)]">Response Time</p>
                    <h3 className="text-foreground">{metrics.responseTime.toFixed(0)}ms</h3>
                  </div>
                </div>
                {metrics.responseTime > 200 ? (
                  <TrendingUp className="w-5 h-5 text-warning" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-success" />
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.responseTime >= 500 ? 'bg-destructive' : metrics.responseTime >= 200 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min((metrics.responseTime / 1000) * 100, 100)}%` }}
                />
              </div>
              <div className="pt-2">
                {renderSparkline(
                  historical.map(h => h.responseTime),
                  metrics.responseTime >= 500 ? 'var(--destructive)' : metrics.responseTime >= 200 ? 'var(--warning)' : 'var(--success)'
                )}
              </div>
            </div>
          </div>

          {/* Secondary Metrics using StatCard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Disk Usage"
              value={`${metrics.disk.toFixed(1)}%`}
              icon={HardDrive}
            />
            <StatCard
              label="Requests per minute"
              value={metrics.requestsPerMin.toFixed(0)}
              icon={Activity}
            />
            <StatCard
              label="Active Connections"
              value={metrics.activeConnections}
              icon={Activity}
            />
          </div>

          {/* Performance Insights */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h4 className="text-foreground">Performance Insights</h4>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {metrics.cpu > 70 && (
                <AlertBanner
                  variant="warning"
                  title="High CPU Usage Detected"
                  description={`CPU usage is currently at ${metrics.cpu.toFixed(1)}%. Consider optimizing database queries or scaling resources if this persists.`}
                />
              )}

              {metrics.memory > 80 && (
                <AlertBanner
                  variant="error"
                  title="Memory Usage Critical"
                  description={`Memory usage has reached ${metrics.memory.toFixed(1)}%. This may lead to application instability or slow performance.`}
                />
              )}

              {metrics.responseTime > 200 && (
                <AlertBanner
                  variant="info"
                  title="Slow Response Times"
                  description={`Average response time is ${metrics.responseTime.toFixed(0)}ms. Check for network latency or heavy operations in the backend.`}
                />
              )}

              {metrics.cpu <= 70 && metrics.memory <= 80 && metrics.responseTime <= 200 && (
                <AlertBanner
                  variant="success"
                  title="System Performance Optimal"
                  description="All core system metrics are within their recommended operational ranges."
                />
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6">
            <h4 className="mb-6 text-foreground">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Platform</span>
                  <span className="text-sm font-[var(--font-weight-medium)] text-foreground">Supabase Edge Functions</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Runtime</span>
                  <span className="text-sm font-[var(--font-weight-medium)] text-foreground">Deno</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Region</span>
                  <span className="text-sm font-[var(--font-weight-medium)] text-foreground">Asia-Pacific (Mumbai)</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-[var(--font-weight-medium)] text-foreground">99.9%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Last Restart</span>
                  <span className="text-sm font-[var(--font-weight-medium)] text-foreground">2 days ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-[var(--font-weight-medium)] text-foreground">1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}