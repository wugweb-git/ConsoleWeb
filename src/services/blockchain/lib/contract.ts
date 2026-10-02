// TODO: replace with blockchain service API (engine stays in DocWeb)
// ============================================================================
// DocWeb — Smart Contract Layer (DocWebAnchor)
// ============================================================================
// Provides ABI, Solidity source, and interaction helpers for the
// DocWebAnchor contract on Ethereum Mainnet.
//
// Contract functions:
//   anchor(bytes32 docHash, string metadataURI)  — write
//   revoke(bytes32 docHash)                      — write
//   verify(bytes32 docHash)                      — read
//   anchorCount()                                — read
//   owner()                                      — read
// ============================================================================

import { ethers } from 'ethers';
import { getBrowserProvider } from './wallet';
import { ALCHEMY_ENDPOINT } from './blockchain';

// ────────────────────────────────────────────
// Solidity source (for Remix deployment)
// ────────────────────────────────────────────

export const DOCWEB_ANCHOR_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DocWebAnchor
 * @notice On-chain hash anchoring for document & credential integrity.
 *         Stores SHA-256 hashes with issuer address, timestamp, and
 *         optional metadata URI. Supports revocation by issuer or owner.
 */
contract DocWebAnchor {
    struct Anchor {
        address issuer;
        uint64  issuedAt;
        uint64  revokedAt;
        string  metadataURI;
        bool    exists;
    }

    mapping(bytes32 => Anchor) public anchors;
    uint256 public anchorCount;
    address public owner;

    event HashAnchored(
        bytes32 indexed docHash,
        address indexed issuer,
        uint256 timestamp,
        string  metadataURI
    );

    event HashRevoked(
        bytes32 indexed docHash,
        address indexed revoker,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Anchor a document hash on-chain.
     * @param docHash     SHA-256 hash of the document (as bytes32).
     * @param metadataURI Optional IPFS/HTTP URI pointing to credential metadata.
     */
    function anchor(bytes32 docHash, string calldata metadataURI) external {
        require(!anchors[docHash].exists, "Already anchored");
        anchors[docHash] = Anchor({
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            revokedAt: 0,
            metadataURI: metadataURI,
            exists: true
        });
        anchorCount++;
        emit HashAnchored(docHash, msg.sender, block.timestamp, metadataURI);
    }

    /**
     * @notice Revoke a previously anchored hash.
     * @param docHash The hash to revoke.
     */
    function revoke(bytes32 docHash) external {
        Anchor storage a = anchors[docHash];
        require(a.exists, "Not found");
        require(a.issuer == msg.sender || msg.sender == owner, "Not authorized");
        require(a.revokedAt == 0, "Already revoked");
        a.revokedAt = uint64(block.timestamp);
        emit HashRevoked(docHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify whether a hash is anchored and get its details.
     * @param docHash The hash to verify.
     */
    function verify(bytes32 docHash) external view returns (
        bool    exists_,
        address issuer,
        uint64  issuedAt,
        uint64  revokedAt,
        string memory metadataURI
    ) {
        Anchor storage a = anchors[docHash];
        return (a.exists, a.issuer, a.issuedAt, a.revokedAt, a.metadataURI);
    }
}`;

// ────────────────────────────────────────────
// ABI
// ────────────────────────────────────────────

export const DOCWEB_ANCHOR_ABI = [
  'constructor()',
  'event HashAnchored(bytes32 indexed docHash, address indexed issuer, uint256 timestamp, string metadataURI)',
  'event HashRevoked(bytes32 indexed docHash, address indexed revoker, uint256 timestamp)',
  'function anchor(bytes32 docHash, string calldata metadataURI) external',
  'function revoke(bytes32 docHash) external',
  'function verify(bytes32 docHash) external view returns (bool exists_, address issuer, uint64 issuedAt, uint64 revokedAt, string metadataURI)',
  'function anchorCount() external view returns (uint256)',
  'function owner() external view returns (address)',
  'function anchors(bytes32) external view returns (address issuer, uint64 issuedAt, uint64 revokedAt, string metadataURI, bool exists)',
];

// Compiled bytecode — deploy via Remix IDE (solc 0.8.19, optimizer 200 runs)
// Paste the bytecode from Remix after compiling the source above.
// This is left as a placeholder; the UI allows manual contract address entry.
export const DOCWEB_ANCHOR_BYTECODE = '';

// ────────────────────────────────────────────
// Contract config (persisted in memory)
// ────────────────────────────────────────────

let _contractAddress: string | null = null;

export function setContractAddress(address: string) {
  _contractAddress = address;
  // Persist to localStorage for session continuity
  try { localStorage.setItem('docweb_contract_address', address); } catch {}
}

export function getContractAddress(): string | null {
  if (_contractAddress) return _contractAddress;
  try {
    const stored = localStorage.getItem('docweb_contract_address');
    if (stored) { _contractAddress = stored; return stored; }
  } catch {}
  return null;
}

export function clearContractAddress() {
  _contractAddress = null;
  try { localStorage.removeItem('docweb_contract_address'); } catch {}
}

// ────────────────────────────────────────────
// Contract instance helpers
// ────────────────────────────────────────────

function getReadContract(address?: string): ethers.Contract | null {
  const addr = address || getContractAddress();
  if (!addr) return null;
  // Use browser provider if available, otherwise fall back to Alchemy JSON-RPC
  const provider = getBrowserProvider() || new ethers.JsonRpcProvider(ALCHEMY_ENDPOINT);
  return new ethers.Contract(addr, DOCWEB_ANCHOR_ABI, provider);
}

async function getWriteContract(address?: string): Promise<ethers.Contract | null> {
  const addr = address || getContractAddress();
  if (!addr) return null;
  const provider = getBrowserProvider();
  if (!provider) return null;
  const signer = await provider.getSigner();
  return new ethers.Contract(addr, DOCWEB_ANCHOR_ABI, signer);
}

// ────────────────────────────────────────────
// Read operations
// ────────────────────────────────────────────

export interface AnchorRecord {
  exists: boolean;
  issuer: string;
  issuedAt: Date;
  revokedAt: Date | null;
  metadataURI: string;
  isRevoked: boolean;
}

export async function verifyHash(docHash: string, address?: string): Promise<AnchorRecord> {
  const contract = getReadContract(address);
  if (!contract) throw new Error('Contract not configured or wallet not connected');

  // Ensure hash is bytes32 (pad to 32 bytes if needed)
  const hash = ensureBytes32(docHash);
  const [exists, issuer, issuedAt, revokedAt, metadataURI] = await contract.verify(hash);

  return {
    exists,
    issuer,
    issuedAt: new Date(Number(issuedAt) * 1000),
    revokedAt: Number(revokedAt) > 0 ? new Date(Number(revokedAt) * 1000) : null,
    metadataURI,
    isRevoked: Number(revokedAt) > 0,
  };
}

export async function getAnchorCount(address?: string): Promise<number> {
  const contract = getReadContract(address);
  if (!contract) throw new Error('Contract not configured or wallet not connected');
  const count = await contract.anchorCount();
  return Number(count);
}

export async function getContractOwner(address?: string): Promise<string> {
  const contract = getReadContract(address);
  if (!contract) throw new Error('Contract not configured or wallet not connected');
  return await contract.owner();
}

// ────────────────────────────────────────────
// Write operations
// ────────────────────────────────────────────

export interface TxResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export async function anchorHash(
  docHash: string,
  metadataURI: string = '',
  address?: string
): Promise<TxResult> {
  const contract = await getWriteContract(address);
  if (!contract) throw new Error('Contract not configured or wallet not connected');

  const hash = ensureBytes32(docHash);
  const tx = await contract.anchor(hash, metadataURI);

  // Wait for 1 confirmation
  const receipt = await tx.wait(1);

  return {
    hash: tx.hash,
    blockNumber: receipt?.blockNumber,
    gasUsed: receipt?.gasUsed?.toString(),
    status: receipt?.status === 1 ? 'confirmed' : 'failed',
  };
}

export async function revokeHash(docHash: string, address?: string): Promise<TxResult> {
  const contract = await getWriteContract(address);
  if (!contract) throw new Error('Contract not configured or wallet not connected');

  const hash = ensureBytes32(docHash);
  const tx = await contract.revoke(hash);
  const receipt = await tx.wait(1);

  return {
    hash: tx.hash,
    blockNumber: receipt?.blockNumber,
    gasUsed: receipt?.gasUsed?.toString(),
    status: receipt?.status === 1 ? 'confirmed' : 'failed',
  };
}

// ────────────────────────────────────────────
// Contract deployment
// ────────────────────────────────────────────

export async function deployContract(bytecode: string): Promise<{ address: string; txHash: string }> {
  const provider = getBrowserProvider();
  if (!provider) throw new Error('Wallet not connected');

  const signer = await provider.getSigner();
  const factory = new ethers.ContractFactory(DOCWEB_ANCHOR_ABI, bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  setContractAddress(deployedAddress);

  return {
    address: deployedAddress,
    txHash: contract.deploymentTransaction()?.hash || '',
  };
}

// ────────────────────────────────────────────
// Contract validation
// ────────────────────────────────────────────

export async function validateContract(address: string): Promise<{
  valid: boolean;
  owner?: string;
  anchorCount?: number;
  error?: string;
}> {
  try {
    const provider = getBrowserProvider();
    if (!provider) throw new Error('Wallet not connected');

    // Check if address has code (is a contract)
    const code = await provider.getCode(address);
    if (code === '0x') {
      return { valid: false, error: 'Address is not a contract (no bytecode found)' };
    }

    const contract = new ethers.Contract(address, DOCWEB_ANCHOR_ABI, provider);
    const [owner, anchorCount] = await Promise.all([
      contract.owner(),
      contract.anchorCount(),
    ]);

    return {
      valid: true,
      owner,
      anchorCount: Number(anchorCount),
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err?.message || 'Contract validation failed — may not be a DocWebAnchor contract',
    };
  }
}

// ────────────────────────────────────────────
// Utility
// ────────────────────────────────────────────

/**
 * Ensure a hex string is padded to bytes32 (64 hex chars + 0x prefix).
 */
function ensureBytes32(hex: string): string {
  let clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length > 64) clean = clean.slice(0, 64);
  clean = clean.padStart(64, '0');
  return '0x' + clean;
}

/**
 * Format a SHA-256 hash string as bytes32 for contract calls.
 */
export function hashToBytes32(sha256Hex: string): string {
  return ensureBytes32(sha256Hex);
}