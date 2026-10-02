import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ArrowUpRight,
  Box,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  FileCode2,
  FileDigit,
  Fuel,
  Hash,
  Link2,
  Loader2,
  Plug,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Upload,
  Wallet,
  XCircle,
  Zap,
  AlertTriangle,
  Eye,
  Ban,
  Anchor as AnchorIcon,
  Image as ImageIcon,
  FileText,
  Shrink,
} from 'lucide-react';
import {
  getNetworkStatus,
  getTransaction,
  getBlock,
  getBalance,
  sha256Hash,
  sha256File,
  etherscanTxUrl,
  etherscanBlockUrl,
  etherscanAddressUrl,
  type NetworkStatus,
  type TransactionInfo,
  type BlockInfo,
} from '../../lib/blockchain';
import {
  connectWallet,
  getWalletState,
  isWalletAvailable,
  onAccountsChanged,
  onChainChanged,
  switchToMainnet,
  type WalletState,
} from '../../lib/wallet';
import {
  getContractAddress,
  setContractAddress,
  clearContractAddress,
  validateContract,
  verifyHash,
  anchorHash,
  revokeHash,
  getAnchorCount,
  getContractOwner,
  DOCWEB_ANCHOR_SOURCE,
  hashToBytes32,
  type AnchorRecord,
  type TxResult,
} from '../../lib/contract';
import {
  optimizeFile,
  formatFileSize,
  isImageFile,
  type OptimizedFile,
} from '../../lib/fileOptimizer';

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function truncAddr(hash: string, chars = 6): string {
  if (!hash || hash.length < chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function fmtDate(date: Date | undefined | null): string {
  if (!date) return '—';
  return date.toLocaleString();
}

// ────────────────────────────────────────────
// Shared sub-components
// ────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] p-5 border ${className}`}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub: string }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] p-4 space-y-1.5 border"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--foreground)' }}>{value}</p>
      {sub && <span style={{ color: 'var(--muted-foreground)' }}>{sub}</span>}
    </div>
  );
}

function DetailRow({ label, value, copyable }: { label: string; value: string; copyable?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!copyable) return;
    copyToClipboard(copyable);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <span style={{ fontFamily: "'Cousine', monospace", fontSize: '12px', color: 'var(--foreground)' }}>{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="p-0.5 rounded-[var(--radius-sm)] hover:bg-secondary transition-colors" title="Copy">
            {copied ? <CheckCircle2 size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} style={{ color: 'var(--muted-foreground)' }} />}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: 'success' | 'failed' | 'pending' }) {
  const cfg = {
    success: { bg: 'var(--success-light)', color: 'var(--success)', label: 'Success' },
    failed: { bg: 'var(--destructive-light)', color: 'var(--destructive)', label: 'Failed' },
    pending: { bg: 'var(--warning-light)', color: 'var(--warning)', label: 'Pending' },
  };
  const c = cfg[status];
  return <span className="px-2 py-0.5 rounded-[var(--radius-full)]" style={{ backgroundColor: c.bg, color: c.color }}>{c.label}</span>;
}

function HashResult({ label, hash }: { label: string; hash: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { copyToClipboard(hash); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div
      className="p-3 rounded-[var(--radius-md)] flex items-center justify-between gap-2"
      style={{ backgroundColor: 'var(--muted)' }}
    >
      <div className="flex-1 overflow-hidden">
        <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
        <p className="break-all mt-0.5" style={{ fontFamily: "'Cousine', monospace", fontSize: '12px', color: 'var(--foreground)' }}>{hash}</p>
      </div>
      <button onClick={handleCopy} className="p-2 rounded-[var(--radius-sm)] hover:bg-card transition-colors flex-shrink-0" title="Copy hash">
        {copied ? <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} style={{ color: 'var(--muted-foreground)' }} />}
      </button>
    </div>
  );
}

function Banner({ type, children }: { type: 'error' | 'warning' | 'info' | 'success'; children: React.ReactNode }) {
  const cfg = {
    error: { bg: 'var(--destructive-light)', color: 'var(--destructive)', Icon: XCircle },
    warning: { bg: 'var(--warning-light)', color: 'var(--warning)', Icon: AlertTriangle },
    info: { bg: 'var(--info-light)', color: 'var(--info)', Icon: Shield },
    success: { bg: 'var(--success-light)', color: 'var(--success)', Icon: CheckCircle2 },
  };
  const c = cfg[type];
  return (
    <div className="p-3 rounded-[var(--radius-md)] flex items-start gap-2" style={{ backgroundColor: c.bg, color: c.color }}>
      <c.Icon size={16} className="flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function PrimaryButton({ onClick, disabled, loading, children }: { onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-[var(--radius-md)] transition-colors flex items-center gap-2"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && children}
      {loading && <span>Processing...</span>}
    </button>
  );
}

function EtherscanLink({ href, label }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 transition-colors hover:opacity-80"
      style={{ color: 'var(--muted-foreground)' }}
    >
      <span>{label || 'Etherscan'}</span>
      <ArrowUpRight size={14} />
    </a>
  );
}

// ────────────────────────────────────────────
// Tab type
// ────────────────────────────────────────────

type PanelTab = 'overview' | 'explorer' | 'wallet' | 'anchoring';

const TAB_CONFIG: { id: PanelTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Network', icon: Activity },
  { id: 'explorer', label: 'Explorer', icon: Search },
  { id: 'wallet', label: 'Wallet & Contract', icon: Wallet },
  { id: 'anchoring', label: 'Anchoring', icon: AnchorIcon },
];

// ════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════

export function BlockchainPanel() {
  const [activeTab, setActiveTab] = useState<PanelTab>('overview');

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}
        >
          <Link2 className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
        </div>
        <div>
          <h2 style={{ color: 'var(--foreground)' }}>Blockchain</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Ethereum Mainnet — network monitoring, wallet connection, smart contract management, and on-chain hash anchoring
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-[var(--radius-lg)]"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-[var(--radius-md)] transition-colors flex-1 flex items-center justify-center gap-2"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <NetworkOverview />}
      {activeTab === 'explorer' && <TransactionExplorer />}
      {activeTab === 'wallet' && <WalletAndContract />}
      {activeTab === 'anchoring' && <AnchoringTab />}
    </div>
  );
}

// ════════════════════════════════════════════
// NETWORK OVERVIEW TAB
// ════════════════════════════════════════════

function NetworkOverview() {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const [latestBlock, setLatestBlock] = useState<BlockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [netStatus, block] = await Promise.all([
        getNetworkStatus(),
        getBlock('latest'),
      ]);
      setStatus(netStatus);
      setLatestBlock(block);
    } catch {
      // captured in status
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-[var(--radius-full)]"
              style={{ backgroundColor: status?.connected ? 'var(--success)' : 'var(--destructive)' }}
            />
            <span style={{ color: status?.connected ? 'var(--success)' : 'var(--destructive)' }}>
              {status?.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {status?.latencyMs ? <span style={{ color: 'var(--muted-foreground)' }}>{status.latencyMs}ms</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span style={{ color: 'var(--muted-foreground)' }}>Auto-refresh</span>
          </label>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-[var(--radius-md)] transition-colors hover:bg-muted"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      {status?.error && (
        <Banner type="error">{status.error}</Banner>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard icon={Server} label="Network" value={status?.networkName || '—'} sub={status ? `Chain ID: ${status.chainId}` : ''} />
        <KPICard icon={Box} label="Latest Block" value={status ? fmtNum(status.latestBlock) : '—'} sub={latestBlock ? `${latestBlock.transactionCount} txns` : ''} />
        <KPICard icon={Fuel} label="Gas Price" value={status ? `${status.gasPrice} Gwei` : '—'} sub={status ? `Base: ${status.baseFee} Gwei` : ''} />
        <KPICard icon={Zap} label="Latency" value={status ? `${status.latencyMs}ms` : '—'} sub="Alchemy RPC" />
      </div>

      {/* Block details */}
      {latestBlock && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 style={{ color: 'var(--foreground)' }}>Latest Block Details</h4>
            <EtherscanLink href={etherscanBlockUrl(latestBlock.number)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow label="Block" value={fmtNum(latestBlock.number)} />
            <DetailRow label="Timestamp" value={fmtDate(latestBlock.timestamp)} />
            <DetailRow label="Hash" value={truncAddr(latestBlock.hash)} copyable={latestBlock.hash} />
            <DetailRow label="Parent Hash" value={truncAddr(latestBlock.parentHash)} copyable={latestBlock.parentHash} />
            <DetailRow label="Gas Used" value={`${fmtNum(latestBlock.gasUsed)} / ${fmtNum(latestBlock.gasLimit)}`} />
            <DetailRow label="Base Fee" value={`${latestBlock.baseFeePerGas} Gwei`} />
            <DetailRow label="Transactions" value={String(latestBlock.transactionCount)} />
            <DetailRow label="Miner" value={truncAddr(latestBlock.miner)} copyable={latestBlock.miner} />
          </div>
        </Card>
      )}

      {/* Connection info */}
      <Card className="space-y-2">
        <h4 style={{ color: 'var(--foreground)' }}>Connection Configuration</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow label="Provider" value="Alchemy" />
          <DetailRow label="Network" value="Ethereum Mainnet" />
          <DetailRow label="Endpoint" value="eth-mainnet.g.alchemy.com/v2/****" />
          <DetailRow label="Protocol" value="JSON-RPC 2.0" />
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════
// TRANSACTION EXPLORER TAB
// ════════════════════════════════════════════

function TransactionExplorer() {
  const [query, setQuery] = useState('');
  const [txInfo, setTxInfo] = useState<TransactionInfo | null>(null);
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
  const [balanceResult, setBalanceResult] = useState<{ address: string; balance: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'auto' | 'tx' | 'block' | 'address'>('auto');

  const detect = (q: string) => {
    const t = q.trim();
    if (/^0x[a-fA-F0-9]{64}$/.test(t)) return 'tx';
    if (/^\d+$/.test(t)) return 'block';
    if (/^0x[a-fA-F0-9]{40}$/.test(t)) return 'address';
    return 'unknown';
  };

  const handleSearch = async () => {
    const t = query.trim();
    if (!t) return;
    setLoading(true); setError(null); setTxInfo(null); setBlockInfo(null); setBalanceResult(null);
    try {
      const type = searchType === 'auto' ? detect(t) : searchType;
      switch (type) {
        case 'tx': { const r = await getTransaction(t); if (!r) throw new Error('Transaction not found'); setTxInfo(r); break; }
        case 'block': { const r = await getBlock(parseInt(t)); if (!r) throw new Error('Block not found'); setBlockInfo(r); break; }
        case 'address': { const b = await getBalance(t); setBalanceResult({ address: t, balance: b }); break; }
        default: throw new Error('Cannot detect type. Enter a tx hash, block number, or address.');
      }
    } catch (err: any) { setError(err?.message || 'Lookup failed'); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h4 style={{ color: 'var(--foreground)' }}>Look Up</h4>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Transaction hash, block number, or address..."
              className="w-full pl-10 pr-3 py-2.5 rounded-[var(--radius-md)] border outline-none"
              style={inputStyle}
            />
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-3 py-2.5 rounded-[var(--radius-md)] border outline-none"
            style={inputStyle}
          >
            <option value="auto">Auto-detect</option>
            <option value="tx">Transaction</option>
            <option value="block">Block</option>
            <option value="address">Address</option>
          </select>
          <PrimaryButton onClick={handleSearch} disabled={loading || !query.trim()} loading={loading}>
            <Search size={16} />
            Search
          </PrimaryButton>
        </div>
      </Card>

      {error && <Banner type="error">{error}</Banner>}

      {txInfo && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash size={16} style={{ color: 'var(--muted-foreground)' }} />
              <h4 style={{ color: 'var(--foreground)' }}>Transaction Details</h4>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={txInfo.status} />
              <EtherscanLink href={etherscanTxUrl(txInfo.hash)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow label="Tx Hash" value={truncAddr(txInfo.hash)} copyable={txInfo.hash} />
            <DetailRow label="Status" value={txInfo.status} />
            <DetailRow label="Block" value={fmtNum(txInfo.blockNumber)} />
            <DetailRow label="Timestamp" value={fmtDate(txInfo.timestamp)} />
            <DetailRow label="From" value={truncAddr(txInfo.from)} copyable={txInfo.from} />
            <DetailRow label="To" value={txInfo.to ? truncAddr(txInfo.to) : 'Contract Creation'} copyable={txInfo.to || undefined} />
            <DetailRow label="Value" value={`${txInfo.value} ETH`} />
            <DetailRow label="Gas Price" value={`${txInfo.gasPrice} Gwei`} />
            <DetailRow label="Gas Used" value={fmtNum(txInfo.gasUsed)} />
            <DetailRow label="Nonce" value={String(txInfo.nonce)} />
            {txInfo.contractAddress && <DetailRow label="Contract Created" value={truncAddr(txInfo.contractAddress)} copyable={txInfo.contractAddress} />}
          </div>
          {txInfo.input && txInfo.input !== '0x' && (
            <div className="space-y-1">
              <label style={{ color: 'var(--muted-foreground)' }}>Input Data</label>
              <div className="p-2 rounded-[var(--radius-md)] overflow-x-auto" style={{ backgroundColor: 'var(--muted)' }}>
                <code className="break-all">{truncAddr(txInfo.input, 32)}</code>
              </div>
            </div>
          )}
        </Card>
      )}

      {blockInfo && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box size={16} style={{ color: 'var(--muted-foreground)' }} />
              <h4 style={{ color: 'var(--foreground)' }}>Block #{fmtNum(blockInfo.number)}</h4>
            </div>
            <EtherscanLink href={etherscanBlockUrl(blockInfo.number)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow label="Block" value={fmtNum(blockInfo.number)} />
            <DetailRow label="Timestamp" value={fmtDate(blockInfo.timestamp)} />
            <DetailRow label="Hash" value={truncAddr(blockInfo.hash)} copyable={blockInfo.hash} />
            <DetailRow label="Parent Hash" value={truncAddr(blockInfo.parentHash)} copyable={blockInfo.parentHash} />
            <DetailRow label="Transactions" value={String(blockInfo.transactionCount)} />
            <DetailRow label="Gas" value={`${fmtNum(blockInfo.gasUsed)} / ${fmtNum(blockInfo.gasLimit)}`} />
            <DetailRow label="Base Fee" value={`${blockInfo.baseFeePerGas} Gwei`} />
            <DetailRow label="Miner" value={truncAddr(blockInfo.miner)} copyable={blockInfo.miner} />
          </div>
        </Card>
      )}

      {balanceResult && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Activity size={16} style={{ color: 'var(--muted-foreground)' }} /><h4 style={{ color: 'var(--foreground)' }}>Address Balance</h4></div>
            <EtherscanLink href={etherscanAddressUrl(balanceResult.address)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow label="Address" value={truncAddr(balanceResult.address)} copyable={balanceResult.address} />
            <DetailRow label="Balance" value={`${balanceResult.balance} ETH`} />
          </div>
        </Card>
      )}

      {!loading && !error && !txInfo && !blockInfo && !balanceResult && (
        <Card className="flex flex-col items-center gap-3 py-8">
          <Search size={32} style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', textAlign: 'center' }}>
            Enter a transaction hash, block number, or Ethereum address to explore on-chain data.
          </p>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// WALLET & CONTRACT TAB
// ════════════════════════════════════════════

function WalletAndContract() {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: null, chainId: null, balance: null });
  const [connecting, setConnecting] = useState(false);
  const [contractAddr, setContractAddr] = useState(getContractAddress() || '');
  const [contractValid, setContractValid] = useState<null | { valid: boolean; owner?: string; anchorCount?: number; error?: string }>(null);
  const [validating, setValidating] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [sourceCopied, setSourceCopied] = useState(false);

  // Check wallet on mount
  useEffect(() => {
    getWalletState().then(setWallet);
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    const unsub1 = onAccountsChanged(() => getWalletState().then(setWallet));
    const unsub2 = onChainChanged(() => getWalletState().then(setWallet));
    return () => { unsub1(); unsub2(); };
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    const state = await connectWallet();
    setWallet(state);
    setConnecting(false);
  };

  const handleSwitchNetwork = async () => {
    await switchToMainnet();
    const state = await getWalletState();
    setWallet(state);
  };

  const handleValidateContract = async () => {
    if (!contractAddr.trim()) return;
    setValidating(true);
    setContractValid(null);
    const result = await validateContract(contractAddr.trim());
    setContractValid(result);
    if (result.valid) {
      setContractAddress(contractAddr.trim());
    }
    setValidating(false);
  };

  const handleClearContract = () => {
    clearContractAddress();
    setContractAddr('');
    setContractValid(null);
  };

  const handleCopySource = () => {
    copyToClipboard(DOCWEB_ANCHOR_SOURCE);
    setSourceCopied(true);
    setTimeout(() => setSourceCopied(false), 2000);
  };

  const walletAvail = isWalletAvailable();
  const isMainnet = wallet.chainId === 1;
  const savedAddr = getContractAddress();

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <div className="space-y-4">
      {/* ── WALLET ── */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet size={16} style={{ color: 'var(--muted-foreground)' }} />
          <h4 style={{ color: 'var(--foreground)' }}>Wallet Connection</h4>
        </div>

        {!walletAvail ? (
          <Banner type="warning">
            No EIP-1193 wallet detected (MetaMask, Coinbase Wallet, etc.).
            Install a browser wallet extension to interact with Ethereum.
          </Banner>
        ) : !wallet.connected ? (
          <div className="space-y-3">
            <p style={{ color: 'var(--muted-foreground)' }}>
              Connect your wallet to deploy contracts and anchor document hashes on Ethereum.
            </p>
            <PrimaryButton onClick={handleConnect} loading={connecting} disabled={connecting}>
              <Plug size={16} />
              Connect Wallet
            </PrimaryButton>
            {wallet.error && <Banner type="error">{wallet.error}</Banner>}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Connected state */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-[var(--radius-full)]" style={{ backgroundColor: 'var(--success)' }} />
              <span style={{ color: 'var(--success)' }}>Connected</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <DetailRow label="Address" value={truncAddr(wallet.address || '')} copyable={wallet.address || undefined} />
              <DetailRow label="Balance" value={`${wallet.balance} ETH`} />
              <DetailRow label="Chain ID" value={String(wallet.chainId)} />
              <DetailRow label="Network" value={isMainnet ? 'Ethereum Mainnet' : `Chain ${wallet.chainId}`} />
            </div>

            {!isMainnet && (
              <div className="flex items-center gap-3 flex-wrap">
                <Banner type="warning">
                  You are not on Ethereum Mainnet. Switch to Chain ID 1 to interact with DocWeb contracts.
                </Banner>
                <button
                  onClick={handleSwitchNetwork}
                  className="px-3 py-1.5 rounded-[var(--radius-md)] whitespace-nowrap"
                  style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}
                >
                  Switch to Mainnet
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── CONTRACT SETUP ── */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 size={16} style={{ color: 'var(--muted-foreground)' }} />
            <h4 style={{ color: 'var(--foreground)' }}>DocWebAnchor Contract</h4>
          </div>
          {savedAddr && (
            <button
              onClick={handleClearContract}
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--destructive)' }}
            >
              Disconnect
            </button>
          )}
        </div>

        {savedAddr && contractValid?.valid ? (
          /* Connected contract info */
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
              <span style={{ color: 'var(--success)' }}>Contract verified</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DetailRow label="Contract Address" value={truncAddr(savedAddr)} copyable={savedAddr} />
              <DetailRow label="Owner" value={truncAddr(contractValid.owner || '')} copyable={contractValid.owner} />
              <DetailRow label="Anchored Hashes" value={fmtNum(contractValid.anchorCount || 0)} />
            </div>
            <EtherscanLink href={etherscanAddressUrl(savedAddr)} label="View contract on Etherscan" />
          </div>
        ) : (
          /* Setup form */
          <div className="space-y-3">
            <p style={{ color: 'var(--muted-foreground)' }}>
              Enter an existing DocWebAnchor contract address, or deploy a new one using the Solidity source below.
            </p>

            <div className="flex gap-2 flex-wrap">
              <input
                value={contractAddr}
                onChange={(e) => setContractAddr(e.target.value)}
                placeholder="0x... contract address"
                className="flex-1 min-w-[280px] px-3 py-2.5 rounded-[var(--radius-md)] border outline-none"
                style={{
                  ...inputStyle,
                  fontFamily: "'Cousine', monospace",
                  fontSize: '12px',
                }}
              />
              <PrimaryButton
                onClick={handleValidateContract}
                disabled={validating || !contractAddr.trim() || !wallet.connected}
                loading={validating}
              >
                <ShieldCheck size={16} />
                Validate & Connect
              </PrimaryButton>
            </div>

            {!wallet.connected && (
              <p style={{ color: 'var(--muted-foreground)' }}>
                Connect your wallet first to validate and interact with a contract.
              </p>
            )}

            {contractValid && !contractValid.valid && (
              <Banner type="error">{contractValid.error}</Banner>
            )}
          </div>
        )}
      </Card>

      {/* ── DEPLOY INSTRUCTIONS ── */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AnchorIcon size={16} style={{ color: 'var(--muted-foreground)' }} />
            <h4 style={{ color: 'var(--foreground)' }}>Deploy New Contract</h4>
          </div>
          <button
            onClick={() => setShowSource(!showSource)}
            className="transition-colors hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {showSource ? 'Hide Source' : 'Show Solidity Source'}
          </button>
        </div>

        <div className="space-y-2">
          <p style={{ color: 'var(--muted-foreground)' }}>
            To deploy DocWebAnchor on Ethereum Mainnet:
          </p>
          <ol className="space-y-1.5 ml-4">
            {[
              'Copy the Solidity source code below',
              'Open Remix IDE (remix.ethereum.org)',
              'Create a new file DocWebAnchor.sol and paste the source',
              'Compile with Solidity 0.8.19+, optimizer 200 runs',
              'Deploy using "Injected Provider" (MetaMask) on Ethereum Mainnet',
              'Copy the deployed contract address and paste it above',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="w-5 h-5 rounded-[var(--radius-full)] flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                >
                  {i + 1}
                </span>
                <span style={{ color: 'var(--muted-foreground)' }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {showSource && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label style={{ color: 'var(--muted-foreground)' }}>DocWebAnchor.sol</label>
              <button
                onClick={handleCopySource}
                className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-md)] hover:bg-muted transition-colors"
              >
                {sourceCopied ? (
                  <><CheckCircle2 size={12} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--success)' }}>Copied</span></>
                ) : (
                  <><Copy size={12} style={{ color: 'var(--muted-foreground)' }} /><span style={{ color: 'var(--muted-foreground)' }}>Copy</span></>
                )}
              </button>
            </div>
            <div
              className="p-4 rounded-[var(--radius-md)] overflow-x-auto max-h-[400px] overflow-y-auto"
              style={{ backgroundColor: 'var(--neutral-9)' }}
            >
              <pre style={{ fontFamily: "'Cousine', monospace", fontSize: '12px', color: 'var(--neutral-3)', whiteSpace: 'pre-wrap' }}>
                {DOCWEB_ANCHOR_SOURCE}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════
// ANCHORING TAB
// ════════════════════════════════════════════

function AnchoringTab() {
  const savedContract = getContractAddress();

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {savedContract ? (
        <Banner type="success">
          Contract connected at {truncAddr(savedContract)}. On-chain anchoring and verification are active.
        </Banner>
      ) : (
        <Banner type="info">
          No contract connected. You can still generate SHA-256 hashes locally.
          Go to Wallet & Contract tab to connect a DocWebAnchor contract for on-chain operations.
        </Banner>
      )}

      {/* Pipeline */}
      <AnchoringPipeline hasContract={!!savedContract} />

      {/* Hash generator */}
      <HashGenerator />

      {/* On-chain anchor */}
      {savedContract && <OnChainAnchor contractAddress={savedContract} />}

      {/* On-chain verify */}
      {savedContract && <OnChainVerify contractAddress={savedContract} />}

      {/* On-chain revoke */}
      {savedContract && <OnChainRevoke contractAddress={savedContract} />}
    </div>
  );
}

// ── Pipeline visualization ──

function AnchoringPipeline({ hasContract }: { hasContract: boolean }) {
  const steps = [
    { step: 1, label: 'Hash Document', desc: 'SHA-256 via Web Crypto', done: true },
    { step: 2, label: 'Sign Hash', desc: 'ECDSA wallet signature', done: true },
    { step: 3, label: 'Submit to Chain', desc: 'Ethereum Tx', done: hasContract },
    { step: 4, label: 'Confirm Block', desc: '~12s finality', done: hasContract },
  ];

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 size={16} style={{ color: 'var(--muted-foreground)' }} />
        <h4 style={{ color: 'var(--foreground)' }}>Anchoring Pipeline</h4>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {steps.map((s, i) => (
          <div key={s.step} className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-[var(--radius-full)] flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: s.done ? 'var(--success-light)' : 'var(--muted)',
                  color: s.done ? 'var(--success)' : 'var(--muted-foreground)',
                }}
              >
                {s.done ? <CheckCircle2 size={16} /> : <span>{s.step}</span>}
              </div>
              <div>
                <p style={{ color: s.done ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{s.label}</p>
                <small style={{ color: 'var(--muted-foreground)' }}>{s.desc}</small>
              </div>
            </div>
            {i < 3 && (
              <ChevronRight size={16} className="hidden sm:block mx-2" style={{ color: 'var(--muted-foreground)' }} />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Hash Generator (local) with file optimization ──

function HashGenerator() {
  const [textInput, setTextInput] = useState('');
  const [textHash, setTextHash] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<{
    name: string;
    hash: string;
    originalSize: string;
    optimizedSize: string;
    isImage: boolean;
    compressionRatio: number;
    dimensions?: { width: number; height: number };
    preview?: string;
  } | null>(null);
  const [hashing, setHashing] = useState(false);

  const handleTextHash = async () => {
    if (!textInput.trim()) return;
    setHashing(true);
    const hash = await sha256Hash(textInput);
    setTextHash(hash);
    setHashing(false);
  };

  const handleFileHash = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHashing(true);

    // Optimize the file first (compress images, extract metadata)
    const optimized = await optimizeFile(file);
    const info = optimized.info;

    // Always hash the ORIGINAL file for integrity (not the compressed version)
    const hash = await sha256File(file);

    setFileHash({
      name: info.name,
      hash,
      originalSize: formatFileSize(info.originalSize),
      optimizedSize: formatFileSize(info.optimizedSize),
      isImage: info.isImage,
      compressionRatio: info.compressionRatio,
      dimensions: info.dimensions,
      preview: optimized.dataUrl,
    });
    setHashing(false);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <FileDigit size={16} style={{ color: 'var(--muted-foreground)' }} />
        <h4 style={{ color: 'var(--foreground)' }}>SHA-256 Hash Generator</h4>
      </div>

      {/* Text input */}
      <div className="space-y-2">
        <label style={{ color: 'var(--muted-foreground)' }}>Text / JSON Input</label>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={'{"credential_id": "CERT-001", "subject": "Acme Corp", "issued_at": "2024-12-01"}'}
          rows={3}
          className="w-full p-3 rounded-[var(--radius-md)] border resize-y outline-none"
          style={{ ...inputStyle, fontFamily: "'Cousine', monospace", fontSize: '12px' }}
        />
        <PrimaryButton onClick={handleTextHash} disabled={hashing || !textInput.trim()} loading={hashing}>
          <Hash size={16} />
          Generate Hash
        </PrimaryButton>
        {textHash && <HashResult label="SHA-256 Hash" hash={textHash} />}
      </div>

      {/* File input */}
      <div className="space-y-2">
        <label style={{ color: 'var(--muted-foreground)' }}>File Hash</label>
        <label
          className="flex flex-col items-center justify-center p-5 rounded-[var(--radius-md)] border-2 border-dashed cursor-pointer transition-colors"
          style={{ borderColor: 'var(--border)' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--muted-foreground)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <Upload size={20} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)' }} className="mt-1">Click to select a file — images auto-compressed, all processed locally</span>
          <input type="file" className="hidden" onChange={handleFileHash} />
        </label>

        {hashing && (
          <div className="flex items-center gap-2 py-2" style={{ color: 'var(--muted-foreground)' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Processing and hashing file...</span>
          </div>
        )}

        {fileHash && (
          <div className="space-y-3">
            {/* File info card */}
            <div
              className="p-4 rounded-[var(--radius-md)] space-y-3"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <div className="flex items-start gap-3">
                {/* Preview or icon */}
                {fileHash.preview ? (
                  <img
                    src={fileHash.preview}
                    alt="Preview"
                    className="w-12 h-12 rounded-[var(--radius-md)] object-cover flex-shrink-0"
                    style={{ border: '1px solid var(--border)' }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--secondary)' }}
                  >
                    <FileText size={20} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties} className="truncate">
                    {fileHash.name}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      Original: {fileHash.originalSize}
                    </span>

                    {fileHash.compressionRatio < 0.95 && (
                      <>
                        <span style={{ color: 'var(--muted-foreground)' }}>&rarr;</span>
                        <span style={{ color: 'var(--success)' }}>
                          <Shrink size={12} className="inline mr-1" />
                          Optimized: {fileHash.optimizedSize} ({Math.round((1 - fileHash.compressionRatio) * 100)}% saved)
                        </span>
                      </>
                    )}

                    {fileHash.dimensions && (
                      <span style={{ color: 'var(--muted-foreground)' }}>
                        {fileHash.dimensions.width} x {fileHash.dimensions.height}px
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <HashResult label="SHA-256 Hash (of original file)" hash={fileHash.hash} />

            {fileHash.isImage && fileHash.compressionRatio < 0.95 && (
              <div
                className="p-3 rounded-[var(--radius-md)] flex items-start gap-2"
                style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}
              >
                <ImageIcon size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  Hash is computed from the original file for integrity. The optimized version ({fileHash.optimizedSize}) is available for storage/display.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── On-Chain Anchor (write) ──

function OnChainAnchor({ contractAddress }: { contractAddress: string }) {
  const [docHash, setDocHash] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnchor = async () => {
    if (!docHash.trim()) return;
    setSubmitting(true);
    setResult(null);
    setError(null);
    try {
      const tx = await anchorHash(docHash.trim(), metadataURI.trim(), contractAddress);
      setResult(tx);
    } catch (err: any) {
      setError(err?.message || 'Anchoring failed');
    }
    setSubmitting(false);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <AnchorIcon size={16} style={{ color: 'var(--muted-foreground)' }} />
        <h4 style={{ color: 'var(--foreground)' }}>Anchor Hash On-Chain</h4>
      </div>
      <p style={{ color: 'var(--muted-foreground)' }}>
        Submit a SHA-256 hash to the DocWebAnchor contract. This creates an immutable, timestamped record on Ethereum.
      </p>

      <div className="space-y-2">
        <label style={{ color: 'var(--muted-foreground)' }}>Document Hash (bytes32)</label>
        <input
          value={docHash}
          onChange={(e) => setDocHash(e.target.value)}
          placeholder="0x... (SHA-256 hash from generator above)"
          className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border outline-none"
          style={{ ...inputStyle, fontFamily: "'Cousine', monospace", fontSize: '12px' }}
        />
      </div>

      <div className="space-y-2">
        <label style={{ color: 'var(--muted-foreground)' }}>Metadata URI (optional)</label>
        <input
          value={metadataURI}
          onChange={(e) => setMetadataURI(e.target.value)}
          placeholder="ipfs://... or https://... (credential metadata)"
          className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border outline-none"
          style={inputStyle}
        />
      </div>

      <PrimaryButton onClick={handleAnchor} disabled={submitting || !docHash.trim()} loading={submitting}>
        <AnchorIcon size={16} />
        {submitting ? 'Submitting Transaction...' : 'Anchor On-Chain'}
      </PrimaryButton>

      {error && <Banner type="error">{error}</Banner>}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {result.status === 'confirmed' ? (
              <><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--success)' }}>Anchored successfully</span></>
            ) : result.status === 'failed' ? (
              <><XCircle size={16} style={{ color: 'var(--destructive)' }} /><span style={{ color: 'var(--destructive)' }}>Transaction failed</span></>
            ) : (
              <><Loader2 size={16} className="animate-spin" style={{ color: 'var(--warning)' }} /><span style={{ color: 'var(--warning)' }}>Pending confirmation...</span></>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow label="Tx Hash" value={truncAddr(result.hash)} copyable={result.hash} />
            {result.blockNumber && <DetailRow label="Block" value={fmtNum(result.blockNumber)} />}
            {result.gasUsed && <DetailRow label="Gas Used" value={result.gasUsed} />}
          </div>
          <EtherscanLink href={etherscanTxUrl(result.hash)} label="View transaction on Etherscan" />
        </div>
      )}
    </Card>
  );
}

// ── On-Chain Verify (read) ──

function OnChainVerify({ contractAddress }: { contractAddress: string }) {
  const [docHash, setDocHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<AnchorRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!docHash.trim()) return;
    setLoading(true);
    setRecord(null);
    setError(null);
    try {
      const r = await verifyHash(docHash.trim(), contractAddress);
      setRecord(r);
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Eye size={16} style={{ color: 'var(--muted-foreground)' }} />
        <h4 style={{ color: 'var(--foreground)' }}>Verify Hash On-Chain</h4>
      </div>
      <p style={{ color: 'var(--muted-foreground)' }}>
        Check whether a document hash has been anchored and view its on-chain record.
      </p>

      <div className="flex gap-2 flex-wrap">
        <input
          value={docHash}
          onChange={(e) => setDocHash(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="0x... (SHA-256 hash to verify)"
          className="flex-1 min-w-[280px] px-3 py-2.5 rounded-[var(--radius-md)] border outline-none"
          style={{ ...inputStyle, fontFamily: "'Cousine', monospace", fontSize: '12px' }}
        />
        <PrimaryButton onClick={handleVerify} disabled={loading || !docHash.trim()} loading={loading}>
          <ShieldCheck size={16} />
          Verify
        </PrimaryButton>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      {record && (
        <div className="space-y-3">
          {record.exists ? (
            <>
              <div className="flex items-center gap-2">
                {record.isRevoked ? (
                  <><Ban size={16} style={{ color: 'var(--destructive)' }} /><span style={{ color: 'var(--destructive)' }}>Hash anchored but REVOKED</span></>
                ) : (
                  <><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--success)' }}>Hash anchored and VALID</span></>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Issuer" value={truncAddr(record.issuer)} copyable={record.issuer} />
                <DetailRow label="Anchored At" value={fmtDate(record.issuedAt)} />
                <DetailRow label="Revoked At" value={fmtDate(record.revokedAt)} />
                {record.metadataURI && <DetailRow label="Metadata URI" value={record.metadataURI} copyable={record.metadataURI} />}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
              <span style={{ color: 'var(--warning)' }}>Hash not found on-chain. It has not been anchored.</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── On-Chain Revoke (write) ──

function OnChainRevoke({ contractAddress }: { contractAddress: string }) {
  const [docHash, setDocHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRevoke = async () => {
    if (!docHash.trim()) return;
    setSubmitting(true);
    setResult(null);
    setError(null);
    try {
      const tx = await revokeHash(docHash.trim(), contractAddress);
      setResult(tx);
    } catch (err: any) {
      setError(err?.message || 'Revocation failed');
    }
    setSubmitting(false);
    setConfirmOpen(false);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--input-background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Ban size={16} style={{ color: 'var(--destructive)' }} />
        <h4 style={{ color: 'var(--destructive)' }}>Revoke Anchored Hash</h4>
      </div>
      <p style={{ color: 'var(--muted-foreground)' }}>
        Mark a previously anchored hash as revoked. This is irreversible on-chain. Only the original issuer or contract owner can revoke.
      </p>

      <div className="flex gap-2 flex-wrap">
        <input
          value={docHash}
          onChange={(e) => setDocHash(e.target.value)}
          placeholder="0x... (SHA-256 hash to revoke)"
          className="flex-1 min-w-[280px] px-3 py-2.5 rounded-[var(--radius-md)] border outline-none"
          style={{ ...inputStyle, fontFamily: "'Cousine', monospace", fontSize: '12px' }}
        />
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={submitting || !docHash.trim()}
          className="px-4 py-2.5 rounded-[var(--radius-md)] transition-colors flex items-center gap-2"
          style={{
            backgroundColor: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
            opacity: submitting || !docHash.trim() ? 0.5 : 1,
          }}
        >
          <Ban size={16} />
          Revoke
        </button>
      </div>

      {/* Confirmation */}
      {confirmOpen && (
        <div
          className="p-4 rounded-[var(--radius-md)] space-y-3"
          style={{ backgroundColor: 'var(--destructive-light)', border: '1px solid var(--destructive)' }}
        >
          <p style={{ color: 'var(--destructive)' }}>
            Are you sure you want to revoke this hash? This action is permanent on Ethereum and cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRevoke}
              disabled={submitting}
              className="px-4 py-2.5 rounded-[var(--radius-md)] flex items-center gap-2"
              style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
              Confirm Revocation
            </button>
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2.5 rounded-[var(--radius-md)]"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <Banner type="error">{error}</Banner>}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {result.status === 'confirmed' ? (
              <><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--foreground)' }}>Hash revoked successfully</span></>
            ) : (
              <><XCircle size={16} style={{ color: 'var(--destructive)' }} /><span style={{ color: 'var(--destructive)' }}>Revocation transaction failed</span></>
            )}
          </div>
          <DetailRow label="Tx Hash" value={truncAddr(result.hash)} copyable={result.hash} />
          <EtherscanLink href={etherscanTxUrl(result.hash)} label="View on Etherscan" />
        </div>
      )}
    </Card>
  );
}
