// TODO: replace with blockchain service API (engine stays in DocWeb)
// ============================================================================
// DocWeb — Browser Wallet Connection (EIP-1193)
// ============================================================================
// Connects to MetaMask or any injected EIP-1193 provider.
// Uses ethers.js v6 BrowserProvider for clean interaction.
//
// In preview/sandbox environments where MetaMask is unavailable,
// all methods gracefully return errors.
// ============================================================================

import { ethers } from 'ethers';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null; // ETH
  error?: string;
}

// ────────────────────────────────────────────
// Provider access
// ────────────────────────────────────────────

function getInjectedProvider(): any | null {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
}

export function isWalletAvailable(): boolean {
  return getInjectedProvider() !== null;
}

export function getBrowserProvider(): ethers.BrowserProvider | null {
  const injected = getInjectedProvider();
  if (!injected) return null;
  return new ethers.BrowserProvider(injected);
}

export function getSigner(): Promise<ethers.JsonRpcSigner> | null {
  const provider = getBrowserProvider();
  if (!provider) return null;
  return provider.getSigner();
}

// ────────────────────────────────────────────
// Connect / disconnect
// ────────────────────────────────────────────

export async function connectWallet(): Promise<WalletState> {
  const injected = getInjectedProvider();
  if (!injected) {
    return {
      connected: false,
      address: null,
      chainId: null,
      balance: null,
      error: 'No wallet detected. Install MetaMask or another EIP-1193 wallet.',
    };
  }

  try {
    const provider = new ethers.BrowserProvider(injected);
    const accounts = await provider.send('eth_requestAccounts', []);

    if (!accounts || accounts.length === 0) {
      return {
        connected: false,
        address: null,
        chainId: null,
        balance: null,
        error: 'No accounts returned. Please unlock your wallet.',
      };
    }

    const address = accounts[0];
    const network = await provider.getNetwork();
    const balanceWei = await provider.getBalance(address);
    const balance = ethers.formatEther(balanceWei);

    return {
      connected: true,
      address,
      chainId: Number(network.chainId),
      balance: parseFloat(balance).toFixed(4),
    };
  } catch (err: any) {
    return {
      connected: false,
      address: null,
      chainId: null,
      balance: null,
      error: err?.message || 'Failed to connect wallet',
    };
  }
}

export async function getWalletState(): Promise<WalletState> {
  const injected = getInjectedProvider();
  if (!injected) {
    return { connected: false, address: null, chainId: null, balance: null };
  }

  try {
    const provider = new ethers.BrowserProvider(injected);
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      return { connected: false, address: null, chainId: null, balance: null };
    }

    const address = accounts[0].address;
    const network = await provider.getNetwork();
    const balanceWei = await provider.getBalance(address);
    const balance = ethers.formatEther(balanceWei);

    return {
      connected: true,
      address,
      chainId: Number(network.chainId),
      balance: parseFloat(balance).toFixed(4),
    };
  } catch {
    return { connected: false, address: null, chainId: null, balance: null };
  }
}

// ────────────────────────────────────────────
// Network switching
// ────────────────────────────────────────────

export async function switchToMainnet(): Promise<{ ok: boolean; error?: string }> {
  const injected = getInjectedProvider();
  if (!injected) return { ok: false, error: 'No wallet detected' };

  try {
    await injected.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to switch network' };
  }
}

// ────────────────────────────────────────────
// Event listeners
// ────────────────────────────────────────────

export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  const injected = getInjectedProvider();
  if (!injected) return () => {};
  injected.on('accountsChanged', callback);
  return () => injected.removeListener('accountsChanged', callback);
}

export function onChainChanged(callback: (chainId: string) => void): () => void {
  const injected = getInjectedProvider();
  if (!injected) return () => {};
  injected.on('chainChanged', callback);
  return () => injected.removeListener('chainChanged', callback);
}
