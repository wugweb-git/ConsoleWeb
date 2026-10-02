// ============================================
// PLATFORM CONFIG STORE
// Single source of truth for all dynamic values
// Admin can CRUD these from Platform Config UI
// All components read from here instead of hardcoding
// ============================================

export interface ConfigItem {
  id: string;
  label: string;
  value: string;
  color?: string;    // CSS variable reference e.g. 'var(--foreground)'
  bgColor?: string;  // background color
  icon?: string;     // lucide icon name
  description?: string; // optional description for tooltips / detail views
  scope?: string[];  // which modules/entities use this item (e.g. ['credential', 'document', 'warranty'])
  order: number;
  active: boolean;
}

export interface ConfigCategory {
  id: string;
  label: string;
  description: string;
  icon?: string;     // lucide icon name for the category itself
  group: string;     // grouping key for UI sections
  items: ConfigItem[];
}

// ============================================
// GROUPS
// ============================================

export const configGroups: { key: string; label: string; icon: string }[] = [
  { key: 'statuses', label: 'Status Definitions', icon: 'CircleDot' },
  { key: 'types', label: 'Types & Formats', icon: 'Layers' },
  { key: 'taxonomy', label: 'Taxonomy', icon: 'FolderTree' },
  { key: 'access', label: 'Access & Identity', icon: 'Shield' },
  { key: 'infra', label: 'Infrastructure', icon: 'Server' },
];

// ============================================
// UNIFIED STATUSES
// One recycled list — each item declares its scope
// Components filter by scope at runtime
// ============================================

const statuses: ConfigItem[] = [
  // ── Lifecycle: beginning → end ──
  { id: 'status-draft',      label: 'Draft',         value: 'draft',       color: 'var(--neutral-6)', bgColor: 'var(--muted)', icon: 'FilePen',        scope: ['credential', 'document'],                                                    order: 1,  active: true },
  { id: 'status-pending',    label: 'Pending',       value: 'pending',     color: 'var(--warning)',    bgColor: 'var(--warning-light)', icon: 'Clock',  scope: ['credential', 'document', 'warranty'],                                        order: 2,  active: true },
  { id: 'status-invited',    label: 'Invited',       value: 'invited',     color: 'var(--info)',      bgColor: 'var(--info-light)', icon: 'Mail',       scope: ['user'],                                                                      order: 3,  active: true },
  { id: 'status-trial',      label: 'Trial',         value: 'trial',       color: 'var(--info)',      bgColor: 'var(--info-light)', icon: 'Clock',      scope: ['org'],                                                                       order: 4,  active: true },
  { id: 'status-active',     label: 'Active',        value: 'active',      color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'CheckCircle', scope: ['credential', 'warranty', 'product', 'user', 'org'],                     order: 5,  active: true },
  { id: 'status-issued',     label: 'Issued',        value: 'issued',      color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'CheckCircle', scope: ['credential', 'document'],                                               order: 6,  active: true },
  { id: 'status-confirmed',  label: 'Confirmed',     value: 'confirmed',   color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'CheckCircle', scope: ['credential'],                                                           order: 7,  active: true },
  { id: 'status-certified',  label: 'Certified',     value: 'certified',   color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'ShieldCheck', scope: ['document'],                                                             order: 8,  active: true },
  { id: 'status-sent',       label: 'Sent',          value: 'sent',        color: 'var(--info)',      bgColor: 'var(--info-light)', icon: 'Send',       scope: ['document'],                                                                  order: 9,  active: true },
  { id: 'status-viewed',     label: 'Viewed',        value: 'viewed',      color: 'var(--info)',      bgColor: 'var(--info-light)', icon: 'Eye',        scope: ['document'],                                                                  order: 10, active: true },
  { id: 'status-signed',     label: 'Signed',        value: 'signed',      color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'CheckCircle', scope: ['document'],                                                             order: 11, active: true },
  { id: 'status-completed',  label: 'Completed',     value: 'completed',   color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'CheckCircle', scope: ['document'],                                                             order: 12, active: true },
  { id: 'status-verified',   label: 'Verified',      value: 'verified',    color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'ShieldCheck', scope: ['product', 'verification'],                                              order: 13, active: true },
  { id: 'status-valid',      label: 'Valid',          value: 'valid',       color: 'var(--success)',   bgColor: 'var(--success-light)', icon: 'ShieldCheck', scope: ['verification'],                                                         order: 14, active: true },
  { id: 'status-claimed',    label: 'Claimed',       value: 'claimed',     color: 'var(--info)',      bgColor: 'var(--info-light)', icon: 'FileText',   scope: ['warranty'],                                                                  order: 15, active: true },
  { id: 'status-expiring',   label: 'Expiring Soon', value: 'expiring',    color: 'var(--warning)',   bgColor: 'var(--warning-light)', icon: 'AlertTriangle', scope: ['warranty', 'credential'],                                              order: 16, active: true },

  // ── Terminal / negative states ──
  { id: 'status-expired',    label: 'Expired',       value: 'expired',     color: 'var(--neutral-5)', bgColor: 'var(--muted)', icon: 'Clock',          scope: ['credential', 'document', 'warranty', 'product', 'verification'],             order: 17, active: true },
  { id: 'status-rejected',   label: 'Rejected',      value: 'rejected',    color: 'var(--destructive)', bgColor: 'var(--destructive-light)', icon: 'XCircle', scope: ['document'],                                                        order: 18, active: true },
  { id: 'status-revoked',    label: 'Revoked',       value: 'revoked',     color: 'var(--destructive)', bgColor: 'var(--destructive-light)', icon: 'XCircle', scope: ['credential', 'verification'],                                       order: 19, active: true },
  { id: 'status-suspended',  label: 'Suspended',     value: 'suspended',   color: 'var(--warning)',   bgColor: 'var(--warning-light)', icon: 'Pause',  scope: ['credential', 'user', 'org'],                                                 order: 20, active: true },
  { id: 'status-deactivated', label: 'Deactivated',  value: 'deactivated', color: 'var(--neutral-5)', bgColor: 'var(--muted)', icon: 'UserX',          scope: ['user'],                                                                      order: 21, active: true },
  { id: 'status-void',       label: 'Void',          value: 'void',        color: 'var(--destructive)', bgColor: 'var(--destructive-light)', icon: 'Ban', scope: ['warranty'],                                                             order: 22, active: true },
  { id: 'status-flagged',    label: 'Flagged',       value: 'flagged',     color: 'var(--destructive)', bgColor: 'var(--destructive-light)', icon: 'AlertTriangle', scope: ['product'],                                                    order: 23, active: true },
  { id: 'status-tampered',   label: 'Tampered',      value: 'tampered',    color: 'var(--destructive)', bgColor: 'var(--destructive-light)', icon: 'AlertTriangle', scope: ['verification'],                                               order: 24, active: true },
  { id: 'status-not-found',  label: 'Not Found',     value: 'not_found',   color: 'var(--neutral-6)', bgColor: 'var(--muted)', icon: 'Search',         scope: ['verification'],                                                              order: 25, active: true },
];

// ============================================
// TYPES & FORMATS
// ============================================

const documentTypes: ConfigItem[] = [
  { id: 'doctype-contract',    label: 'Contract',       value: 'contract',    icon: 'FileText',       order: 1,  active: true },
  { id: 'doctype-certificate', label: 'Certificate',    value: 'certificate', icon: 'Award',          order: 2,  active: true },
  { id: 'doctype-invoice',     label: 'Invoice',        value: 'invoice',     icon: 'Receipt',        order: 3,  active: true },
  { id: 'doctype-agreement',   label: 'Agreement',      value: 'agreement',   icon: 'Users',          order: 4,  active: true },
  { id: 'doctype-report',      label: 'Report',         value: 'report',      icon: 'BarChart3',      order: 5,  active: true },
  { id: 'doctype-policy',      label: 'Policy',         value: 'policy',      icon: 'Shield',         order: 6,  active: true },
  { id: 'doctype-license',     label: 'License',        value: 'license',     icon: 'Key',            order: 7,  active: true },
  { id: 'doctype-warranty',    label: 'Warranty Card',  value: 'warranty',    icon: 'ShieldCheck',    order: 8,  active: true },
  { id: 'doctype-transcript',  label: 'Transcript',     value: 'transcript',  icon: 'GraduationCap',  order: 9,  active: true },
  { id: 'doctype-letter',      label: 'Letter',         value: 'letter',      icon: 'Mail',           order: 10, active: true },
];

const templateTypes: ConfigItem[] = [
  { id: 'tpl-invoice',     label: 'Invoice',           value: 'invoice',          icon: 'Receipt',       order: 1,  active: true },
  { id: 'tpl-thermal',     label: 'Thermal Receipt',   value: 'thermal_receipt',  icon: 'Printer',       order: 2,  active: true },
  { id: 'tpl-kot',         label: 'Kitchen Order Ticket', value: 'kot',           icon: 'ChefHat',       order: 3,  active: true },
  { id: 'tpl-tax-invoice', label: 'Tax Invoice',       value: 'tax_invoice',      icon: 'FileText',      order: 4,  active: true },
  { id: 'tpl-experience',  label: 'Experience Letter',  value: 'experience_letter', icon: 'Award',       order: 5,  active: true },
  { id: 'tpl-relieving',   label: 'Relieving Letter',   value: 'relieving_letter', icon: 'FileCheck',    order: 6,  active: true },
  { id: 'tpl-internship',  label: 'Internship Letter',  value: 'internship_letter', icon: 'GraduationCap', order: 7, active: true },
  { id: 'tpl-offer',       label: 'Offer Letter',       value: 'offer_letter',    icon: 'Briefcase',     order: 8,  active: true },
  { id: 'tpl-credential',  label: 'Digital Credential', value: 'credential',       icon: 'Award',        order: 9,  active: true },
  { id: 'tpl-digilabel',   label: 'DigiLabel',         value: 'digilabel',        icon: 'QrCode',        order: 10, active: true },
];

const outputFormats: ConfigItem[] = [
  { id: 'output-pdf',        label: 'PDF',                       value: 'pdf',     icon: 'FileText',  order: 1, active: true },
  { id: 'output-json',       label: 'JSON',                      value: 'json',    icon: 'Braces',    order: 2, active: true },
  { id: 'output-xml',        label: 'XML',                       value: 'xml',     icon: 'Code',      order: 3, active: true },
  { id: 'output-csv',        label: 'CSV',                       value: 'csv',     icon: 'Table',     order: 4, active: true },
  { id: 'output-qr',         label: 'QR Code',                   value: 'qr',      icon: 'QrCode',    order: 5, active: true },
  { id: 'output-badge',      label: 'Digital Badge',             value: 'badge',   icon: 'Award',     order: 6, active: true },
  { id: 'output-verifiable', label: 'Verifiable Credential (W3C)', value: 'vc_w3c', icon: 'Shield',   order: 7, active: true },
];

const signingMethods: ConfigItem[] = [
  { id: 'sign-digital', label: 'Digital Signature',   value: 'digital', icon: 'PenTool', description: 'PKI-based digital signature with certificate chain', order: 1, active: true },
  { id: 'sign-otp',     label: 'OTP Verification',    value: 'otp',     icon: 'Key',     description: 'One-time password sent via email or SMS',             order: 2, active: true },
  { id: 'sign-aadhaar', label: 'Aadhaar eSign',       value: 'aadhaar', icon: 'Shield',  description: 'India Aadhaar-based electronic signature',            order: 3, active: true },
  { id: 'sign-draw',    label: 'Drawn Signature',     value: 'drawn',   icon: 'PenTool', description: 'Canvas-drawn signature capture',                      order: 4, active: true },
  { id: 'sign-upload',  label: 'Uploaded Signature',   value: 'upload',  icon: 'Upload',  description: 'Pre-saved signature image',                          order: 5, active: true },
];

const notificationChannels: ConfigItem[] = [
  { id: 'notif-email',    label: 'Email',    value: 'email',    icon: 'Mail',          description: 'Email notification via SMTP/SES',      order: 1, active: true },
  { id: 'notif-sms',      label: 'SMS',      value: 'sms',      icon: 'MessageSquare', description: 'SMS via Twilio or provider',             order: 2, active: true },
  { id: 'notif-webhook',  label: 'Webhook',  value: 'webhook',  icon: 'Globe',         description: 'HTTP POST to external URL',              order: 3, active: true },
  { id: 'notif-inapp',    label: 'In-App',   value: 'in_app',   icon: 'Bell',          description: 'Platform notification bell',              order: 4, active: true },
  { id: 'notif-whatsapp', label: 'WhatsApp', value: 'whatsapp', icon: 'MessageSquare', description: 'WhatsApp Business API',                  order: 5, active: false },
];

// ============================================
// TAXONOMY
// Categories + Industries merged → Industries
// (both were vertical classifications with overlap)
// Tags remain separate as cross-cutting labels
// ============================================

const industries: ConfigItem[] = [
  { id: 'ind-education',     label: 'Education',            value: 'education',      icon: 'GraduationCap',    order: 1,  active: true },
  { id: 'ind-employment',    label: 'Employment & HR',      value: 'employment',     icon: 'Briefcase',        order: 2,  active: true },
  { id: 'ind-finance',       label: 'Finance & Banking',    value: 'finance',        icon: 'DollarSign',       order: 3,  active: true },
  { id: 'ind-healthcare',    label: 'Healthcare',           value: 'healthcare',     icon: 'Heart',            order: 4,  active: true },
  { id: 'ind-legal',         label: 'Legal',                value: 'legal',          icon: 'Scale',            order: 5,  active: true },
  { id: 'ind-manufacturing', label: 'Manufacturing',        value: 'manufacturing',  icon: 'Factory',          order: 6,  active: true },
  { id: 'ind-supply-chain',  label: 'Supply Chain & Logistics', value: 'supply_chain', icon: 'Truck',          order: 7,  active: true },
  { id: 'ind-government',    label: 'Government',           value: 'government',     icon: 'Landmark',         order: 8,  active: true },
  { id: 'ind-real-estate',   label: 'Real Estate & Hospitality', value: 'real_estate', icon: 'Building',      order: 9,  active: true },
  { id: 'ind-insurance',     label: 'Insurance',            value: 'insurance',      icon: 'ShieldCheck',      order: 10, active: true },
  { id: 'ind-electronics',   label: 'Consumer Electronics', value: 'electronics',    icon: 'Monitor',          order: 11, active: true },
  { id: 'ind-luxury',        label: 'Luxury Goods',         value: 'luxury',         icon: 'Gem',              order: 12, active: true },
  { id: 'ind-pharma',        label: 'Pharmaceuticals',      value: 'pharma',         icon: 'Shield',           order: 13, active: true },
  { id: 'ind-automotive',    label: 'Automotive',           value: 'automotive',     icon: 'Car',              order: 14, active: true },
  { id: 'ind-cosmetics',     label: 'Cosmetics & Beauty',   value: 'cosmetics',      icon: 'Sparkles',        order: 15, active: true },
  { id: 'ind-food',          label: 'Food & Beverage',      value: 'food',           icon: 'UtensilsCrossed',  order: 16, active: true },
];

const tags: ConfigItem[] = [
  { id: 'tag-urgent',        label: 'Urgent',       value: 'urgent',        color: 'var(--destructive)', bgColor: 'var(--destructive-light)', icon: 'AlertTriangle', order: 1,  active: true },
  { id: 'tag-priority',      label: 'Priority',     value: 'priority',      color: 'var(--warning)',      bgColor: 'var(--warning-light)',     icon: 'Flag',          order: 2,  active: true },
  { id: 'tag-reviewed',      label: 'Reviewed',     value: 'reviewed',      color: 'var(--success)',      bgColor: 'var(--success-light)',     icon: 'CheckCircle',   order: 3,  active: true },
  { id: 'tag-confidential',  label: 'Confidential', value: 'confidential',  color: 'var(--neutral-7)',    bgColor: 'var(--muted)',             icon: 'Lock',          order: 4,  active: true },
  { id: 'tag-archived',      label: 'Archived',     value: 'archived',      color: 'var(--neutral-5)',    bgColor: 'var(--muted)',             icon: 'Archive',       order: 5,  active: true },
  { id: 'tag-internal',      label: 'Internal',     value: 'internal',      color: 'var(--neutral-6)',    bgColor: 'var(--muted)',             icon: 'Building2',     order: 6,  active: true },
  { id: 'tag-external',      label: 'External',     value: 'external',      color: 'var(--info)',         bgColor: 'var(--info-light)',        icon: 'Globe',         order: 7,  active: true },
  { id: 'tag-compliance',    label: 'Compliance',   value: 'compliance',    color: 'var(--foreground)',   bgColor: 'var(--muted)',             icon: 'ShieldCheck',   order: 8,  active: true },
  { id: 'tag-template',      label: 'Template',     value: 'template',      color: 'var(--neutral-7)',    bgColor: 'var(--muted)',             icon: 'Copy',          order: 9,  active: true },
];

const scanLocations: ConfigItem[] = [
  { id: 'loc-mumbai',    label: 'Mumbai',    value: 'mumbai',    icon: 'MapPin', order: 1,  active: true },
  { id: 'loc-new-york',  label: 'New York',  value: 'new_york',  icon: 'MapPin', order: 2,  active: true },
  { id: 'loc-london',    label: 'London',    value: 'london',    icon: 'MapPin', order: 3,  active: true },
  { id: 'loc-dubai',     label: 'Dubai',     value: 'dubai',     icon: 'MapPin', order: 4,  active: true },
  { id: 'loc-singapore', label: 'Singapore', value: 'singapore', icon: 'MapPin', order: 5,  active: true },
  { id: 'loc-berlin',    label: 'Berlin',    value: 'berlin',    icon: 'MapPin', order: 6,  active: true },
  { id: 'loc-tokyo',     label: 'Tokyo',     value: 'tokyo',     icon: 'MapPin', order: 7,  active: true },
  { id: 'loc-sydney',    label: 'Sydney',    value: 'sydney',    icon: 'MapPin', order: 8,  active: true },
  { id: 'loc-toronto',   label: 'Toronto',   value: 'toronto',   icon: 'MapPin', order: 9,  active: true },
  { id: 'loc-sao-paulo', label: 'Sao Paulo', value: 'sao_paulo', icon: 'MapPin', order: 10, active: true },
];

// ============================================
// ACCESS & IDENTITY
// Org Roles = hierarchy within multi-tenant org
// Capabilities = what a user can DO on the platform
// (previously "Platform Roles" — renamed to avoid confusion)
// ============================================

const orgRoles: ConfigItem[] = [
  { id: 'orgrole-owner',   label: 'Owner',   value: 'owner',   color: 'var(--primary-foreground)', bgColor: 'var(--primary)', icon: 'Crown',  description: 'Full organization control. Can transfer ownership, delete org, manage billing.', order: 1, active: true },
  { id: 'orgrole-admin',   label: 'Admin',   value: 'admin',   color: 'var(--foreground)',         bgColor: 'var(--muted)',   icon: 'Shield', description: 'Manage teams, users, settings, and all platform features.',                      order: 2, active: true },
  { id: 'orgrole-manager', label: 'Manager', value: 'manager', color: 'var(--foreground)',         bgColor: 'var(--muted)',   icon: 'Users',  description: 'Manage team members, issue credentials, approve documents.',                     order: 3, active: true },
  { id: 'orgrole-member',  label: 'Member',  value: 'member',  color: 'var(--muted-foreground)',   bgColor: 'var(--muted)',   icon: 'User',   description: 'Issue credentials, certify documents, manage own content.',                       order: 4, active: true },
  { id: 'orgrole-viewer',  label: 'Viewer',  value: 'viewer',  color: 'var(--muted-foreground)',   bgColor: 'var(--muted)',   icon: 'Eye',    description: 'Read-only access to dashboards and verification.',                               order: 5, active: true },
];

const capabilities: ConfigItem[] = [
  { id: 'cap-issue',   label: 'Issuer',    value: 'issuer',    icon: 'Award',   description: 'Can issue credentials and certificates',     order: 1, active: true },
  { id: 'cap-sign',    label: 'Signer',    value: 'signer',    icon: 'PenTool', description: 'Can digitally sign documents',                order: 2, active: true },
  { id: 'cap-receive', label: 'Recipient', value: 'recipient', icon: 'User',    description: 'Can receive and hold credentials',            order: 3, active: true },
  { id: 'cap-verify',  label: 'Verifier',  value: 'verifier',  icon: 'Search',  description: 'Can verify credential authenticity',          order: 4, active: true },
  { id: 'cap-approve', label: 'Approver',  value: 'approver',  icon: 'CheckSquare', description: 'Can approve documents and workflows',     order: 5, active: true },
  { id: 'cap-audit',   label: 'Auditor',   value: 'auditor',   icon: 'Eye',     description: 'Can view audit trails and compliance logs',   order: 6, active: true },
];

const orgPlans: ConfigItem[] = [
  { id: 'plan-free',       label: 'Free',       value: 'free',       color: 'var(--muted-foreground)',   bgColor: 'var(--muted)',   icon: 'Zap',       order: 1, active: true },
  { id: 'plan-pro',        label: 'Pro',        value: 'pro',        color: 'var(--foreground)',         bgColor: 'var(--muted)',   icon: 'Rocket',    order: 2, active: true },
  { id: 'plan-enterprise', label: 'Enterprise', value: 'enterprise', color: 'var(--primary-foreground)', bgColor: 'var(--primary)', icon: 'Building2', order: 3, active: true },
];

const complianceStandards: ConfigItem[] = [
  { id: 'comp-gdpr',     label: 'GDPR',      value: 'gdpr',     icon: 'Shield',      description: 'EU General Data Protection Regulation',              order: 1, active: true },
  { id: 'comp-soc2',     label: 'SOC 2',     value: 'soc2',     icon: 'ShieldCheck', description: 'Service Organization Control Type 2',                 order: 2, active: true },
  { id: 'comp-iso27001', label: 'ISO 27001', value: 'iso27001', icon: 'Award',       description: 'Information Security Management System',              order: 3, active: true },
  { id: 'comp-hipaa',    label: 'HIPAA',     value: 'hipaa',    icon: 'Heart',       description: 'Health Insurance Portability and Accountability Act',  order: 4, active: false },
  { id: 'comp-pci',      label: 'PCI DSS',   value: 'pci_dss',  icon: 'CreditCard', description: 'Payment Card Industry Data Security Standard',         order: 5, active: false },
  { id: 'comp-dpdp',     label: 'DPDP Act',  value: 'dpdp',     icon: 'Shield',      description: 'India Digital Personal Data Protection Act',          order: 6, active: true },
];

// ============================================
// INFRASTRUCTURE
// ============================================

const blockchainNetworks: ConfigItem[] = [
  { id: 'chain-ethereum',    label: 'Ethereum',           value: 'ethereum',    icon: 'Hexagon', order: 1, active: true },
  { id: 'chain-polygon',     label: 'Polygon',            value: 'polygon',     icon: 'Hexagon', order: 2, active: true },
  { id: 'chain-hyperledger', label: 'Hyperledger Fabric', value: 'hyperledger', icon: 'Hexagon', order: 3, active: true },
  { id: 'chain-solana',      label: 'Solana',             value: 'solana',      icon: 'Hexagon', order: 4, active: false },
];

const integrationTypes: ConfigItem[] = [
  { id: 'int-webhook',  label: 'Webhook',    value: 'webhook',  icon: 'Globe', description: 'Push events to external URLs',          order: 1, active: true },
  { id: 'int-rest-api', label: 'REST API',   value: 'rest_api', icon: 'Code',  description: 'Standard RESTful API integration',      order: 2, active: true },
  { id: 'int-oauth',    label: 'OAuth 2.0',  value: 'oauth',    icon: 'Key',   description: 'OAuth authorization flow',              order: 3, active: true },
  { id: 'int-saml',     label: 'SAML SSO',   value: 'saml',     icon: 'Lock',  description: 'SAML-based single sign-on',             order: 4, active: true },
  { id: 'int-zapier',   label: 'Zapier',     value: 'zapier',   icon: 'Zap',   description: 'Zapier automation connector',           order: 5, active: false },
];

// ============================================
// CONFIG STORE (in-memory, persists via state)
// ============================================

export const defaultConfig: ConfigCategory[] = [
  // ── Statuses (unified — ONE list, scoped per module) ──
  { id: 'statuses', label: 'Statuses', description: 'Unified status values recycled across all modules (credential, document, warranty, product, user, org, verification)', icon: 'CircleDot', group: 'statuses', items: statuses },

  // ── Types & Formats ──
  { id: 'document-types',       label: 'Document Types',       description: 'Types of documents the platform handles',                icon: 'Files',    group: 'types', items: documentTypes },
  { id: 'template-types',       label: 'Template Types',       description: 'Available document and receipt template formats',         icon: 'FileText', group: 'types', items: templateTypes },
  { id: 'output-formats',       label: 'Output Formats',       description: 'Credential and document export formats',                 icon: 'Download', group: 'types', items: outputFormats },
  { id: 'signing-methods',      label: 'Signing Methods',      description: 'Document and credential signing options',                icon: 'PenTool',  group: 'types', items: signingMethods },
  { id: 'notification-channels', label: 'Notification Channels', description: 'Communication channels for alerts and notifications', icon: 'Bell',     group: 'types', items: notificationChannels },

  // ── Taxonomy ──
  { id: 'industries',      label: 'Industries',      description: 'Industry verticals for platform segmentation (merged from old categories + industries)', icon: 'Building2',  group: 'taxonomy', items: industries },
  { id: 'tags',            label: 'Tags',            description: 'Cross-cutting labels for organizing credentials, documents, and products',              icon: 'Tag',        group: 'taxonomy', items: tags },
  { id: 'scan-locations',  label: 'Scan Locations',  description: 'Geographic locations tracked in verification analytics',                               icon: 'MapPin',     group: 'taxonomy', items: scanLocations },

  // ── Access & Identity ──
  { id: 'org-roles',            label: 'User Roles',           description: 'Hierarchy roles within multi-tenant orgs (owner > admin > manager > member > viewer)', icon: 'Network',     group: 'access', items: orgRoles },
  { id: 'capabilities',         label: 'Capabilities',         description: 'Functional capabilities assignable to users (issue, sign, verify, approve, audit)',   icon: 'Puzzle',      group: 'access', items: capabilities },
  { id: 'org-plans',            label: 'Organization Plans',   description: 'Subscription tier definitions',                                                       icon: 'CreditCard',  group: 'access', items: orgPlans },
  { id: 'compliance-standards', label: 'Compliance Standards', description: 'Regulatory frameworks the platform adheres to',                                       icon: 'ShieldCheck', group: 'access', items: complianceStandards },

  // ── Infrastructure ──
  { id: 'blockchain-networks', label: 'Blockchain Networks', description: 'Supported blockchain anchoring networks',   icon: 'Hexagon', group: 'infra', items: blockchainNetworks },
  { id: 'integration-types',  label: 'Integration Types',  description: 'Available third-party integration methods',   icon: 'Plug',    group: 'infra', items: integrationTypes },
];

// ============================================
// HELPER: lookup functions used by components
// ============================================

export function getConfigItems(config: ConfigCategory[], categoryId: string): ConfigItem[] {
  // Backward compat: legacy per-module status IDs redirect to unified 'statuses'
  const resolvedId = categoryId.endsWith('-statuses') ? 'statuses' : categoryId;
  const category = config.find(c => c.id === resolvedId);
  if (!category) return [];
  let items = category.items.filter(i => i.active).sort((a, b) => a.order - b.order);
  // If requesting a scoped subset of statuses, filter by scope
  if (categoryId !== resolvedId && resolvedId === 'statuses') {
    const scope = categoryId.replace('-statuses', '');
    items = items.filter(i => i.scope?.includes(scope));
  }
  return items;
}

export function getConfigItem(config: ConfigCategory[], categoryId: string, value: string): ConfigItem | undefined {
  const items = getConfigItems(config, categoryId);
  return items.find(i => i.value === value);
}

/**
 * Get status items filtered by scope.
 * Since statuses are now unified, components filter by scope:
 *   getStatusesByScope(config, 'credential') → only statuses with 'credential' in scope
 */
export function getStatusesByScope(config: ConfigCategory[], scope: string): ConfigItem[] {
  const allStatuses = getConfigItems(config, 'statuses');
  return allStatuses.filter(s => s.scope?.includes(scope));
}

export function getStatusStyle(config: ConfigCategory[], categoryId: string, value: string): { color: string; bgColor: string; label: string; icon?: string } {
  // For backward compat: if categoryId is a legacy per-module status ID, redirect to unified 'statuses'
  const resolvedCategoryId = categoryId.endsWith('-statuses') ? 'statuses' : categoryId;
  const item = getConfigItem(config, resolvedCategoryId, value);
  return {
    color: item?.color || 'var(--neutral-6)',
    bgColor: item?.bgColor || 'var(--muted)',
    label: item?.label || value,
    icon: item?.icon,
  };
}