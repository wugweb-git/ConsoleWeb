import React, { useState } from 'react';
import {
  BookOpen, Copy, CheckCircle, ExternalLink, BarChart3, Play,
  ChevronDown, ChevronRight, Loader2, Code2, Send, ArrowRight,
} from 'lucide-react';

// ────────────────────────────────────────────
// API Endpoint definitions (expanded)
// ────────────────────────────────────────────

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  category: string;
  requestBody?: string;
  responseExample: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
}

const apiEndpoints: APIEndpoint[] = [
  {
    id: 'create-cred', method: 'POST', path: '/api/v1/credentials', summary: 'Create a new credential', category: 'Credentials',
    description: 'Issue a new verifiable credential based on a schema. The credential will be in "draft" status until explicitly issued.',
    requestBody: JSON.stringify({ schema_id: 'schema-001', subject: { name: 'John Doe', email: 'john@example.com' }, attributes: { degree: 'Bachelor of Science', institution: 'MIT', gpa: 3.9 } }, null, 2),
    responseExample: JSON.stringify({ id: 'cred-abc123', schema_id: 'schema-001', status: 'draft', subject: { name: 'John Doe', email: 'john@example.com' }, created_at: '2026-03-17T10:00:00Z' }, null, 2),
    params: [],
  },
  {
    id: 'get-cred', method: 'GET', path: '/api/v1/credentials/:id', summary: 'Retrieve a credential', category: 'Credentials',
    description: 'Fetch a single credential by ID including all attributes, subject info, and blockchain proof.',
    requestBody: undefined,
    responseExample: JSON.stringify({ id: 'cred-abc123', schema_id: 'schema-001', status: 'issued', blockchain_hash: '0xabc...def', subject: { name: 'John Doe' }, issued_at: '2026-03-17T10:00:00Z' }, null, 2),
    params: [{ name: 'id', type: 'string', required: true, description: 'Credential ID' }],
  },
  {
    id: 'verify-cred', method: 'POST', path: '/api/v1/credentials/:id/verify', summary: 'Verify a credential', category: 'Credentials',
    description: 'Verify a credential\'s authenticity by checking its blockchain hash, status, and issuer signature.',
    requestBody: JSON.stringify({ verification_method: 'full', include_proof: true }, null, 2),
    responseExample: JSON.stringify({ verified: true, status: 'valid', checks: { signature: true, blockchain: true, not_revoked: true, not_expired: true }, verified_at: '2026-03-17T10:05:00Z' }, null, 2),
    params: [{ name: 'id', type: 'string', required: true, description: 'Credential ID to verify' }],
  },
  {
    id: 'revoke-cred', method: 'DELETE', path: '/api/v1/credentials/:id', summary: 'Revoke a credential', category: 'Credentials',
    description: 'Permanently revoke a credential. This is irreversible and will be reflected on blockchain.',
    requestBody: JSON.stringify({ reason: 'Certificate was issued in error' }, null, 2),
    responseExample: JSON.stringify({ id: 'cred-abc123', status: 'revoked', revoked_at: '2026-03-17T10:10:00Z' }, null, 2),
    params: [{ name: 'id', type: 'string', required: true, description: 'Credential ID to revoke' }],
  },
  {
    id: 'upload-doc', method: 'POST', path: '/api/v1/documents', summary: 'Upload a document', category: 'Documents',
    description: 'Upload a new document for certification or signing. Supports PDF, DOCX, and image files up to 50MB.',
    requestBody: JSON.stringify({ title: 'Service Agreement Q2', file_url: 'https://storage.docweb.io/docs/agreement.pdf', organization_id: 'org-001' }, null, 2),
    responseExample: JSON.stringify({ id: 'doc-xyz789', title: 'Service Agreement Q2', status: 'draft', sha256_hash: 'e3b0c44298fc...', created_at: '2026-03-17T10:00:00Z' }, null, 2),
    params: [],
  },
  {
    id: 'get-doc', method: 'GET', path: '/api/v1/documents/:id', summary: 'Retrieve a document', category: 'Documents',
    description: 'Fetch document metadata, certification status, and version history.',
    requestBody: undefined,
    responseExample: JSON.stringify({ id: 'doc-xyz789', title: 'Service Agreement Q2', status: 'certified', versions: 3, sha256_hash: 'e3b0c44298fc...' }, null, 2),
    params: [{ name: 'id', type: 'string', required: true, description: 'Document ID' }],
  },
  {
    id: 'create-signing', method: 'POST', path: '/api/v1/signing/request', summary: 'Create signing request', category: 'Signing',
    description: 'Initiate a document signing workflow with one or more signers.',
    requestBody: JSON.stringify({ document_id: 'doc-xyz789', signers: [{ email: 'ceo@acme.com', name: 'Jane Smith', order: 1 }], workflow: 'sequential', deadline: '2026-03-24T23:59:59Z' }, null, 2),
    responseExample: JSON.stringify({ id: 'sign-001', document_id: 'doc-xyz789', status: 'pending', signers: [{ email: 'ceo@acme.com', status: 'pending' }] }, null, 2),
    params: [],
  },
  {
    id: 'get-audit', method: 'GET', path: '/api/v1/audit/:entity_id', summary: 'Fetch audit log', category: 'Audit',
    description: 'Get the complete audit trail for any entity (credential, document, product).',
    requestBody: undefined,
    responseExample: JSON.stringify({ entity_id: 'cred-abc123', events: [{ action: 'created', timestamp: '2026-03-17T10:00:00Z', user: 'admin@acme.com' }, { action: 'issued', timestamp: '2026-03-17T10:01:00Z', user: 'admin@acme.com' }] }, null, 2),
    params: [{ name: 'entity_id', type: 'string', required: true, description: 'Entity ID to audit' }],
  },
  {
    id: 'gen-qr', method: 'POST', path: '/api/v1/qr/generate', summary: 'Generate QR code', category: 'QR',
    description: 'Generate a verification QR code for a credential or product.',
    requestBody: JSON.stringify({ credential_id: 'cred-abc123', size: 256, format: 'png' }, null, 2),
    responseExample: JSON.stringify({ qr_code_url: 'https://cdn.docweb.io/qr/cred-abc123.png', verification_url: 'https://verify.docweb.io/cred-abc123' }, null, 2),
    params: [],
  },
  {
    id: 'list-schemas', method: 'GET', path: '/api/v1/schemas', summary: 'List credential schemas', category: 'Schemas',
    description: 'Retrieve all credential schemas for your organization with pagination.',
    requestBody: undefined,
    responseExample: JSON.stringify({ schemas: [{ id: 'schema-001', name: 'Degree Certificate', version: '2.1', status: 'active', attributes: 12 }], total: 6, page: 1 }, null, 2),
    params: [{ name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' }, { name: 'limit', type: 'number', required: false, description: 'Results per page (default: 20)' }],
  },
];

const methodColors: Record<string, { bg: string; color: string }> = {
  GET: { bg: 'var(--info-light)', color: 'var(--info)' },
  POST: { bg: 'var(--success-light)', color: 'var(--success)' },
  PUT: { bg: 'var(--warning-light)', color: 'var(--warning)' },
  PATCH: { bg: 'var(--warning-light)', color: 'var(--warning)' },
  DELETE: { bg: 'var(--destructive-light)', color: 'var(--destructive)' },
};

const categories = [...new Set(apiEndpoints.map(e => e.category))];

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
// API Playground Component
// ────────────────────────────────────────────

function APIPlayground({ endpoint }: { endpoint: APIEndpoint }) {
  const [requestBody, setRequestBody] = useState(endpoint.requestBody || '');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    // Simulate API call
    const start = performance.now();
    await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
    const elapsed = Math.round(performance.now() - start);
    setLatency(elapsed);

    // Simulate response
    const isSuccess = Math.random() > 0.1;
    setStatusCode(isSuccess ? (endpoint.method === 'POST' ? 201 : 200) : 400);
    setResponse(isSuccess ? endpoint.responseExample : JSON.stringify({ error: 'Bad Request', message: 'Missing required field: subject.name', code: 'VALIDATION_ERROR' }, null, 2));
    setLoading(false);
  };

  const buildPath = () => {
    let path = endpoint.path;
    (endpoint.params || []).forEach(p => {
      path = path.replace(`:${p.name}`, paramValues[p.name] || `:${p.name}`);
    });
    return path;
  };

  const buildCurl = () => {
    let cmd = `curl -X ${endpoint.method} https://api.docweb.io${buildPath()}`;
    cmd += ` \\\n  -H "Authorization: Bearer dwk_live_YOUR_KEY"`;
    cmd += ` \\\n  -H "Content-Type: application/json"`;
    if (requestBody) cmd += ` \\\n  -d '${requestBody}'`;
    return cmd;
  };

  return (
    <div className="space-y-4">
      {/* URL bar */}
      <div className="flex items-center gap-2">
        <span
          className="px-3 py-2 flex-shrink-0"
          style={{ ...methodColors[endpoint.method], borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}
        >
          {endpoint.method}
        </span>
        <div
          className="flex-1 px-4 py-2 flex items-center"
          style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)', fontFamily: "'Cousine', monospace" }}
        >
          <span style={{ color: 'var(--muted-foreground)' }}>https://api.docweb.io</span>
          <span style={{ color: 'var(--foreground)' }}>{buildPath()}</span>
        </div>
        <button
          onClick={sendRequest}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-md)' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </div>

      {/* Path params */}
      {(endpoint.params || []).filter(p => p.required).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(endpoint.params || []).map(p => (
            <div key={p.name}>
              <label style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '2px' }}>
                {p.name} <span style={{ color: 'var(--destructive)' }}>{p.required ? '*' : ''}</span>
              </label>
              <input
                type="text"
                value={paramValues[p.name] || ''}
                onChange={e => setParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                placeholder={p.description}
                style={{ ...inputStyle, padding: '8px 12px' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Request / Response side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request body */}
        {endpoint.requestBody !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ color: 'var(--foreground)' }}>Request Body</label>
              <button
                onClick={() => { navigator.clipboard.writeText(buildCurl()); setCopiedReq(true); setTimeout(() => setCopiedReq(false), 2000); }}
                className="flex items-center gap-1 px-2 py-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-sm)' }}
              >
                {copiedReq ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReq ? 'Copied cURL!' : 'Copy cURL'}</span>
              </button>
            </div>
            <textarea
              value={requestBody}
              onChange={e => setRequestBody(e.target.value)}
              rows={10}
              style={{ ...inputStyle, fontFamily: "'Cousine', monospace", resize: 'vertical' as const }}
            />
          </div>
        )}

        {/* Response */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label style={{ color: 'var(--foreground)' }}>Response</label>
              {statusCode !== null && (
                <span
                  className="px-2 py-0.5"
                  style={{
                    backgroundColor: statusCode < 300 ? 'var(--success-light)' : 'var(--destructive-light)',
                    color: statusCode < 300 ? 'var(--success)' : 'var(--destructive)',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {statusCode}
                </span>
              )}
              {latency !== null && (
                <span style={{ color: 'var(--muted-foreground)' }}>{latency}ms</span>
              )}
            </div>
            {response && (
              <button
                onClick={() => { navigator.clipboard.writeText(response); setCopiedRes(true); setTimeout(() => setCopiedRes(false), 2000); }}
                className="flex items-center gap-1 px-2 py-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-sm)' }}
              >
                {copiedRes ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRes ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
          <div
            className="overflow-auto"
            style={{
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              minHeight: '200px',
              maxHeight: '400px',
              padding: '16px',
            }}
          >
            {loading ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--primary-foreground)' }} />
                <span style={{ color: 'var(--primary-foreground)' }}>Sending request...</span>
              </div>
            ) : response ? (
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                <code style={{ color: 'var(--primary-foreground)', fontFamily: "'Cousine', monospace" }}>{response}</code>
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Play className="w-8 h-8 mb-2" />
                <p>Click Send to execute the request</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// DEVELOPER PORTAL (Main)
// ────────────────────────────────────────────

export function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<'docs' | 'playground' | 'usage'>('docs');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<APIEndpoint | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const tabs = [
    { id: 'docs' as const, label: 'API Reference', icon: BookOpen },
    { id: 'playground' as const, label: 'Playground', icon: Play },
    { id: 'usage' as const, label: 'Usage & Limits', icon: BarChart3 },
  ];

  const filteredEndpoints = filterCategory === 'all'
    ? apiEndpoints
    : apiEndpoints.filter(e => e.category === filterCategory);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 style={{ color: 'var(--foreground)' }}>Developer Portal</h2>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            API documentation, interactive playground, and usage analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1.5"
            style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-full)', color: 'var(--muted-foreground)' }}
          >
            API v1
          </span>
          <a
            href="#"
            className="flex items-center gap-1.5 px-4 py-2 transition-opacity hover:opacity-80"
            style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <BookOpen className="w-4 h-4" />
            <span>Full Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Consolidation notice */}
      <div
        className="flex items-center gap-3 px-4 py-3 mb-6"
        style={{ backgroundColor: 'var(--info-light)', borderRadius: 'var(--radius-md)', color: 'var(--info)' }}
      >
        <ArrowRight className="w-4 h-4 flex-shrink-0" />
        <p>API Keys and Webhooks are managed under <strong>Settings</strong>. This portal focuses on documentation, testing, and usage.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 transition-all relative"
              style={{
                color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: activeTab === tab.id ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
              } as React.CSSProperties}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--primary)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════ API REFERENCE ═══════════ */}
      {activeTab === 'docs' && (
        <div>
          {/* Base URL + category filter */}
          <div className="flex items-center justify-between mb-6">
            <p style={{ color: 'var(--muted-foreground)' }}>
              Base URL: <code className="px-2 py-0.5" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-sm)', color: 'var(--foreground)' }}>https://api.docweb.io/v1</code>
            </p>
            <div className="flex items-center gap-2">
              {['all', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className="px-3 py-1.5 transition-all"
                  style={{
                    backgroundColor: filterCategory === cat ? 'var(--primary)' : 'var(--muted)',
                    color: filterCategory === cat ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint list */}
          <div className="space-y-2">
            {filteredEndpoints.map(ep => {
              const mc = methodColors[ep.method];
              const isExpanded = expandedEndpoint === ep.id;
              return (
                <div
                  key={ep.id}
                  style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)', overflow: 'hidden' }}
                >
                  <div
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all"
                    onClick={() => setExpandedEndpoint(isExpanded ? null : ep.id)}
                  >
                    <span
                      className="px-2.5 py-0.5 w-16 text-center flex-shrink-0"
                      style={{ backgroundColor: mc.bg, color: mc.color, borderRadius: 'var(--radius-sm)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}
                    >
                      <small>{ep.method}</small>
                    </span>
                    <code style={{ color: 'var(--foreground)' }}>{ep.path}</code>
                    <p className="flex-1 text-right" style={{ color: 'var(--muted-foreground)' }}>{ep.summary}</p>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveTab('playground'); setPlaygroundEndpoint(ep); }}
                      className="flex items-center gap-1 px-2 py-1 transition-opacity hover:opacity-70"
                      style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <Play className="w-3 h-3" />
                      <small>Try it</small>
                    </button>
                    {isExpanded ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <p style={{ color: 'var(--muted-foreground)' }}>{ep.description}</p>

                      {ep.params && ep.params.length > 0 && (
                        <div>
                          <label style={{ color: 'var(--foreground)', marginBottom: '4px', display: 'block' }}>Parameters</label>
                          <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            {ep.params.map(p => (
                              <div key={p.name} className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                                <code style={{ color: 'var(--foreground)' }}>{p.name}</code>
                                <span className="px-1.5 py-0.5" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-sm)', color: 'var(--muted-foreground)' }}>{p.type}</span>
                                {p.required && <span style={{ color: 'var(--destructive)' }}>required</span>}
                                <span className="flex-1 text-right" style={{ color: 'var(--muted-foreground)' }}>{p.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {ep.requestBody && (
                          <div>
                            <label style={{ color: 'var(--foreground)', marginBottom: '4px', display: 'block' }}>Request Body</label>
                            <div className="p-4 overflow-auto" style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-md)', maxHeight: '200px' }}>
                              <pre><code style={{ color: 'var(--primary-foreground)', fontFamily: "'Cousine', monospace" }}>{ep.requestBody}</code></pre>
                            </div>
                          </div>
                        )}
                        <div>
                          <label style={{ color: 'var(--foreground)', marginBottom: '4px', display: 'block' }}>Response Example</label>
                          <div className="p-4 overflow-auto" style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-md)', maxHeight: '200px' }}>
                            <pre><code style={{ color: 'var(--primary-foreground)', fontFamily: "'Cousine', monospace" }}>{ep.responseExample}</code></pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Start */}
          <div className="mt-8">
            <h4 style={{ color: 'var(--foreground)' }} className="mb-3">Quick Start</h4>
            <div className="p-5 overflow-x-auto" style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
              <pre><code style={{ color: 'var(--primary-foreground)', fontFamily: "'Cousine', monospace" }}>
{`curl -X POST https://api.docweb.io/v1/credentials \\
  -H "Authorization: Bearer dwk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "schema_id": "schema-001",
    "subject": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "attributes": {
      "degree": "Bachelor of Science",
      "institution": "MIT"
    }
  }'`}
              </code></pre>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ PLAYGROUND ═══════════ */}
      {activeTab === 'playground' && (
        <div>
          {/* Endpoint selector */}
          <div className="flex items-center gap-4 mb-6">
            <label style={{ color: 'var(--foreground)', whiteSpace: 'nowrap' }}>Select Endpoint:</label>
            <select
              value={playgroundEndpoint?.id || ''}
              onChange={e => setPlaygroundEndpoint(apiEndpoints.find(ep => ep.id === e.target.value) || null)}
              style={{ ...inputStyle, maxWidth: '400px' }}
            >
              <option value="">Choose an endpoint...</option>
              {categories.map(cat => (
                <optgroup key={cat} label={cat}>
                  {apiEndpoints.filter(ep => ep.category === cat).map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.method} {ep.path} — {ep.summary}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {playgroundEndpoint ? (
            <div
              className="p-6"
              style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)' }}
            >
              <div className="mb-4">
                <h4 style={{ color: 'var(--foreground)' }}>{playgroundEndpoint.summary}</h4>
                <p style={{ color: 'var(--muted-foreground)' }}>{playgroundEndpoint.description}</p>
              </div>
              <APIPlayground endpoint={playgroundEndpoint} />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-16"
              style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)' }}
            >
              <Code2 className="w-12 h-12 mb-4" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              <h4 style={{ color: 'var(--foreground)', marginBottom: '4px' }}>Select an endpoint to try</h4>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Choose from the dropdown above or click "Try it" from the API Reference
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ USAGE & LIMITS ═══════════ */}
      {activeTab === 'usage' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'API Calls (This Month)', value: '18,247', limit: '50,000', percent: 36.5 },
              { label: 'Credentials Issued', value: '2,380', limit: '10,000', percent: 23.8 },
              { label: 'Webhook Deliveries', value: '4,120', limit: 'Unlimited', percent: 0 },
            ].map(metric => (
              <div
                key={metric.label}
                className="p-5"
                style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)' }}
              >
                <label style={{ color: 'var(--muted-foreground)' }}>{metric.label}</label>
                <h3 style={{ color: 'var(--foreground)' }} className="mt-1">{metric.value}</h3>
                <p style={{ color: 'var(--muted-foreground)' }}>of {metric.limit}</p>
                {metric.percent > 0 && (
                  <div className="w-full h-2 mt-3 overflow-hidden" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-full)' }}>
                    <div
                      className="h-full"
                      style={{ width: `${metric.percent}%`, backgroundColor: metric.percent > 80 ? 'var(--destructive)' : 'var(--primary)', borderRadius: 'var(--radius-full)' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recent API Activity */}
          <h4 style={{ color: 'var(--foreground)' }} className="mb-4">Recent API Activity</h4>
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elevation-sm)', overflow: 'hidden' }}>
            {[
              { method: 'POST', path: '/credentials', status: 201, time: '2 min ago', duration: '145ms' },
              { method: 'GET', path: '/credentials/cred-001', status: 200, time: '5 min ago', duration: '32ms' },
              { method: 'POST', path: '/credentials/cred-002/verify', status: 200, time: '12 min ago', duration: '89ms' },
              { method: 'GET', path: '/documents', status: 200, time: '18 min ago', duration: '67ms' },
              { method: 'POST', path: '/qr/generate', status: 201, time: '25 min ago', duration: '210ms' },
              { method: 'DELETE', path: '/credentials/cred-old', status: 200, time: '1 hour ago', duration: '156ms' },
            ].map((log, i) => {
              const mc = methodColors[log.method] || methodColors.GET;
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="px-2 py-0.5 w-14 text-center" style={{ backgroundColor: mc.bg, color: mc.color, borderRadius: 'var(--radius-sm)' }}>
                    <small>{log.method}</small>
                  </span>
                  <code className="flex-1" style={{ color: 'var(--foreground)' }}>{log.path}</code>
                  <span
                    className="px-2 py-0.5"
                    style={{
                      backgroundColor: log.status < 300 ? 'var(--success-light)' : 'var(--destructive-light)',
                      color: log.status < 300 ? 'var(--success)' : 'var(--destructive)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <small>{log.status}</small>
                  </span>
                  <p style={{ color: 'var(--muted-foreground)' }}>{log.duration}</p>
                  <small style={{ color: 'var(--muted-foreground)' }}>{log.time}</small>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
