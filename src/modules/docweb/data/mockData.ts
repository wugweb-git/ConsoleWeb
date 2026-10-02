// TODO: replace with Docweb admin API
// Mock Data aligned with Database Schema
// All IDs are proper UUIDs with correct foreign key relationships

import type {
  Organization,
  User,
  OrganizationMember,
  Document,
  DocumentVersion,
  Certificate,
  BlockchainTransaction,
  VerificationEvent,
  ApiKey,
  AuditLog,
} from '../types/database';

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export const mockOrganizations: Organization[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    primary_contact_user_id: '550e8400-e29b-41d4-a716-446655440010', // John Doe
    plan: 'enterprise',
    created_at: new Date(2024, 0, 15, 10, 0),
    updated_at: new Date(2024, 0, 15, 10, 0),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Beta Industries',
    slug: 'beta-industries',
    primary_contact_user_id: '550e8400-e29b-41d4-a716-446655440011', // Jane Smith
    plan: 'pro',
    created_at: new Date(2024, 1, 20, 14, 30),
    updated_at: new Date(2024, 1, 20, 14, 30),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'WugWeb',
    slug: 'wugweb',
    primary_contact_user_id: '550e8400-e29b-41d4-a716-446655440014', // Vedanshu
    plan: 'enterprise',
    created_at: new Date(2024, 11, 4, 10, 0),
    updated_at: new Date(2024, 11, 4, 10, 0),
  },
];

// ============================================================================
// USERS
// ============================================================================

export const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    email: 'john.doe@acme.com',
    name: 'John Doe',
    status: 'active',
    last_login_at: new Date(2024, 11, 4, 9, 30),
    created_at: new Date(2024, 0, 15, 10, 0),
    updated_at: new Date(2024, 11, 4, 9, 30),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    email: 'jane.smith@beta.com',
    name: 'Jane Smith',
    status: 'active',
    last_login_at: new Date(2024, 11, 3, 16, 45),
    created_at: new Date(2024, 1, 20, 14, 30),
    updated_at: new Date(2024, 11, 3, 16, 45),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    email: 'alice@acme.com',
    name: 'Alice Johnson',
    status: 'active',
    last_login_at: new Date(2024, 11, 2, 11, 20),
    created_at: new Date(2024, 2, 10, 9, 0),
    updated_at: new Date(2024, 11, 2, 11, 20),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    email: 'bob@acme.com',
    name: 'Bob Wilson',
    status: 'invited',
    created_at: new Date(2024, 11, 1, 14, 0),
    updated_at: new Date(2024, 11, 1, 14, 0),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    email: 'vedanshu@wugweb.com',
    password_hash: '$2b$10$YourHashedPasswordHere',
    name: 'Vedanshu',
    status: 'active',
    last_login_at: new Date(2024, 11, 4, 10, 0),
    created_at: new Date(2024, 11, 4, 10, 0),
    updated_at: new Date(2024, 11, 4, 10, 0),
  },
];

// ============================================================================
// ORGANIZATION MEMBERS
// ============================================================================

export const mockOrganizationMembers: OrganizationMember[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    organization_id: '550e8400-e29b-41d4-a716-446655440000', // Acme Corp
    user_id: '550e8400-e29b-41d4-a716-446655440010', // John Doe
    role: 'owner',
    joinedDate: new Date(2024, 0, 15, 10, 0),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    organization_id: '550e8400-e29b-41d4-a716-446655440000', // Acme Corp
    user_id: '550e8400-e29b-41d4-a716-446655440012', // Alice Johnson
    role: 'admin',
    joinedDate: new Date(2024, 2, 10, 9, 0),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    organization_id: '550e8400-e29b-41d4-a716-446655440000', // Acme Corp
    user_id: '550e8400-e29b-41d4-a716-446655440013', // Bob Wilson
    role: 'member',
    joinedDate: new Date(2024, 11, 1, 14, 0),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440023',
    organization_id: '550e8400-e29b-41d4-a716-446655440001', // Beta Industries
    user_id: '550e8400-e29b-41d4-a716-446655440011', // Jane Smith
    role: 'owner',
    joinedDate: new Date(2024, 1, 20, 14, 30),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440024',
    organization_id: '550e8400-e29b-41d4-a716-446655440002', // WugWeb
    user_id: '550e8400-e29b-41d4-a716-446655440014', // Vedanshu
    role: 'owner',
    joinedDate: new Date(2024, 11, 4, 10, 0),
  },
];

// ============================================================================
// DOCUMENTS
// ============================================================================

export const mockDocuments: Document[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    organization_id: '550e8400-e29b-41d4-a716-446655440000', // Acme
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440010', // John Doe
    title: 'Annual_Report_2024.pdf',
    current_version_id: '550e8400-e29b-41d4-a716-446655440040', // v1
    status: 'certified',
    created_at: new Date(2024, 11, 1, 14, 30),
    updated_at: new Date(2024, 11, 1, 14, 35),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    organization_id: '550e8400-e29b-41d4-a716-446655440001', // Beta
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440011', // Jane Smith
    title: 'Q4_Financial_Statement.pdf',
    current_version_id: '550e8400-e29b-41d4-a716-446655440041',
    status: 'certified',
    created_at: new Date(2024, 11, 3, 9, 15),
    updated_at: new Date(2024, 11, 3, 9, 20),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    organization_id: '550e8400-e29b-41d4-a716-446655440000', // Acme
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440012', // Alice
    title: 'Contract_Agreement_2024.pdf',
    current_version_id: '550e8400-e29b-41d4-a716-446655440042',
    status: 'certified',
    created_at: new Date(2024, 10, 28, 16, 40),
    updated_at: new Date(2024, 10, 28, 16, 45),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    organization_id: '550e8400-e29b-41d4-a716-446655440000', // Acme
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440010', // John
    title: 'Employee_Handbook_v2.pdf',
    current_version_id: '550e8400-e29b-41d4-a716-446655440043',
    status: 'certified',
    created_at: new Date(2024, 10, 10, 8, 10),
    updated_at: new Date(2024, 10, 10, 8, 15),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034',
    organization_id: '550e8400-e29b-41d4-a716-446655440000', // Acme
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440012', // Alice
    title: 'Q3_Budget_Proposal.xlsx',
    current_version_id: '550e8400-e29b-41d4-a716-446655440044',
    status: 'draft',
    created_at: new Date(2024, 11, 4, 11, 0),
    updated_at: new Date(2024, 11, 4, 11, 0),
  },
];

// ============================================================================
// DOCUMENT VERSIONS
// ============================================================================

export const mockDocumentVersions: DocumentVersion[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440040',
    document_id: '550e8400-e29b-41d4-a716-446655440030',
    version_number: 1,
    storage_path: 's3://docweb-docs/acme/annual-report-2024-v1.pdf',
    file_mime_type: 'application/pdf',
    file_size_bytes: 2458624,
    content_hash: '5a7f8b9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440010',
    created_at: new Date(2024, 11, 1, 14, 30),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440041',
    document_id: '550e8400-e29b-41d4-a716-446655440031',
    version_number: 1,
    storage_path: 's3://docweb-docs/beta/q4-financial-v1.pdf',
    file_mime_type: 'application/pdf',
    file_size_bytes: 1835008,
    content_hash: '6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440011',
    created_at: new Date(2024, 11, 3, 9, 15),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440042',
    document_id: '550e8400-e29b-41d4-a716-446655440032',
    version_number: 1,
    storage_path: 's3://docweb-docs/acme/contract-2024-v1.pdf',
    file_mime_type: 'application/pdf',
    file_size_bytes: 524288,
    content_hash: '7c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440012',
    created_at: new Date(2024, 10, 28, 16, 40),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440043',
    document_id: '550e8400-e29b-41d4-a716-446655440033',
    version_number: 1,
    storage_path: 's3://docweb-docs/acme/handbook-v2.pdf',
    file_mime_type: 'application/pdf',
    file_size_bytes: 3145728,
    content_hash: '9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f',
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440010',
    created_at: new Date(2024, 10, 10, 8, 10),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440044',
    document_id: '550e8400-e29b-41d4-a716-446655440034',
    version_number: 1,
    storage_path: 's3://docweb-docs/acme/budget-q3-v1.xlsx',
    file_mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_size_bytes: 98304,
    content_hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440012',
    created_at: new Date(2024, 11, 4, 11, 0),
  },
];

// ============================================================================
// CERTIFICATES
// ============================================================================

export const mockCertificates: Certificate[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440050',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    document_id: '550e8400-e29b-41d4-a716-446655440030',
    document_version_id: '550e8400-e29b-41d4-a716-446655440040',
    issuer_user_id: '550e8400-e29b-41d4-a716-446655440010',
    on_chain_certificate_id: 'CERT-ABC123',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    transaction_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    block_number: 18234567,
    status: 'confirmed',
    issued_at: new Date(2024, 11, 1, 14, 35),
    created_at: new Date(2024, 11, 1, 14, 35),
    updated_at: new Date(2024, 11, 1, 14, 36),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440051',
    organization_id: '550e8400-e29b-41d4-a716-446655440001',
    document_id: '550e8400-e29b-41d4-a716-446655440031',
    document_version_id: '550e8400-e29b-41d4-a716-446655440041',
    issuer_user_id: '550e8400-e29b-41d4-a716-446655440011',
    on_chain_certificate_id: 'CERT-DEF456',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    transaction_hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    block_number: 18234890,
    status: 'confirmed',
    issued_at: new Date(2024, 11, 3, 9, 20),
    created_at: new Date(2024, 11, 3, 9, 20),
    updated_at: new Date(2024, 11, 3, 9, 21),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440052',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    document_id: '550e8400-e29b-41d4-a716-446655440032',
    document_version_id: '550e8400-e29b-41d4-a716-446655440042',
    issuer_user_id: '550e8400-e29b-41d4-a716-446655440012',
    on_chain_certificate_id: 'CERT-GHI789',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    transaction_hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    block_number: 18233245,
    status: 'confirmed',
    issued_at: new Date(2024, 10, 28, 16, 45),
    created_at: new Date(2024, 10, 28, 16, 45),
    updated_at: new Date(2024, 10, 28, 16, 46),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440053',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    document_id: '550e8400-e29b-41d4-a716-446655440033',
    document_version_id: '550e8400-e29b-41d4-a716-446655440043',
    issuer_user_id: '550e8400-e29b-41d4-a716-446655440010',
    on_chain_certificate_id: 'CERT-JKL012',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    transaction_hash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    block_number: 18230456,
    status: 'confirmed',
    issued_at: new Date(2024, 10, 10, 8, 15),
    created_at: new Date(2024, 10, 10, 8, 15),
    updated_at: new Date(2024, 10, 10, 8, 16),
  },
];

// ============================================================================
// BLOCKCHAIN TRANSACTIONS
// ============================================================================

export const mockBlockchainTransactions: BlockchainTransaction[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440060',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    related_certificate_id: '550e8400-e29b-41d4-a716-446655440050',
    related_document_id: '550e8400-e29b-41d4-a716-446655440030',
    operation_type: 'issue_certificate',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    transaction_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    transaction_status: 'confirmed',
    submitted_at: new Date(2024, 11, 1, 14, 35),
    confirmed_at: new Date(2024, 11, 1, 14, 36),
    raw_request: {
      docHash: '0x5a7f8b9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      metadataURI: '',
    },
    raw_response: {
      certId: 'CERT-ABC123',
      blockNumber: 18234567,
    },
    created_at: new Date(2024, 11, 1, 14, 35),
    updated_at: new Date(2024, 11, 1, 14, 36),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440061',
    organization_id: '550e8400-e29b-41d4-a716-446655440001',
    related_certificate_id: '550e8400-e29b-41d4-a716-446655440051',
    related_document_id: '550e8400-e29b-41d4-a716-446655440031',
    operation_type: 'issue_certificate',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    transaction_hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    transaction_status: 'confirmed',
    submitted_at: new Date(2024, 11, 3, 9, 20),
    confirmed_at: new Date(2024, 11, 3, 9, 21),
    raw_request: {
      docHash: '0x6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      metadataURI: '',
    },
    raw_response: {
      certId: 'CERT-DEF456',
      blockNumber: 18234890,
    },
    created_at: new Date(2024, 11, 3, 9, 20),
    updated_at: new Date(2024, 11, 3, 9, 21),
  },
];

// ============================================================================
// VERIFICATION EVENTS
// ============================================================================

export const mockVerificationEvents: VerificationEvent[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440070',
    organization_id: undefined,
    certificate_id: '550e8400-e29b-41d4-a716-446655440050',
    input_type: 'hash',
    input_hash: '5a7f8b9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    client_ip: '203.45.67.89',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    result: 'verified',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    block_number: 18234567,
    verified_at: new Date(2024, 11, 4, 9, 45),
    created_at: new Date(2024, 11, 4, 9, 45),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440071',
    organization_id: undefined,
    certificate_id: '550e8400-e29b-41d4-a716-446655440051',
    input_type: 'certificate_id',
    input_hash: '6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    client_ip: '101.23.45.67',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    result: 'verified',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    block_number: 18234890,
    verified_at: new Date(2024, 11, 3, 14, 20),
    created_at: new Date(2024, 11, 3, 14, 20),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440072',
    organization_id: undefined,
    certificate_id: undefined,
    input_type: 'hash',
    input_hash: 'invalid_hash_tampered_document',
    client_ip: '101.23.45.67',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    result: 'not_found',
    blockchain_network: 'polygon',
    contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    verified_at: new Date(2024, 11, 3, 14, 50),
    created_at: new Date(2024, 11, 3, 14, 50),
  },
];

// ============================================================================
// API KEYS
// ============================================================================

export const mockApiKeys: ApiKey[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440080',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Production API Key',
    hashed_key: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    key_preview: 'sk_live_...abc123',
    key: 'sk_live_demo_key_1', // Full key for demo
    role: 'full',
    status: 'active',
    rate_limit: 1000,
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440010',
    last_used_at: new Date(2024, 11, 4, 10, 15),
    created: new Date(2024, 2, 15, 10, 0),
    lastUsed: new Date(2024, 11, 4, 10, 15),
    created_at: new Date(2024, 2, 15, 10, 0),
    updated_at: new Date(2024, 11, 4, 10, 15),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440081',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Read-Only Integration',
    hashed_key: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
    key_preview: 'sk_live_...xyz789',
    key: 'sk_live_demo_key_2', // Full key for demo
    role: 'read_only',
    status: 'active',
    rate_limit: 500,
    created_by_user_id: '550e8400-e29b-41d4-a716-446655440012',
    last_used_at: new Date(2024, 11, 3, 16, 30),
    created: new Date(2024, 5, 1, 9, 0),
    lastUsed: new Date(2024, 11, 3, 16, 30),
    created_at: new Date(2024, 5, 1, 9, 0),
    updated_at: new Date(2024, 11, 3, 16, 30),
  },
];

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const mockAuditLogs: AuditLog[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440090',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: '550e8400-e29b-41d4-a716-446655440010',
    entity_type: 'document',
    entity_id: '550e8400-e29b-41d4-a716-446655440030',
    action: 'certify',
    metadata: {
      document_title: 'Annual_Report_2024.pdf',
      certificate_id: 'CERT-ABC123',
      blockchain_network: 'polygon',
      transaction_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    },
    created_at: new Date(2024, 11, 1, 14, 35),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440091',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: '550e8400-e29b-41d4-a716-446655440012',
    entity_type: 'user',
    entity_id: '550e8400-e29b-41d4-a716-446655440013',
    action: 'invite',
    metadata: {
      invited_email: 'bob@acme.com',
      role: 'member',
    },
    created_at: new Date(2024, 11, 1, 14, 0),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440092',
    organization_id: '550e8400-e29b-41d4-a716-446655440001',
    user_id: '550e8400-e29b-41d4-a716-446655440011',
    entity_type: 'document',
    entity_id: '550e8400-e29b-41d4-a716-446655440031',
    action: 'certify',
    metadata: {
      document_title: 'Q4_Financial_Statement.pdf',
      certificate_id: 'CERT-DEF456',
      blockchain_network: 'polygon',
      transaction_hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    },
    created_at: new Date(2024, 11, 3, 9, 20),
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getOrganizationById(id: string): Organization | undefined {
  return mockOrganizations.find(org => org.id === id);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getDocumentById(id: string): Document | undefined {
  return mockDocuments.find(doc => doc.id === id);
}

export function getCertificateById(id: string): Certificate | undefined {
  return mockCertificates.find(cert => cert.id === id);
}

export function getDocumentVersionById(id: string): DocumentVersion | undefined {
  return mockDocumentVersions.find(version => version.id === id);
}

export function getDocumentsForOrganization(orgId: string): Document[] {
  return mockDocuments.filter(doc => doc.organization_id === orgId);
}

export function getCertificatesForOrganization(orgId: string): Certificate[] {
  return mockCertificates.filter(cert => cert.organization_id === orgId);
}

export function getVerificationEventsForCertificate(certId: string): VerificationEvent[] {
  return mockVerificationEvents.filter(event => event.certificate_id === certId);
}

export function getAuditLogsForOrganization(orgId: string): AuditLog[] {
  return mockAuditLogs.filter(log => log.organization_id === orgId);
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export function authenticateUser(email: string, password: string): User | null {
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return null;
  }
  
  // In a real app, you would hash the password and compare
  // For demo purposes, we'll accept these credentials:
  const validCredentials: Record<string, string> = {
    'john.doe@acme.com': 'password',
    'jane.smith@beta.com': 'password',
    'alice@acme.com': 'password',
  };
  
  if (validCredentials[email] === password) {
    return user;
  }
  
  return null;
}

export function getUserOrganizations(userId: string): Organization[] {
  const membershipIds = mockOrganizationMembers
    .filter(member => member.user_id === userId)
    .map(member => member.organization_id);
  
  return mockOrganizations.filter(org => membershipIds.includes(org.id));
}