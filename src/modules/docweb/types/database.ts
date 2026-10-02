// TODO: replace with Docweb admin API
// Database Schema Types for DocWeb
// Aligned with the full production database schema (~60 tables, 19 domains)
// See /imports/pasted_text/docweb-schema.md for the complete blueprint

// ============================================================================
// ENUMS
// ============================================================================

export type OrganizationPlan = 'free' | 'pro' | 'enterprise';

export type UserStatus = 'active' | 'invited' | 'suspended';

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';

export type DocumentStatus = 'draft' | 'certified' | 'archived';

export type CertificateStatus = 'pending' | 'confirmed' | 'revoked' | 'expired';

export type BlockchainNetwork = 
  | 'ethereum_mainnet' 
  | 'polygon' 
  | 'arbitrum' 
  | 'bsc'
  | 'ethereum_sepolia';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export type OperationType = 
  | 'issue_certificate' 
  | 'revoke_certificate' 
  | 'migrate';

export type VerificationInputType = 'hash' | 'certificate_id' | 'file_upload';

export type VerificationResult = 
  | 'verified' 
  | 'not_found' 
  | 'mismatch' 
  | 'revoked' 
  | 'error';

export type ApiKeyRole = 'full' | 'read_only' | 'certify_only';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'certify' 
  | 'revoke' 
  | 'verify' 
  | 'login'
  | 'invite'
  | 'delete'
  | 'export';

export type CredentialStatus = 'draft' | 'issued' | 'revoked' | 'expired';

export type SchemaStatus = 'draft' | 'published' | 'deprecated';

export type TemplateStatus = 'draft' | 'published' | 'archived';

export type SignerStatus = 'pending' | 'signed' | 'rejected';

export type SignatureType = 'drawn' | 'digital' | 'cryptographic';

export type WarrantyStatus = 'active' | 'expired' | 'claimed';

export type WarrantyClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

export type VerificationMethod = 'QR' | 'API' | 'manual';

export type VerificationResultStatus = 'valid' | 'invalid' | 'expired' | 'revoked';

export type ProofType = 'merkle' | 'zk' | 'signature';

export type NotificationStatus = 'unread' | 'read' | 'dismissed';

export type IntegrationProvider = 'Shopify' | 'SAP' | 'Salesforce' | 'QuickBooks';

export type IntegrationStatus = 'active' | 'disconnected' | 'error';

export type IntegrationEventStatus = 'pending' | 'processed' | 'failed';

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type DIDStatus = 'active' | 'revoked';

export type DIDKeyType = 'Ed25519' | 'secp256k1' | 'RSA';

export type SchemaAttributeType = 'string' | 'number' | 'date' | 'boolean';

export type TemplateElementType = 'text' | 'image' | 'QR' | 'table' | 'HTML';

export type SystemLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type CredentialEventType = 'issued' | 'verified' | 'revoked' | 'updated';

// ============================================================================
// 1. IDENTITY & ACCESS
// ============================================================================

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: UserStatus;
  email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  user_id: string;
  avatar_url?: string;
  city?: string;
  country?: string;
  timezone?: string;
  bio?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  organization_id: string;
}

// ============================================================================
// 2. ORGANIZATIONS
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  primary_contact_user_id: string;
  plan: OrganizationPlan;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  role_id?: string;
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationSettings {
  organization_id: string;
  branding_color?: string;
  default_template_id?: string;
  default_schema_id?: string;
}

// ============================================================================
// 3. DID IDENTITY
// ============================================================================

export interface DIDEntity {
  id: string;
  organization_id: string;
  did: string;
  public_key: string;
  status: DIDStatus;
  created_at: Date;
}

export interface DIDKey {
  id: string;
  did_entity_id: string;
  key_type: DIDKeyType;
  public_key: string;
  created_at: Date;
}

// ============================================================================
// 4. CREDENTIAL SCHEMAS
// ============================================================================

export interface CredentialSchema {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  version: string;
  status: SchemaStatus;
  created_at: Date;
}

export interface SchemaAttribute {
  id: string;
  schema_id: string;
  attribute_name: string;
  attribute_type: SchemaAttributeType;
  required: boolean;
  display_order: number;
}

// ============================================================================
// 5. TEMPLATES
// ============================================================================

export interface Template {
  id: string;
  organization_id: string;
  schema_id: string;
  name: string;
  status: TemplateStatus;
  created_at: Date;
}

export interface TemplateElement {
  id: string;
  template_id: string;
  element_type: TemplateElementType;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  data_binding?: string;
}

// ============================================================================
// 6. CREDENTIALS
// ============================================================================

export interface Credential {
  id: string;
  schema_id: string;
  template_id: string;
  issuer_id: string;
  subject_id: string;
  status: CredentialStatus;
  blockchain_hash?: string;
  issued_at?: Date;
  expires_at?: Date;
  revoked_at?: Date;
}

export interface CredentialSubject {
  id: string;
  credential_id: string;
  subject_identifier: string;
  subject_name: string;
  subject_email?: string;
}

export interface CredentialAttribute {
  id: string;
  credential_id: string;
  attribute_name: string;
  attribute_value: string;
}

export interface CredentialHistory {
  id: string;
  credential_id: string;
  event_type: CredentialEventType;
  event_data?: Record<string, any>;
  created_at: Date;
}

// ============================================================================
// 7. DOCUMENTS & SIGNATURES
// ============================================================================

export interface Document {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  file_url: string;
  title: string;
  current_version_id?: string;
  status: DocumentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  storage_path: string;
  file_mime_type: string;
  file_size_bytes: number;
  content_hash: string;
  created_by_user_id: string;
  created_at: Date;
}

export interface DocumentSigner {
  id: string;
  document_id: string;
  user_id: string;
  sign_order: number;
  status: SignerStatus;
  signed_at?: Date;
}

export interface DocumentSignature {
  id: string;
  document_id: string;
  signer_id: string;
  signature_data: string;
  signature_type: SignatureType;
  timestamp: Date;
}

export interface DocumentAuditLog {
  id: string;
  document_id: string;
  action: string;
  user_id?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// 8. PRODUCT LABEL SYSTEM
// ============================================================================

export interface Product {
  id: string;
  organization_id: string;
  product_name: string;
  manufacturer: string;
  batch_number?: string;
  manufacture_date?: Date;
  expiry_date?: Date;
  created_at: Date;
}

export interface ProductCertificate {
  id: string;
  product_id: string;
  certificate_type: string;
  certificate_file: string;
  issued_at: Date;
}

export interface ProductQRCode {
  id: string;
  product_id: string;
  qr_code_url: string;
  verification_url: string;
  created_at: Date;
}

// ============================================================================
// 9. WARRANTY
// ============================================================================

export interface Warranty {
  id: string;
  product_id: string;
  owner_id: string;
  purchase_date: Date;
  registered_at: Date;
  status: WarrantyStatus;
}

export interface WarrantyClaim {
  id: string;
  warranty_id: string;
  description: string;
  status: WarrantyClaimStatus;
  created_at: Date;
}

// ============================================================================
// 10. VERIFICATION
// ============================================================================

export interface VerificationRequest {
  id: string;
  credential_id?: string;
  requester_ip: string;
  verification_method: VerificationMethod;
  timestamp: Date;
}

export interface VerificationResultRecord {
  id: string;
  verification_request_id: string;
  status: VerificationResultStatus;
  message?: string;
  timestamp: Date;
}

// ============================================================================
// 11. BLOCKCHAIN ANCHORING
// ============================================================================

export interface BlockchainTransaction {
  id: string;
  organization_id: string;
  related_certificate_id?: string;
  related_document_id?: string;
  credential_id?: string;
  operation_type: OperationType;
  blockchain_network: BlockchainNetwork;
  contract_address: string;
  transaction_hash: string;
  transaction_status: TransactionStatus;
  block_number?: number;
  submitted_at: Date;
  confirmed_at?: Date;
  anchored_at?: Date;
  error_message?: string;
  raw_request: Record<string, any>;
  raw_response: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface BlockchainProof {
  id: string;
  transaction_id: string;
  proof_type: ProofType;
  proof_data: Record<string, any>;
  created_at: Date;
}

// ============================================================================
// 12. QR TRACKING
// ============================================================================

export interface QRScan {
  id: string;
  qr_code_id: string;
  scanned_at: Date;
  ip_address?: string;
  location?: string;
  device?: string;
}

// ============================================================================
// 13. NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  status: NotificationStatus;
  created_at: Date;
}

// ============================================================================
// 14. INTEGRATIONS
// ============================================================================

export interface Integration {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  api_key: string;
  status: IntegrationStatus;
  created_at: Date;
}

export interface IntegrationEvent {
  id: string;
  integration_id: string;
  event_type: string;
  payload: Record<string, any>;
  status: IntegrationEventStatus;
  created_at: Date;
}

// ============================================================================
// 15. ANALYTICS
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  organization_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface CredentialMetrics {
  id: string;
  credential_id: string;
  views: number;
  downloads: number;
  shares: number;
  verifications: number;
}

// ============================================================================
// 16. ACTIVITY LOGS
// ============================================================================

export interface ActivityLog {
  id: string;
  user_id?: string;
  organization_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// 17. BILLING
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  credential_limit?: number;
  api_limit?: number;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: Date;
  expires_at?: Date;
}

export interface BillingInvoice {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issued_at: Date;
}

// ============================================================================
// 18. API KEYS
// ============================================================================

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  hashed_key: string;
  key_preview: string;
  role: ApiKeyRole;
  rate_limit?: number;
  created_by_user_id: string;
  last_used_at?: Date;
  revoked_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// 19. SYSTEM LOGS
// ============================================================================

export interface SystemLog {
  id: string;
  service: string;
  level: SystemLogLevel;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ============================================================================
// AUDIT LOGS (cross-cutting)
// ============================================================================

export interface AuditLog {
  id: string;
  organization_id?: string;
  user_id?: string;
  entity_type: string;
  entity_id: string;
  action: AuditAction;
  metadata: Record<string, any>;
  created_at: Date;
}

// ============================================================================
// VERIFICATION EVENTS (legacy compat)
// ============================================================================

export interface VerificationEvent {
  id: string;
  organization_id?: string;
  certificate_id?: string;
  input_type: VerificationInputType;
  input_hash?: string;
  client_ip: string;
  user_agent: string;
  result: VerificationResult;
  blockchain_network: BlockchainNetwork;
  contract_address: string;
  block_number?: number;
  verified_at: Date;
  created_at: Date;
}

// ============================================================================
// CERTIFICATES (core entity)
// ============================================================================

export interface Certificate {
  id: string;
  organization_id: string;
  document_id: string;
  document_version_id: string;
  issuer_user_id: string;
  on_chain_certificate_id: string;
  blockchain_network: BlockchainNetwork;
  contract_address: string;
  transaction_hash: string;
  block_number: number;
  status: CertificateStatus;
  issued_at: Date;
  revoked_at?: Date;
  revoked_by_user_id?: string;
  metadata_uri?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// EXTENDED TYPES (with relationships)
// ============================================================================

export interface DocumentWithRelations extends Document {
  current_version?: DocumentVersion;
  created_by?: User;
  organization?: Organization;
  certificates?: Certificate[];
}

export interface CertificateWithRelations extends Certificate {
  document?: Document;
  document_version?: DocumentVersion;
  issuer_user?: User;
  organization?: Organization;
}

export interface VerificationEventWithRelations extends VerificationEvent {
  certificate?: Certificate;
  organization?: Organization;
}

export interface AuditLogWithRelations extends AuditLog {
  user?: User;
  organization?: Organization;
}

export interface CredentialWithRelations extends Credential {
  schema?: CredentialSchema;
  template?: Template;
  subjects?: CredentialSubject[];
  attributes?: CredentialAttribute[];
  history?: CredentialHistory[];
}

export interface ProductWithRelations extends Product {
  certificates?: ProductCertificate[];
  qr_codes?: ProductQRCode[];
  warranties?: Warranty[];
  organization?: Organization;
}

export interface IntegrationWithRelations extends Integration {
  events?: IntegrationEvent[];
  organization?: Organization;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateDocumentRequest {
  title: string;
  file: File | Blob;
}

export interface CreateDocumentResponse {
  document: Document;
  version: DocumentVersion;
}

export interface CertifyDocumentRequest {
  document_id: string;
  version_id: string;
  blockchain_network?: BlockchainNetwork;
  metadata_uri?: string;
}

export interface CertifyDocumentResponse {
  certificate: Certificate;
  transaction: BlockchainTransaction;
}

export interface VerifyDocumentRequest {
  input_type: VerificationInputType;
  input_value: string;
}

export interface VerifyDocumentResponse {
  result: VerificationResult;
  certificate?: CertificateWithRelations;
  verification_event: VerificationEvent;
}

export interface RevokeCertificateRequest {
  certificate_id: string;
  reason?: string;
}

export interface RevokeCertificateResponse {
  certificate: Certificate;
  transaction: BlockchainTransaction;
}

export interface IssueCredentialRequest {
  schema_id: string;
  template_id: string;
  subject: Omit<CredentialSubject, 'id' | 'credential_id'>;
  attributes: Omit<CredentialAttribute, 'id' | 'credential_id'>[];
  blockchain_network?: BlockchainNetwork;
}

export interface IssueCredentialResponse {
  credential: Credential;
  transaction?: BlockchainTransaction;
}

// ============================================================================
// SMART CONTRACT TYPES
// ============================================================================

export interface CertificateRecord {
  docHash: string;
  issuer: string;
  issuedAt: number;
  revokedAt: number;
  metadataURI: string;
  status: number; // 0 = Active, 1 = Revoked
}

export interface SmartContractEvent {
  event: 'CertificateIssued' | 'CertificateRevoked';
  certId: string;
  docHash: string;
  issuer: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}
