import React, { useState } from 'react';
import { Database, Table, Eye, EyeOff, Code, Search, ChevronRight, ChevronDown, Layers, Key, Link2, Shield, Users, Building2, FileText, Tag, CheckCircle, BarChart3, Bell, Plug, CreditCard, Terminal, Activity } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  nullable?: boolean;
  primary?: boolean;
  unique?: boolean;
  foreign?: string;
  default?: string;
  values?: string[];
}

interface Relationship {
  type: 'has_many' | 'belongs_to' | 'has_one';
  table: string;
  via: string;
}

interface TableInfo {
  description: string;
  columns: Column[];
  relationships: Relationship[];
}

interface SchemaDomain {
  label: string;
  icon: React.ElementType;
  color: string;
  tables: Record<string, TableInfo>;
}

const schemaDomains: Record<string, SchemaDomain> = {
  identity: {
    label: 'Identity & Access',
    icon: Users,
    color: 'var(--accent)',
    tables: {
      users: {
        description: 'User accounts',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'email', type: 'varchar(255)', unique: true },
          { name: 'password_hash', type: 'varchar(255)', nullable: true },
          { name: 'first_name', type: 'varchar(128)' },
          { name: 'last_name', type: 'varchar(128)' },
          { name: 'phone', type: 'varchar(20)', nullable: true },
          { name: 'status', type: 'enum', values: ['active', 'invited', 'suspended'] },
          { name: 'email_verified', type: 'boolean', default: 'false' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'has_one', table: 'user_profiles', via: 'user_id' },
          { type: 'has_many', table: 'user_roles', via: 'user_id' },
          { type: 'has_many', table: 'organization_members', via: 'user_id' },
        ],
      },
      user_profiles: {
        description: 'Additional user information',
        columns: [
          { name: 'user_id', type: 'uuid', primary: true, foreign: 'users(id)' },
          { name: 'avatar_url', type: 'text', nullable: true },
          { name: 'city', type: 'varchar(100)', nullable: true },
          { name: 'country', type: 'varchar(100)', nullable: true },
          { name: 'timezone', type: 'varchar(50)', nullable: true },
          { name: 'bio', type: 'text', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'users', via: 'user_id' },
        ],
      },
      roles: {
        description: 'Role definitions (admin, issuer, recipient, verifier)',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'name', type: 'varchar(50)', unique: true },
          { name: 'description', type: 'text', nullable: true },
        ],
        relationships: [
          { type: 'has_many', table: 'role_permissions', via: 'role_id' },
          { type: 'has_many', table: 'user_roles', via: 'role_id' },
        ],
      },
      permissions: {
        description: 'Granular permission definitions',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'name', type: 'varchar(100)', unique: true },
          { name: 'description', type: 'text', nullable: true },
        ],
        relationships: [
          { type: 'has_many', table: 'role_permissions', via: 'permission_id' },
        ],
      },
      role_permissions: {
        description: 'Maps roles to permissions',
        columns: [
          { name: 'role_id', type: 'uuid', foreign: 'roles(id)' },
          { name: 'permission_id', type: 'uuid', foreign: 'permissions(id)' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'roles', via: 'role_id' },
          { type: 'belongs_to', table: 'permissions', via: 'permission_id' },
        ],
      },
      user_roles: {
        description: 'User-role assignments scoped to organizations',
        columns: [
          { name: 'user_id', type: 'uuid', foreign: 'users(id)' },
          { name: 'role_id', type: 'uuid', foreign: 'roles(id)' },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'users', via: 'user_id' },
          { type: 'belongs_to', table: 'roles', via: 'role_id' },
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
        ],
      },
    },
  },
  organizations: {
    label: 'Organizations',
    icon: Building2,
    color: 'var(--foreground)',
    tables: {
      organizations: {
        description: 'Organization master records',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'name', type: 'varchar(255)' },
          { name: 'description', type: 'text', nullable: true },
          { name: 'logo_url', type: 'text', nullable: true },
          { name: 'website', type: 'varchar(255)', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'has_many', table: 'organization_members', via: 'organization_id' },
          { type: 'has_one', table: 'organization_settings', via: 'organization_id' },
          { type: 'has_many', table: 'credentials', via: 'organization_id' },
          { type: 'has_many', table: 'documents', via: 'organization_id' },
          { type: 'has_many', table: 'products', via: 'organization_id' },
        ],
      },
      organization_members: {
        description: 'User membership within organizations',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'user_id', type: 'uuid', foreign: 'users(id)' },
          { name: 'role_id', type: 'uuid', foreign: 'roles(id)' },
          { name: 'joined_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'belongs_to', table: 'users', via: 'user_id' },
          { type: 'belongs_to', table: 'roles', via: 'role_id' },
        ],
      },
      organization_settings: {
        description: 'Per-organization configuration',
        columns: [
          { name: 'organization_id', type: 'uuid', primary: true, foreign: 'organizations(id)' },
          { name: 'branding_color', type: 'varchar(7)', nullable: true },
          { name: 'default_template_id', type: 'uuid', nullable: true, foreign: 'templates(id)' },
          { name: 'default_schema_id', type: 'uuid', nullable: true, foreign: 'credential_schemas(id)' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
        ],
      },
    },
  },
  did: {
    label: 'DID Identity',
    icon: Shield,
    color: 'var(--accent)',
    tables: {
      did_entities: {
        description: 'Decentralized Identifiers for organizations',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'did', type: 'varchar(255)', unique: true },
          { name: 'public_key', type: 'text' },
          { name: 'status', type: 'enum', values: ['active', 'revoked'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'has_many', table: 'did_keys', via: 'did_entity_id' },
        ],
      },
      did_keys: {
        description: 'Cryptographic keys associated with DIDs',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'did_entity_id', type: 'uuid', foreign: 'did_entities(id)' },
          { name: 'key_type', type: 'enum', values: ['Ed25519', 'secp256k1', 'RSA'] },
          { name: 'public_key', type: 'text' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'did_entities', via: 'did_entity_id' },
        ],
      },
    },
  },
  schemas: {
    label: 'Credential Schemas',
    icon: Layers,
    color: 'var(--foreground)',
    tables: {
      credential_schemas: {
        description: 'Schema definitions for verifiable credentials',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'name', type: 'varchar(255)' },
          { name: 'description', type: 'text', nullable: true },
          { name: 'version', type: 'varchar(20)' },
          { name: 'status', type: 'enum', values: ['draft', 'published', 'deprecated'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'has_many', table: 'schema_attributes', via: 'schema_id' },
          { type: 'has_many', table: 'templates', via: 'schema_id' },
        ],
      },
      schema_attributes: {
        description: 'Individual attributes within a schema',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'schema_id', type: 'uuid', foreign: 'credential_schemas(id)' },
          { name: 'attribute_name', type: 'varchar(100)' },
          { name: 'attribute_type', type: 'enum', values: ['string', 'number', 'date', 'boolean'] },
          { name: 'required', type: 'boolean', default: 'false' },
          { name: 'display_order', type: 'integer' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credential_schemas', via: 'schema_id' },
        ],
      },
    },
  },
  templates: {
    label: 'Templates',
    icon: FileText,
    color: 'var(--accent)',
    tables: {
      templates: {
        description: 'Visual template definitions for credentials',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'schema_id', type: 'uuid', foreign: 'credential_schemas(id)' },
          { name: 'name', type: 'varchar(255)' },
          { name: 'status', type: 'enum', values: ['draft', 'published', 'archived'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'belongs_to', table: 'credential_schemas', via: 'schema_id' },
          { type: 'has_many', table: 'template_elements', via: 'template_id' },
        ],
      },
      template_elements: {
        description: 'Positioned elements within a template canvas',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'template_id', type: 'uuid', foreign: 'templates(id)' },
          { name: 'element_type', type: 'enum', values: ['text', 'image', 'QR', 'table', 'HTML'] },
          { name: 'position_x', type: 'float' },
          { name: 'position_y', type: 'float' },
          { name: 'width', type: 'float' },
          { name: 'height', type: 'float' },
          { name: 'data_binding', type: 'varchar(255)', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'templates', via: 'template_id' },
        ],
      },
    },
  },
  credentials: {
    label: 'Credentials',
    icon: Shield,
    color: 'var(--foreground)',
    tables: {
      credentials: {
        description: 'Main verifiable credential records',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'schema_id', type: 'uuid', foreign: 'credential_schemas(id)' },
          { name: 'template_id', type: 'uuid', foreign: 'templates(id)' },
          { name: 'issuer_id', type: 'uuid', foreign: 'users(id)' },
          { name: 'subject_id', type: 'uuid', foreign: 'credential_subjects(id)' },
          { name: 'status', type: 'enum', values: ['draft', 'issued', 'revoked', 'expired'] },
          { name: 'blockchain_hash', type: 'char(66)', nullable: true },
          { name: 'issued_at', type: 'timestamp', nullable: true },
          { name: 'expires_at', type: 'timestamp', nullable: true },
          { name: 'revoked_at', type: 'timestamp', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credential_schemas', via: 'schema_id' },
          { type: 'belongs_to', table: 'templates', via: 'template_id' },
          { type: 'has_many', table: 'credential_attributes', via: 'credential_id' },
          { type: 'has_many', table: 'credential_history', via: 'credential_id' },
          { type: 'has_many', table: 'blockchain_transactions', via: 'credential_id' },
        ],
      },
      credential_subjects: {
        description: 'Subject (recipient) of a credential',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'credential_id', type: 'uuid', foreign: 'credentials(id)' },
          { name: 'subject_identifier', type: 'varchar(255)' },
          { name: 'subject_name', type: 'varchar(255)' },
          { name: 'subject_email', type: 'varchar(255)', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credentials', via: 'credential_id' },
        ],
      },
      credential_attributes: {
        description: 'Dynamic attribute values for each credential',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'credential_id', type: 'uuid', foreign: 'credentials(id)' },
          { name: 'attribute_name', type: 'varchar(100)' },
          { name: 'attribute_value', type: 'text' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credentials', via: 'credential_id' },
        ],
      },
      credential_history: {
        description: 'Lifecycle events for credentials',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'credential_id', type: 'uuid', foreign: 'credentials(id)' },
          { name: 'event_type', type: 'enum', values: ['issued', 'verified', 'revoked', 'updated'] },
          { name: 'event_data', type: 'jsonb', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credentials', via: 'credential_id' },
        ],
      },
    },
  },
  documents: {
    label: 'Documents & Signatures',
    icon: FileText,
    color: 'var(--accent)',
    tables: {
      documents: {
        description: 'Uploaded document records',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'file_url', type: 'text' },
          { name: 'title', type: 'varchar(255)' },
          { name: 'status', type: 'enum', values: ['draft', 'pending_signatures', 'signed', 'archived'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'has_many', table: 'document_signers', via: 'document_id' },
          { type: 'has_many', table: 'document_signatures', via: 'document_id' },
          { type: 'has_many', table: 'document_audit_log', via: 'document_id' },
        ],
      },
      document_signers: {
        description: 'Designated signers for a document',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'document_id', type: 'uuid', foreign: 'documents(id)' },
          { name: 'user_id', type: 'uuid', foreign: 'users(id)' },
          { name: 'sign_order', type: 'integer' },
          { name: 'status', type: 'enum', values: ['pending', 'signed', 'rejected'] },
          { name: 'signed_at', type: 'timestamp', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'documents', via: 'document_id' },
          { type: 'belongs_to', table: 'users', via: 'user_id' },
        ],
      },
      document_signatures: {
        description: 'Actual signature data records',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'document_id', type: 'uuid', foreign: 'documents(id)' },
          { name: 'signer_id', type: 'uuid', foreign: 'document_signers(id)' },
          { name: 'signature_data', type: 'text' },
          { name: 'signature_type', type: 'enum', values: ['drawn', 'digital', 'cryptographic'] },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'documents', via: 'document_id' },
          { type: 'belongs_to', table: 'document_signers', via: 'signer_id' },
        ],
      },
      document_audit_log: {
        description: 'Document-level audit trail',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'document_id', type: 'uuid', foreign: 'documents(id)' },
          { name: 'action', type: 'varchar(50)' },
          { name: 'user_id', type: 'uuid', nullable: true, foreign: 'users(id)' },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
          { name: 'metadata', type: 'jsonb', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'documents', via: 'document_id' },
        ],
      },
    },
  },
  products: {
    label: 'Product Labels',
    icon: Tag,
    color: 'var(--foreground)',
    tables: {
      products: {
        description: 'Product master records for DigiLabel',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'product_name', type: 'varchar(255)' },
          { name: 'manufacturer', type: 'varchar(255)' },
          { name: 'batch_number', type: 'varchar(50)', nullable: true },
          { name: 'manufacture_date', type: 'date', nullable: true },
          { name: 'expiry_date', type: 'date', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'has_many', table: 'product_certificates', via: 'product_id' },
          { type: 'has_many', table: 'product_qr_codes', via: 'product_id' },
          { type: 'has_many', table: 'warranties', via: 'product_id' },
        ],
      },
      product_certificates: {
        description: 'Certificates attached to products',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'product_id', type: 'uuid', foreign: 'products(id)' },
          { name: 'certificate_type', type: 'varchar(100)' },
          { name: 'certificate_file', type: 'text' },
          { name: 'issued_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'products', via: 'product_id' },
        ],
      },
      product_qr_codes: {
        description: 'QR codes linked to products',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'product_id', type: 'uuid', foreign: 'products(id)' },
          { name: 'qr_code_url', type: 'text' },
          { name: 'verification_url', type: 'text' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'products', via: 'product_id' },
          { type: 'has_many', table: 'qr_scans', via: 'qr_code_id' },
        ],
      },
    },
  },
  warranty: {
    label: 'Warranty',
    icon: CheckCircle,
    color: 'var(--accent)',
    tables: {
      warranties: {
        description: 'Warranty registrations for products',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'product_id', type: 'uuid', foreign: 'products(id)' },
          { name: 'owner_id', type: 'uuid', foreign: 'users(id)' },
          { name: 'purchase_date', type: 'date' },
          { name: 'registered_at', type: 'timestamp', default: 'now()' },
          { name: 'status', type: 'enum', values: ['active', 'expired', 'claimed'] },
        ],
        relationships: [
          { type: 'belongs_to', table: 'products', via: 'product_id' },
          { type: 'belongs_to', table: 'users', via: 'owner_id' },
          { type: 'has_many', table: 'warranty_claims', via: 'warranty_id' },
        ],
      },
      warranty_claims: {
        description: 'Claims filed against warranties',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'warranty_id', type: 'uuid', foreign: 'warranties(id)' },
          { name: 'description', type: 'text' },
          { name: 'status', type: 'enum', values: ['submitted', 'under_review', 'approved', 'rejected'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'warranties', via: 'warranty_id' },
        ],
      },
    },
  },
  verification: {
    label: 'Verification',
    icon: CheckCircle,
    color: 'var(--foreground)',
    tables: {
      verification_requests: {
        description: 'Incoming verification attempts',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'credential_id', type: 'uuid', nullable: true, foreign: 'credentials(id)' },
          { name: 'requester_ip', type: 'inet' },
          { name: 'verification_method', type: 'enum', values: ['QR', 'API', 'manual'] },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credentials', via: 'credential_id' },
          { type: 'has_one', table: 'verification_results', via: 'verification_request_id' },
        ],
      },
      verification_results: {
        description: 'Outcome of verification attempts',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'verification_request_id', type: 'uuid', foreign: 'verification_requests(id)' },
          { name: 'status', type: 'enum', values: ['valid', 'invalid', 'expired', 'revoked'] },
          { name: 'message', type: 'text', nullable: true },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'verification_requests', via: 'verification_request_id' },
        ],
      },
    },
  },
  blockchain: {
    label: 'Blockchain Anchoring',
    icon: Link2,
    color: 'var(--accent)',
    tables: {
      blockchain_transactions: {
        description: 'On-chain transaction records',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'credential_id', type: 'uuid', nullable: true, foreign: 'credentials(id)' },
          { name: 'transaction_hash', type: 'char(66)', unique: true },
          { name: 'blockchain_network', type: 'enum', values: ['ethereum_mainnet', 'polygon', 'arbitrum', 'bsc', 'ethereum_sepolia'] },
          { name: 'anchored_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credentials', via: 'credential_id' },
          { type: 'has_many', table: 'blockchain_proofs', via: 'transaction_id' },
        ],
      },
      blockchain_proofs: {
        description: 'Merkle/cryptographic proofs for transactions',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'transaction_id', type: 'uuid', foreign: 'blockchain_transactions(id)' },
          { name: 'proof_type', type: 'enum', values: ['merkle', 'zk', 'signature'] },
          { name: 'proof_data', type: 'jsonb' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'blockchain_transactions', via: 'transaction_id' },
        ],
      },
    },
  },
  qr_tracking: {
    label: 'QR Tracking',
    icon: Activity,
    color: 'var(--foreground)',
    tables: {
      qr_scans: {
        description: 'Track every QR code scan event',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'qr_code_id', type: 'uuid', foreign: 'product_qr_codes(id)' },
          { name: 'scanned_at', type: 'timestamp', default: 'now()' },
          { name: 'ip_address', type: 'inet', nullable: true },
          { name: 'location', type: 'varchar(255)', nullable: true },
          { name: 'device', type: 'varchar(255)', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'product_qr_codes', via: 'qr_code_id' },
        ],
      },
    },
  },
  notifications: {
    label: 'Notifications',
    icon: Bell,
    color: 'var(--accent)',
    tables: {
      notifications: {
        description: 'User notification records',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'user_id', type: 'uuid', foreign: 'users(id)' },
          { name: 'type', type: 'varchar(50)' },
          { name: 'message', type: 'text' },
          { name: 'status', type: 'enum', values: ['unread', 'read', 'dismissed'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'users', via: 'user_id' },
        ],
      },
    },
  },
  integrations: {
    label: 'Integrations',
    icon: Plug,
    color: 'var(--foreground)',
    tables: {
      integrations: {
        description: 'Third-party integration connections',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'provider', type: 'enum', values: ['Shopify', 'SAP', 'Salesforce', 'QuickBooks'] },
          { name: 'api_key', type: 'text' },
          { name: 'status', type: 'enum', values: ['active', 'disconnected', 'error'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'has_many', table: 'integration_events', via: 'integration_id' },
        ],
      },
      integration_events: {
        description: 'Webhook and sync event log',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'integration_id', type: 'uuid', foreign: 'integrations(id)' },
          { name: 'event_type', type: 'varchar(100)' },
          { name: 'payload', type: 'jsonb' },
          { name: 'status', type: 'enum', values: ['pending', 'processed', 'failed'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'integrations', via: 'integration_id' },
        ],
      },
    },
  },
  analytics: {
    label: 'Analytics',
    icon: BarChart3,
    color: 'var(--accent)',
    tables: {
      analytics_events: {
        description: 'Platform-wide analytics events',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'event_type', type: 'varchar(100)' },
          { name: 'user_id', type: 'uuid', nullable: true, foreign: 'users(id)' },
          { name: 'organization_id', type: 'uuid', nullable: true, foreign: 'organizations(id)' },
          { name: 'metadata', type: 'jsonb', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [],
      },
      credential_metrics: {
        description: 'Aggregated credential engagement metrics',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'credential_id', type: 'uuid', foreign: 'credentials(id)' },
          { name: 'views', type: 'integer', default: '0' },
          { name: 'downloads', type: 'integer', default: '0' },
          { name: 'shares', type: 'integer', default: '0' },
          { name: 'verifications', type: 'integer', default: '0' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'credentials', via: 'credential_id' },
        ],
      },
    },
  },
  activity_logs: {
    label: 'Activity Logs',
    icon: Activity,
    color: 'var(--foreground)',
    tables: {
      activity_logs: {
        description: 'Platform-wide activity audit trail',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'user_id', type: 'uuid', nullable: true, foreign: 'users(id)' },
          { name: 'organization_id', type: 'uuid', nullable: true, foreign: 'organizations(id)' },
          { name: 'action', type: 'varchar(50)' },
          { name: 'entity_type', type: 'varchar(50)' },
          { name: 'entity_id', type: 'uuid' },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
          { name: 'metadata', type: 'jsonb', nullable: true },
        ],
        relationships: [],
      },
    },
  },
  billing: {
    label: 'Billing',
    icon: CreditCard,
    color: 'var(--accent)',
    tables: {
      subscription_plans: {
        description: 'Available subscription tiers',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'name', type: 'varchar(50)' },
          { name: 'price', type: 'decimal(10,2)' },
          { name: 'credential_limit', type: 'integer', nullable: true },
          { name: 'api_limit', type: 'integer', nullable: true },
        ],
        relationships: [
          { type: 'has_many', table: 'subscriptions', via: 'plan_id' },
        ],
      },
      subscriptions: {
        description: 'Organization subscription records',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'plan_id', type: 'uuid', foreign: 'subscription_plans(id)' },
          { name: 'status', type: 'enum', values: ['active', 'past_due', 'cancelled'] },
          { name: 'started_at', type: 'timestamp' },
          { name: 'expires_at', type: 'timestamp', nullable: true },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
          { type: 'belongs_to', table: 'subscription_plans', via: 'plan_id' },
          { type: 'has_many', table: 'invoices', via: 'subscription_id' },
        ],
      },
      invoices: {
        description: 'Billing invoices for subscriptions',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'subscription_id', type: 'uuid', foreign: 'subscriptions(id)' },
          { name: 'amount', type: 'decimal(10,2)' },
          { name: 'currency', type: 'varchar(3)', default: "'USD'" },
          { name: 'status', type: 'enum', values: ['draft', 'sent', 'paid', 'overdue'] },
          { name: 'issued_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'subscriptions', via: 'subscription_id' },
        ],
      },
    },
  },
  api_keys: {
    label: 'API Keys',
    icon: Key,
    color: 'var(--foreground)',
    tables: {
      api_keys: {
        description: 'API authentication keys for organizations',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'organization_id', type: 'uuid', foreign: 'organizations(id)' },
          { name: 'key', type: 'varchar(64)', unique: true },
          { name: 'status', type: 'enum', values: ['active', 'revoked'] },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        relationships: [
          { type: 'belongs_to', table: 'organizations', via: 'organization_id' },
        ],
      },
    },
  },
  system_logs: {
    label: 'System Logs',
    icon: Terminal,
    color: 'var(--accent)',
    tables: {
      system_logs: {
        description: 'Internal service-level logging',
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'service', type: 'varchar(50)' },
          { name: 'level', type: 'enum', values: ['debug', 'info', 'warn', 'error', 'critical'] },
          { name: 'message', type: 'text' },
          { name: 'metadata', type: 'jsonb', nullable: true },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
        ],
        relationships: [],
      },
    },
  },
};

// Compute totals
const allDomains = Object.values(schemaDomains);
const totalTables = allDomains.reduce((sum, d) => sum + Object.keys(d.tables).length, 0);
const totalColumns = allDomains.reduce(
  (sum, d) => sum + Object.values(d.tables).reduce((s, t) => s + t.columns.length, 0),
  0
);
const totalRelationships = allDomains.reduce(
  (sum, d) => sum + Object.values(d.tables).reduce((s, t) => s + t.relationships.length, 0),
  0
);

export function AdminSchema() {
  const [expandedDomain, setExpandedDomain] = useState<string | null>('identity');
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDomains = searchQuery.trim()
    ? Object.entries(schemaDomains).reduce<Record<string, SchemaDomain>>((acc, [key, domain]) => {
        const q = searchQuery.toLowerCase();
        const matchedTables = Object.entries(domain.tables).filter(
          ([tName, tInfo]) =>
            tName.includes(q) ||
            tInfo.description.toLowerCase().includes(q) ||
            tInfo.columns.some(c => c.name.includes(q))
        );
        if (matchedTables.length > 0) {
          acc[key] = {
            ...domain,
            tables: Object.fromEntries(matchedTables),
          };
        }
        return acc;
      }, {})
    : schemaDomains;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ color: 'var(--foreground)' }}>Database Schema</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Full production schema across {Object.keys(schemaDomains).length} domains — {totalTables} tables, {totalColumns} columns, {totalRelationships} relationships
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Domains', value: Object.keys(schemaDomains).length.toString(), icon: Layers, color: 'var(--accent)' },
          { label: 'Tables', value: totalTables.toString(), icon: Table, color: 'var(--foreground)' },
          { label: 'Columns', value: totalColumns.toString(), icon: Code, color: 'var(--accent)' },
          { label: 'Engine', value: 'PostgreSQL', icon: Database, color: 'var(--foreground)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-[var(--radius-lg)] border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <stat.icon className="w-6 h-6 mb-2" style={{ color: stat.color }} />
            <h3 style={{ color: stat.color }}>{stat.value}</h3>
            <p style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tables, columns, or descriptions..."
          className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border outline-none"
          style={{
            backgroundColor: 'var(--input-background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      {/* Supplementary layers */}
      <div
        className="rounded-[var(--radius-lg)] border p-5"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <h4 style={{ color: 'var(--foreground)' }} className="mb-3">Supporting Infrastructure</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Redis', desc: 'Session cache, rate limits, hot data' },
            { name: 'Elasticsearch', desc: 'Full-text search, analytics queries' },
            { name: 'S3 / IPFS', desc: 'Object storage for files & metadata URIs' },
          ].map((infra) => (
            <div
              key={infra.name}
              className="px-4 py-3 rounded-[var(--radius-md)]"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                {infra.name}
              </p>
              <small style={{ color: 'var(--muted-foreground)' }}>{infra.desc}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Accordion */}
      <div className="space-y-3">
        {Object.entries(filteredDomains).map(([domainKey, domain]) => {
          const DomainIcon = domain.icon;
          const tableCount = Object.keys(domain.tables).length;
          const colCount = Object.values(domain.tables).reduce((s, t) => s + t.columns.length, 0);
          const isExpanded = expandedDomain === domainKey;

          return (
            <div
              key={domainKey}
              className="rounded-[var(--radius-lg)] border overflow-hidden"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              {/* Domain Header */}
              <button
                onClick={() => setExpandedDomain(isExpanded ? null : domainKey)}
                className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{ backgroundColor: domain.color === 'var(--accent)' ? 'rgba(255,190,26,0.12)' : 'var(--muted)' }}
                  >
                    <DomainIcon className="w-4.5 h-4.5" style={{ color: domain.color }} />
                  </div>
                  <div className="text-left">
                    <h4 style={{ color: 'var(--foreground)' }}>{domain.label}</h4>
                    <small style={{ color: 'var(--muted-foreground)' }}>
                      {tableCount} table{tableCount > 1 ? 's' : ''} · {colCount} columns
                    </small>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                ) : (
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                )}
              </button>

              {/* Tables */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {Object.entries(domain.tables).map(([tableName, tableInfo]) => {
                    const isTableExpanded = expandedTable === tableName;

                    return (
                      <div key={tableName}>
                        <button
                          onClick={() => setExpandedTable(isTableExpanded ? null : tableName)}
                          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          style={{ borderTop: '1px solid var(--border)' }}
                        >
                          <div className="flex items-center gap-3">
                            <Table className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <div className="text-left">
                              <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                                {tableName}
                              </p>
                              <small style={{ color: 'var(--muted-foreground)' }}>
                                {tableInfo.description}
                              </small>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <small style={{ color: 'var(--muted-foreground)' }}>
                              {tableInfo.columns.length} cols
                            </small>
                            {isTableExpanded ? (
                              <EyeOff className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                            ) : (
                              <Eye className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                            )}
                          </div>
                        </button>

                        {isTableExpanded && (
                          <div className="px-5 pb-5">
                            {/* Columns */}
                            <div className="mt-2 mb-4">
                              <h6 className="mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                Columns ({tableInfo.columns.length})
                              </h6>
                              <div
                                className="rounded-[var(--radius-md)] border overflow-hidden"
                                style={{ borderColor: 'var(--border)' }}
                              >
                                <table className="w-full">
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--muted)' }}>
                                      <th className="text-left px-3 py-2">
                                        <label style={{ color: 'var(--muted-foreground)' }}>Name</label>
                                      </th>
                                      <th className="text-left px-3 py-2">
                                        <label style={{ color: 'var(--muted-foreground)' }}>Type</label>
                                      </th>
                                      <th className="text-left px-3 py-2">
                                        <label style={{ color: 'var(--muted-foreground)' }}>Constraints</label>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tableInfo.columns.map((column) => (
                                      <tr key={column.name} className="border-t" style={{ borderColor: 'var(--border)' }}>
                                        <td className="px-3 py-2">
                                          <code
                                            className="px-2 py-0.5 rounded-[var(--radius-sm)]"
                                            style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                                          >
                                            {column.name}
                                          </code>
                                        </td>
                                        <td className="px-3 py-2">
                                          <span style={{ color: 'var(--muted-foreground)' }}>
                                            {column.type}
                                            {column.values && (
                                              <span style={{ color: 'var(--muted-foreground)' }}>{' '}({column.values.join(', ')})</span>
                                            )}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2">
                                          <div className="flex gap-1.5 flex-wrap">
                                            {column.primary && (
                                              <small
                                                className="px-2 py-0.5 rounded-[var(--radius-sm)]"
                                                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                                              >
                                                PK
                                              </small>
                                            )}
                                            {column.unique && (
                                              <small
                                                className="px-2 py-0.5 rounded-[var(--radius-sm)]"
                                                style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                                              >
                                                UNIQUE
                                              </small>
                                            )}
                                            {column.foreign && (
                                              <small
                                                className="px-2 py-0.5 rounded-[var(--radius-sm)]"
                                                style={{ backgroundColor: 'rgba(255,190,26,0.1)', color: 'var(--accent)' }}
                                              >
                                                FK → {column.foreign}
                                              </small>
                                            )}
                                            {column.nullable === false && !column.primary && (
                                              <small
                                                className="px-2 py-0.5 rounded-[var(--radius-sm)]"
                                                style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                                              >
                                                NOT NULL
                                              </small>
                                            )}
                                            {column.nullable && (
                                              <small
                                                className="px-2 py-0.5 rounded-[var(--radius-sm)]"
                                                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                                              >
                                                NULLABLE
                                              </small>
                                            )}
                                            {column.default && (
                                              <small
                                                className="px-2 py-0.5 rounded-[var(--radius-sm)]"
                                                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                                              >
                                                DEFAULT {column.default}
                                              </small>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Relationships */}
                            {tableInfo.relationships.length > 0 && (
                              <div>
                                <h6 className="mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                  Relationships ({tableInfo.relationships.length})
                                </h6>
                                <div className="space-y-1.5">
                                  {tableInfo.relationships.map((rel, idx) => (
                                    <div
                                      key={idx}
                                      className="px-3 py-2 rounded-[var(--radius-md)] flex items-center gap-2"
                                      style={{ backgroundColor: 'var(--muted)' }}
                                    >
                                      <Link2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                      <span style={{ color: 'var(--accent)' }}>{rel.type}</span>
                                      <span style={{ color: 'var(--foreground)' }}>→</span>
                                      <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                                        {rel.table}
                                      </span>
                                      <small style={{ color: 'var(--muted-foreground)' }}>via {rel.via}</small>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Entity Relationship Overview */}
      <div
        className="rounded-[var(--radius-lg)] border p-6"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <h4 style={{ color: 'var(--foreground)' }} className="mb-4">Entity Relationship Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              root: 'Organizations',
              children: ['Users', 'Schemas', 'Templates', 'Products', 'Credentials', 'Documents', 'Integrations'],
            },
            {
              root: 'Credentials',
              children: ['Subjects', 'Attributes', 'Blockchain Proofs', 'Verification Logs', 'Credential History'],
            },
            {
              root: 'Products',
              children: ['QR Codes', 'Certificates', 'Warranties', 'QR Scans'],
            },
            {
              root: 'Documents',
              children: ['Signers', 'Signatures', 'Audit Log'],
            },
            {
              root: 'Billing',
              children: ['Plans', 'Subscriptions', 'Invoices'],
            },
            {
              root: 'System',
              children: ['Activity Logs', 'System Logs', 'Notifications', 'Analytics Events'],
            },
          ].map((group) => (
            <div
              key={group.root}
              className="rounded-[var(--radius-md)] p-4"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties} className="mb-2">
                {group.root}
              </p>
              <div className="space-y-1 pl-3" style={{ borderLeft: '2px solid var(--accent)' }}>
                {group.children.map((child) => (
                  <small key={child} className="block" style={{ color: 'var(--muted-foreground)' }}>
                    {child}
                  </small>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scale Expectations */}
      <div
        className="rounded-[var(--radius-lg)] border p-6"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <h4 style={{ color: 'var(--foreground)' }} className="mb-3">Scale Expectations</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Credentials', value: 'Millions' },
            { label: 'QR Scans', value: 'Millions' },
            { label: 'Verification Traffic', value: 'High throughput' },
            { label: 'Enterprise Integrations', value: 'Multi-tenant' },
          ].map((item) => (
            <div
              key={item.label}
              className="px-4 py-3 rounded-[var(--radius-md)]"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                {item.value}
              </p>
              <small style={{ color: 'var(--muted-foreground)' }}>{item.label}</small>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Indexed Queries', 'Partitioned Tables', 'Event Streaming', 'Caching Layer'].map((opt) => (
            <span
              key={opt}
              className="px-3 py-1 rounded-[var(--radius-full)]"
              style={{ backgroundColor: 'rgba(255,190,26,0.1)', color: 'var(--accent)' }}
            >
              {opt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
