import React, { useState } from 'react';
import {
  Plug, CheckCircle, XCircle, AlertTriangle, ExternalLink, Key, RefreshCw,
  TrendingUp, Clock, Zap, Shield, Database, Mail, CreditCard, MessageSquare,
  Cloud, Webhook, Plus, ArrowLeft, ArrowRight, Loader2, X, Eye, EyeOff,
  Settings, Copy, Check,
} from 'lucide-react';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface Integration {
  id: string;
  name: string;
  category: 'blockchain' | 'storage' | 'communication' | 'payment' | 'analytics' | 'infrastructure';
  status: 'active' | 'inactive' | 'error' | 'degraded';
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  apiKeyConfigured: boolean;
  lastSync?: string;
  uptime?: string;
  requestsToday?: number;
  monthlyLimit?: number;
  documentation?: string;
  purpose: string;
  setupFields?: SetupField[];
}

interface SetupField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  placeholder: string;
  required: boolean;
  options?: string[];
  helpText?: string;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--input-background)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
};

// ────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────

const defaultSetupFields: SetupField[] = [
  { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your API key', required: true },
  { key: 'endpoint', label: 'Endpoint URL', type: 'url', placeholder: 'https://api.example.com', required: false, helpText: 'Leave blank for default endpoint' },
];

const integrations: Integration[] = [
  {
    id: 'ethereum', name: 'Ethereum', category: 'blockchain', status: 'active',
    description: 'Primary blockchain for document certification', icon: Shield,
    apiKeyConfigured: true, lastSync: '2 minutes ago', uptime: '99.98%',
    requestsToday: 1247, monthlyLimit: 50000,
    documentation: 'https://ethereum.org/developers',
    purpose: 'Document hashing and smart contract interactions',
    setupFields: [
      { key: 'rpc_url', label: 'RPC Endpoint', type: 'url', placeholder: 'https://mainnet.infura.io/v3/YOUR_KEY', required: true },
      { key: 'api_key', label: 'Infura / Alchemy API Key', type: 'password', placeholder: 'Enter project key', required: true },
      { key: 'network', label: 'Network', type: 'select', placeholder: 'Select network', required: true, options: ['Mainnet', 'Sepolia', 'Goerli'] },
      { key: 'contract_address', label: 'Smart Contract Address', type: 'text', placeholder: '0x...', required: false, helpText: 'DocWeb certification contract' },
    ],
  },
  {
    id: 'polygon', name: 'Polygon', category: 'blockchain', status: 'active',
    description: 'Layer 2 solution for cost-effective transactions', icon: Zap,
    apiKeyConfigured: true, lastSync: '5 minutes ago', uptime: '99.95%',
    requestsToday: 3421, monthlyLimit: 100000,
    documentation: 'https://polygon.technology/developers',
    purpose: 'High-volume document certification at lower cost',
    setupFields: [
      { key: 'rpc_url', label: 'RPC Endpoint', type: 'url', placeholder: 'https://polygon-rpc.com', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter API key', required: true },
      { key: 'network', label: 'Network', type: 'select', placeholder: 'Select network', required: true, options: ['Mainnet', 'Mumbai Testnet'] },
    ],
  },
  {
    id: 'ipfs', name: 'IPFS', category: 'storage', status: 'active',
    description: 'Decentralized storage for document metadata', icon: Database,
    apiKeyConfigured: true, lastSync: '1 minute ago', uptime: '99.92%',
    requestsToday: 892, monthlyLimit: 25000,
    documentation: 'https://docs.ipfs.io',
    purpose: 'Permanent storage of document hashes and metadata',
    setupFields: [
      { key: 'gateway_url', label: 'IPFS Gateway URL', type: 'url', placeholder: 'https://gateway.pinata.cloud', required: true },
      { key: 'api_key', label: 'Pinata API Key', type: 'password', placeholder: 'Enter Pinata API key', required: true },
      { key: 'api_secret', label: 'Pinata Secret', type: 'password', placeholder: 'Enter Pinata secret', required: true },
    ],
  },
  {
    id: 'aws-s3', name: 'AWS S3', category: 'storage', status: 'active',
    description: 'Cloud storage for encrypted documents', icon: Cloud,
    apiKeyConfigured: true, lastSync: '10 seconds ago', uptime: '99.99%',
    requestsToday: 2156, monthlyLimit: 1000000,
    documentation: 'https://docs.aws.amazon.com/s3',
    purpose: 'Encrypted document storage and retrieval',
    setupFields: [
      { key: 'access_key', label: 'AWS Access Key ID', type: 'password', placeholder: 'AKIA...', required: true },
      { key: 'secret_key', label: 'AWS Secret Access Key', type: 'password', placeholder: 'Enter secret key', required: true },
      { key: 'bucket', label: 'S3 Bucket Name', type: 'text', placeholder: 'docweb-documents', required: true },
      { key: 'region', label: 'AWS Region', type: 'select', placeholder: 'Select region', required: true, options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] },
    ],
  },
  {
    id: 'sendgrid', name: 'SendGrid', category: 'communication', status: 'active',
    description: 'Email delivery service', icon: Mail,
    apiKeyConfigured: true, lastSync: '3 minutes ago', uptime: '99.97%',
    requestsToday: 456, monthlyLimit: 10000,
    documentation: 'https://docs.sendgrid.com',
    purpose: 'Transactional emails and notifications',
    setupFields: [
      { key: 'api_key', label: 'SendGrid API Key', type: 'password', placeholder: 'SG.xxxxxxxx', required: true },
      { key: 'from_email', label: 'From Email', type: 'text', placeholder: 'noreply@docweb.io', required: true },
      { key: 'from_name', label: 'From Name', type: 'text', placeholder: 'DocWeb', required: false },
    ],
  },
  {
    id: 'twilio', name: 'Twilio', category: 'communication', status: 'degraded',
    description: 'SMS and voice notifications', icon: MessageSquare,
    apiKeyConfigured: true, lastSync: '15 minutes ago', uptime: '98.5%',
    requestsToday: 89, monthlyLimit: 5000,
    documentation: 'https://www.twilio.com/docs',
    purpose: 'SMS alerts for critical events',
  },
  {
    id: 'slack', name: 'Slack', category: 'communication', status: 'active',
    description: 'Team notifications and webhooks', icon: MessageSquare,
    apiKeyConfigured: true, lastSync: '1 minute ago', uptime: '99.9%',
    requestsToday: 234, monthlyLimit: 50000,
    documentation: 'https://api.slack.com',
    purpose: 'Internal team notifications and alerts',
    setupFields: [
      { key: 'webhook_url', label: 'Slack Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/T.../B.../xxx', required: true },
      { key: 'channel', label: 'Default Channel', type: 'text', placeholder: '#docweb-alerts', required: false },
    ],
  },
  {
    id: 'stripe', name: 'Stripe', category: 'payment', status: 'active',
    description: 'Payment processing', icon: CreditCard,
    apiKeyConfigured: true, lastSync: '2 minutes ago', uptime: '99.99%',
    requestsToday: 178, monthlyLimit: 100000,
    documentation: 'https://stripe.com/docs',
    purpose: 'Subscription management and payment processing',
    setupFields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
      { key: 'webhook_secret', label: 'Webhook Signing Secret', type: 'password', placeholder: 'whsec_...', required: true },
      { key: 'mode', label: 'Mode', type: 'select', placeholder: 'Select', required: true, options: ['Live', 'Test'] },
    ],
  },
  {
    id: 'google-analytics', name: 'Google Analytics', category: 'analytics', status: 'active',
    description: 'User behavior and traffic analytics', icon: TrendingUp,
    apiKeyConfigured: true, lastSync: '5 minutes ago', uptime: '99.95%',
    requestsToday: 5432, monthlyLimit: 10000000,
    documentation: 'https://developers.google.com/analytics',
    purpose: 'User analytics and conversion tracking',
  },
  {
    id: 'datadog', name: 'Datadog', category: 'infrastructure', status: 'active',
    description: 'Infrastructure monitoring and logging', icon: TrendingUp,
    apiKeyConfigured: true, lastSync: '1 minute ago', uptime: '99.98%',
    requestsToday: 8765, monthlyLimit: 1000000,
    documentation: 'https://docs.datadoghq.com',
    purpose: 'System monitoring, logging, and APM',
  },
  {
    id: 'sentry', name: 'Sentry', category: 'infrastructure', status: 'active',
    description: 'Error tracking and monitoring', icon: AlertTriangle,
    apiKeyConfigured: true, lastSync: '30 seconds ago', uptime: '99.95%',
    requestsToday: 432, monthlyLimit: 50000,
    documentation: 'https://docs.sentry.io',
    purpose: 'Application error tracking and debugging',
    setupFields: [
      { key: 'dsn', label: 'Sentry DSN', type: 'url', placeholder: 'https://xxx@sentry.io/xxx', required: true },
      { key: 'environment', label: 'Environment', type: 'select', placeholder: 'Select', required: true, options: ['Production', 'Staging', 'Development'] },
    ],
  },
  {
    id: 'cloudflare', name: 'Cloudflare', category: 'infrastructure', status: 'active',
    description: 'CDN and DDoS protection', icon: Shield,
    apiKeyConfigured: true, lastSync: '30 seconds ago', uptime: '100%',
    requestsToday: 15432, monthlyLimit: 5000000,
    documentation: 'https://developers.cloudflare.com',
    purpose: 'Content delivery, caching, and security',
  },
  {
    id: 'webhook-relay', name: 'Webhook Relay', category: 'infrastructure', status: 'inactive',
    description: 'Webhook forwarding for development', icon: Webhook,
    apiKeyConfigured: false, purpose: 'Development webhook testing (planned)',
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'storage', label: 'Storage' },
  { id: 'communication', label: 'Communication' },
  { id: 'payment', label: 'Payment' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'infrastructure', label: 'Infrastructure' },
];

// ────────────────────────────────────────────
// Setup Wizard
// ────────────────────────────────────────────

function SetupWizard({ integration, onClose, onComplete }: {
  integration: Integration;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [activating, setActivating] = useState(false);

  const fields = integration.setupFields || defaultSetupFields;
  const IntegrationIcon = integration.icon;

  const totalSteps = 4; // Configure → Test → Options → Activate

  const toggleFieldVisibility = (key: string) => {
    setVisibleFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const allRequiredFilled = fields.filter(f => f.required).every(f => fieldValues[f.key]?.trim());

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1500));
    setTesting(false);
    setTestResult(Math.random() > 0.15 ? 'success' : 'error');
  };

  const handleActivate = async () => {
    setActivating(true);
    await new Promise(r => setTimeout(r, 1200));
    setActivating(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
              <IntegrationIcon className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <h4 style={{ color: 'var(--foreground)' }}>Setup {integration.name}</h4>
              <p style={{ color: 'var(--muted-foreground)' }}>Step {step} of {totalSteps}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 transition-opacity hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          {['Configure', 'Test', 'Options', 'Activate'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 flex items-center justify-center"
                  style={{
                    backgroundColor: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'var(--muted)',
                    color: step >= i + 1 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {step > i + 1 ? <Check className="w-3 h-3" /> : <span style={{ fontSize: '11px' }}>{i + 1}</span>}
                </div>
                <span style={{ color: step === i + 1 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{label}</span>
              </div>
              {i < 3 && <div className="flex-1 h-px" style={{ backgroundColor: step > i + 1 ? 'var(--success)' : 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="p-6">
          {/* ═══ Step 1: Configure credentials ═══ */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 px-4 py-3" style={{ backgroundColor: 'var(--info-light)', borderRadius: 'var(--radius-md)', color: 'var(--info)' }}>
                <Key className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Enter the API credentials from your {integration.name} account. These will be encrypted and stored securely.</p>
              </div>
              {fields.map(field => (
                <div key={field.key}>
                  <label style={{ color: 'var(--foreground)', display: 'block', marginBottom: '4px' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--destructive)' }}>*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={fieldValues[field.key] || ''}
                      onChange={e => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type={field.type === 'password' && !visibleFields.has(field.key) ? 'password' : 'text'}
                        value={fieldValues[field.key] || ''}
                        onChange={e => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={{ ...inputStyle, paddingRight: field.type === 'password' ? '40px' : '14px' }}
                      />
                      {field.type === 'password' && (
                        <button
                          onClick={() => toggleFieldVisibility(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {visibleFields.has(field.key) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  )}
                  {field.helpText && <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>{field.helpText}</small>}
                </div>
              ))}
            </div>
          )}

          {/* ═══ Step 2: Test connection ═══ */}
          {step === 2 && (
            <div className="space-y-5 text-center py-6">
              <div className="w-16 h-16 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-full)' }}>
                <Zap className="w-8 h-8" style={{ color: 'var(--foreground)' }} />
              </div>
              <h4 style={{ color: 'var(--foreground)' }}>Test Your Connection</h4>
              <p style={{ color: 'var(--muted-foreground)' }}>
                We'll ping {integration.name} with the credentials you provided to verify everything works.
              </p>

              {testResult === 'success' && (
                <div className="flex items-center gap-2 justify-center px-4 py-3 mx-auto w-fit" style={{ backgroundColor: 'var(--success-light)', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
                  <CheckCircle className="w-4 h-4" />
                  <span>Connection successful! Latency: 42ms</span>
                </div>
              )}
              {testResult === 'error' && (
                <div className="flex items-center gap-2 justify-center px-4 py-3 mx-auto w-fit" style={{ backgroundColor: 'var(--destructive-light)', borderRadius: 'var(--radius-md)', color: 'var(--destructive)' }}>
                  <XCircle className="w-4 h-4" />
                  <span>Connection failed. Check your credentials and try again.</span>
                </div>
              )}

              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-2.5 mx-auto transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-md)' }}
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{testing ? 'Testing...' : testResult ? 'Re-test' : 'Test Connection'}</span>
              </button>
            </div>
          )}

          {/* ═══ Step 3: Configuration options ═══ */}
          {step === 3 && (
            <div className="space-y-5">
              <h4 style={{ color: 'var(--foreground)', marginBottom: '4px' }}>Additional Options</h4>
              <p style={{ color: 'var(--muted-foreground)' }}>Configure how DocWeb interacts with {integration.name}.</p>

              <div className="space-y-3">
                {[
                  { label: 'Enable automatic retries', desc: 'Retry failed requests up to 3 times', default: true },
                  { label: 'Log all API requests', desc: 'Record every request for audit purposes', default: true },
                  { label: 'Rate limit protection', desc: 'Automatically throttle when approaching limits', default: true },
                  { label: 'Webhook notifications', desc: 'Send alerts on connection failures', default: false },
                ].map((opt, i) => (
                  <label key={i} className="flex items-start gap-3 px-4 py-3 cursor-pointer" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
                    <input type="checkbox" defaultChecked={opt.default} style={{ accentColor: 'var(--primary)', marginTop: '3px' }} />
                    <div>
                      <p style={{ color: 'var(--foreground)' }}>{opt.label}</p>
                      <small style={{ color: 'var(--muted-foreground)' }}>{opt.desc}</small>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Step 4: Activate ═══ */}
          {step === 4 && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--success-light)', borderRadius: 'var(--radius-full)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: 'var(--success)' }} />
              </div>
              <h4 style={{ color: 'var(--foreground)' }}>Ready to Activate</h4>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {integration.name} is configured and tested. Activate to start using it across DocWeb.
              </p>

              {/* Summary */}
              <div className="text-left space-y-2 px-4 py-3" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
                {Object.entries(fieldValues).filter(([_, v]) => v).map(([key, value]) => {
                  const field = fields.find(f => f.key === key);
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span style={{ color: 'var(--muted-foreground)' }}>{field?.label || key}</span>
                      <code style={{ color: 'var(--foreground)' }}>
                        {field?.type === 'password' ? '••••••••' : value}
                      </code>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleActivate}
                disabled={activating}
                className="flex items-center gap-2 px-6 py-2.5 mx-auto transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-md)' }}
              >
                {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                <span>{activating ? 'Activating...' : 'Activate Integration'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-2 px-4 py-2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" /><span>{step > 1 ? 'Back' : 'Cancel'}</span>
          </button>
          {step < 4 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !allRequiredFilled}
              className="flex items-center gap-2 px-4 py-2 transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-md)' }}
            >
              <span>Next</span><ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────

export function AdminIntegrations() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [setupIntegration, setSetupIntegration] = useState<Integration | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const filtered = selectedCategory === 'all'
    ? integrations
    : integrations.filter(i => i.category === selectedCategory);

  const getStatus = (integration: Integration) => localStatuses[integration.id] || integration.status;

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'degraded': return 'var(--warning)';
      case 'error': return 'var(--destructive)';
      default: return 'var(--muted-foreground)';
    }
  };

  const StatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'error': return XCircle;
      default: return XCircle;
    }
  };

  const stats = {
    total: integrations.length,
    active: integrations.filter(i => getStatus(i) === 'active').length,
    degraded: integrations.filter(i => getStatus(i) === 'degraded').length,
    inactive: integrations.filter(i => getStatus(i) === 'inactive').length,
    requests: integrations.reduce((s, i) => s + (i.requestsToday || 0), 0),
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 style={{ color: 'var(--foreground)' }}>Third-Party Integrations</h2>
          <p style={{ color: 'var(--muted-foreground)' }} className="mt-1">Manage, configure, and monitor all external service connections</p>
        </div>
        <button
          onClick={() => setSetupIntegration(integrations.find(i => i.status === 'inactive') || integrations[0])}
          className="flex items-center gap-2 px-5 py-2.5 transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-md)' }}
        >
          <Plus className="w-4 h-4" /><span>Add Integration</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: Plug, color: 'var(--foreground)' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'var(--success)' },
          { label: 'Degraded', value: stats.degraded, icon: AlertTriangle, color: 'var(--warning)' },
          { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'var(--muted-foreground)' },
          { label: 'Requests Today', value: stats.requests.toLocaleString(), icon: TrendingUp, color: 'var(--foreground)' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4" style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <small style={{ color: 'var(--muted-foreground)' }}>{s.label}</small>
              </div>
              <h3 style={{ color: 'var(--foreground)' }}>{s.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 flex-wrap">
        {categories.map(cat => {
          const count = cat.id === 'all' ? integrations.length : integrations.filter(i => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="px-3 py-1.5 transition-all"
              style={{
                backgroundColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--muted)',
                color: selectedCategory === cat.id ? 'var(--primary-foreground)' : 'var(--foreground)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <span>{cat.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Integration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(integration => {
          const status = getStatus(integration);
          const SIcon = StatusIcon(status);
          const IntIcon = integration.icon;
          return (
            <div
              key={integration.id}
              className="p-5"
              style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
                    <IntIcon className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--foreground)' }}>{integration.name}</h4>
                    <p style={{ color: 'var(--muted-foreground)' }}>{integration.description}</p>
                  </div>
                </div>
                <SIcon className="w-4 h-4 flex-shrink-0" style={{ color: statusColor(status) }} />
              </div>

              {/* Purpose */}
              <div className="px-3 py-2 mb-3" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--foreground)' }}>{integration.purpose}</p>
              </div>

              {/* Metrics */}
              {integration.uptime && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <small style={{ color: 'var(--muted-foreground)' }}>Uptime</small>
                    <p style={{ color: 'var(--foreground)' }}>{integration.uptime}</p>
                  </div>
                  <div>
                    <small style={{ color: 'var(--muted-foreground)' }}>Last Sync</small>
                    <p style={{ color: 'var(--foreground)' }}>{integration.lastSync}</p>
                  </div>
                  <div>
                    <small style={{ color: 'var(--muted-foreground)' }}>Requests</small>
                    <p style={{ color: 'var(--foreground)' }}>{integration.requestsToday?.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Usage bar */}
              {integration.monthlyLimit && integration.requestsToday != null && (
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <small style={{ color: 'var(--muted-foreground)' }}>Monthly Usage</small>
                    <small style={{ color: 'var(--muted-foreground)' }}>
                      {((integration.requestsToday / integration.monthlyLimit) * 100).toFixed(1)}%
                    </small>
                  </div>
                  <div className="h-1.5 overflow-hidden" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-full)' }}>
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min((integration.requestsToday / integration.monthlyLimit) * 100, 100)}%`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setSetupIntegration(integration)}
                  className="flex items-center gap-1.5 px-3 py-2 flex-1 justify-center transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: integration.apiKeyConfigured ? 'var(--muted)' : 'var(--primary)',
                    color: integration.apiKeyConfigured ? 'var(--foreground)' : 'var(--primary-foreground)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {integration.apiKeyConfigured ? <Settings className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{integration.apiKeyConfigured ? 'Configure' : 'Setup'}</span>
                </button>
                <button className="p-2 transition-opacity hover:opacity-70" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)', color: 'var(--foreground)' }} title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
                {integration.documentation && (
                  <a
                    href={integration.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 transition-opacity hover:opacity-70"
                    style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)', color: 'var(--foreground)' }}
                    title="Docs"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dependency map */}
      <div className="mt-8 p-6" style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)' }}>
        <h4 style={{ color: 'var(--foreground)', marginBottom: '16px' }}>Integration Dependencies Map</h4>
        <div className="space-y-3">
          {[
            { label: 'Critical Path — Document Certification', color: 'var(--destructive)', impact: 'HIGH', chain: ['User Upload', 'AWS S3', 'Ethereum/Polygon', 'IPFS', 'SendGrid'] },
            { label: 'Monitoring Stack', color: 'var(--warning)', impact: 'MEDIUM', chain: ['Application Events', 'Datadog', 'Sentry', 'Slack'] },
            { label: 'Payment & Billing', color: 'var(--success)', impact: 'MEDIUM', chain: ['User Subscription', 'Stripe', 'SendGrid'] },
          ].map(dep => (
            <div key={dep.label} className="px-4 py-3" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5" style={{ backgroundColor: dep.color, borderRadius: 'var(--radius-full)' }} />
                <h4 style={{ color: 'var(--foreground)' }}>{dep.label}</h4>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {dep.chain.map((node, i) => (
                  <React.Fragment key={node}>
                    <span className="px-3 py-1.5 whitespace-nowrap" style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-sm)', color: 'var(--foreground)' }}>{node}</span>
                    {i < dep.chain.length - 1 && <span style={{ color: 'var(--muted-foreground)' }}>→</span>}
                  </React.Fragment>
                ))}
              </div>
              <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>Failure Impact: {dep.impact}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Wizard */}
      {setupIntegration && (
        <SetupWizard
          integration={setupIntegration}
          onClose={() => setSetupIntegration(null)}
          onComplete={() => {
            setLocalStatuses(prev => ({ ...prev, [setupIntegration.id]: 'active' }));
            setSetupIntegration(null);
          }}
        />
      )}
    </div>
  );
}
