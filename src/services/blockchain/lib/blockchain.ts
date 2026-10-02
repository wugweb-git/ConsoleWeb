// TODO: replace with blockchain service API (engine stays in DocWeb)
// ============================================================================
// DocWeb — Ethereum Blockchain Service (Alchemy JSON-RPC)
// ============================================================================
// Read-only Ethereum Mainnet integration via Alchemy.
// Uses raw JSON-RPC fetch calls — no heavy dependencies.
//
// Production: Move API key to environment variables / secrets manager.
// ============================================================================

// Set VITE_ALCHEMY_ENDPOINT in .env.local (never commit it).
const ALCHEMY_ENDPOINT: string = import.meta.env.VITE_ALCHEMY_ENDPOINT ?? '';

export { ALCHEMY_ENDPOINT };
// ────────────────────────────────────────────
// JSON-RPC helper
// ────────────────────────────────────────────

let _rpcId = 1;

async function rpc<T = any>(method: string, params: any[] = []): Promise<T> {
  const res = await fetch(ALCHEMY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: _rpcId++,
      method,
      params,
    }),
  });

  if (!res.ok) {
    throw new Error(`Alchemy HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`RPC Error ${json.error.code}: ${json.error.message}`);
  }
  return json.result as T;
}

// ────────────────────────────────────────────
// Hex helpers
// ────────────────────────────────────────────

export function hexToNumber(hex: string | null | undefined): number {
  if (!hex) return 0;
  return parseInt(hex, 16);
}

export function hexToBigInt(hex: string | null | undefined): bigint {
  if (!hex) return 0n;
  return BigInt(hex);
}

export function weiToEth(weiHex: string | null | undefined): string {
  if (!weiHex) return '0';
  const wei = BigInt(weiHex);
  const eth = Number(wei) / 1e18;
  return eth.toFixed(6);
}

export function gweiFromWei(weiHex: string | null | undefined): string {
  if (!weiHex) return '0';
  const wei = BigInt(weiHex);
  const gwei = Number(wei) / 1e9;
  return gwei.toFixed(2);
}

// ────────────────────────────────────────────
// Network status
// ────────────────────────────────────────────

export interface NetworkStatus {
  connected: boolean;
  chainId: number;
  networkName: string;
  latestBlock: number;
  gasPrice: string; // in Gwei
  baseFee: string;  // in Gwei (from latest block)
  peerCount: number;
  latencyMs: number;
  error?: string;
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  const start = performance.now();
  try {
    const [chainIdHex, blockNumHex, gasPriceHex] = await Promise.all([
      rpc<string>('eth_chainId'),
      rpc<string>('eth_blockNumber'),
      rpc<string>('eth_gasPrice'),
    ]);

    const chainId = hexToNumber(chainIdHex);
    const latestBlock = hexToNumber(blockNumHex);

    // Get base fee from latest block
    const block = await rpc<any>('eth_getBlockByNumber', [blockNumHex, false]);
    const baseFee = block?.baseFeePerGas ? gweiFromWei(block.baseFeePerGas) : '0';

    const latencyMs = Math.round(performance.now() - start);

    const networkNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      42161: 'Arbitrum One',
    };

    return {
      connected: true,
      chainId,
      networkName: networkNames[chainId] || `Chain ${chainId}`,
      latestBlock,
      gasPrice: gweiFromWei(gasPriceHex),
      baseFee,
      peerCount: 0, // Not available via Alchemy
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      chainId: 0,
      networkName: 'Unknown',
      latestBlock: 0,
      gasPrice: '0',
      baseFee: '0',
      peerCount: 0,
      latencyMs: Math.round(performance.now() - start),
      error: err?.message || 'Connection failed',
    };
  }
}

// ────────────────────────────────────────────
// Block data
// ────────────────────────────────────────────

export interface BlockInfo {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: Date;
  gasUsed: number;
  gasLimit: number;
  baseFeePerGas: string; // Gwei
  transactionCount: number;
  miner: string;
}

export async function getBlock(blockNumberOrTag: string | number = 'latest'): Promise<BlockInfo | null> {
  const param = typeof blockNumberOrTag === 'number'
    ? '0x' + blockNumberOrTag.toString(16)
    : blockNumberOrTag;

  const block = await rpc<any>('eth_getBlockByNumber', [param, false]);
  if (!block) return null;

  return {
    number: hexToNumber(block.number),
    hash: block.hash,
    parentHash: block.parentHash,
    timestamp: new Date(hexToNumber(block.timestamp) * 1000),
    gasUsed: hexToNumber(block.gasUsed),
    gasLimit: hexToNumber(block.gasLimit),
    baseFeePerGas: block.baseFeePerGas ? gweiFromWei(block.baseFeePerGas) : '0',
    transactionCount: block.transactions?.length || 0,
    miner: block.miner,
  };
}

// ────────────────────────────────────────────
// Transaction lookup
// ────────────────────────────────────────────

export interface TransactionInfo {
  hash: string;
  from: string;
  to: string | null;
  value: string; // ETH
  gasPrice: string; // Gwei
  gasUsed: number;
  blockNumber: number;
  blockHash: string;
  nonce: number;
  status: 'success' | 'failed' | 'pending';
  timestamp?: Date;
  input: string;
  contractAddress?: string;
}

export async function getTransaction(txHash: string): Promise<TransactionInfo | null> {
  const [tx, receipt] = await Promise.all([
    rpc<any>('eth_getTransactionByHash', [txHash]),
    rpc<any>('eth_getTransactionReceipt', [txHash]),
  ]);

  if (!tx) return null;

  const blockNumber = hexToNumber(tx.blockNumber);
  let timestamp: Date | undefined;

  // Fetch block for timestamp if confirmed
  if (tx.blockNumber) {
    const block = await rpc<any>('eth_getBlockByNumber', [tx.blockNumber, false]);
    if (block?.timestamp) {
      timestamp = new Date(hexToNumber(block.timestamp) * 1000);
    }
  }

  let status: 'success' | 'failed' | 'pending' = 'pending';
  if (receipt) {
    status = hexToNumber(receipt.status) === 1 ? 'success' : 'failed';
  }

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: weiToEth(tx.value),
    gasPrice: gweiFromWei(tx.gasPrice || tx.maxFeePerGas),
    gasUsed: receipt ? hexToNumber(receipt.gasUsed) : 0,
    blockNumber,
    blockHash: tx.blockHash || '',
    nonce: hexToNumber(tx.nonce),
    status,
    timestamp,
    input: tx.input,
    contractAddress: receipt?.contractAddress || undefined,
  };
}

// ────────────────────────────────────────────
// Address balance
// ────────────────────────────────────────────

export async function getBalance(address: string): Promise<string> {
  const balanceHex = await rpc<string>('eth_getBalance', [address, 'latest']);
  return weiToEth(balanceHex);
}

// ────────────────────────────────────────────
// Hash anchoring utilities
// ────────────────────────────────────────────

/**
 * Generate SHA-256 hash of a string (for document/credential anchoring).
 * Uses Web Crypto API — available in all modern browsers.
 */
export async function sha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(buffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate SHA-256 hash of a File/Blob.
 */
export async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ────────────────────────────────────────────
// Etherscan link helpers
// ────────────────────────────────────────────

export function etherscanTxUrl(txHash: string): string {
  return `https://etherscan.io/tx/${txHash}`;
}

export function etherscanBlockUrl(blockNumber: number): string {
  return `https://etherscan.io/block/${blockNumber}`;
}

export function etherscanAddressUrl(address: string): string {
  return `https://etherscan.io/address/${address}`;
}

// ────────────────────────────────────────────
// Alchemy-specific: get asset transfers (enhanced API)
// ────────────────────────────────────────────

export interface AssetTransfer {
  from: string;
  to: string;
  value: number | null;
  asset: string;
  category: string;
  hash: string;
  blockNum: string;
}

export async function getAssetTransfers(
  address: string,
  direction: 'from' | 'to' = 'from',
  maxCount = 10
): Promise<AssetTransfer[]> {
  const params: any = {
    [direction === 'from' ? 'fromAddress' : 'toAddress']: address,
    category: ['external', 'erc20', 'erc721'],
    maxCount: '0x' + maxCount.toString(16),
    order: 'desc',
  };

  const result = await rpc<any>('alchemy_getAssetTransfers', [params]);
  return (result?.transfers || []).map((t: any) => ({
    from: t.from,
    to: t.to,
    value: t.value,
    asset: t.asset || 'ETH',
    category: t.category,
    hash: t.hash,
    blockNum: t.blockNum,
  }));
}