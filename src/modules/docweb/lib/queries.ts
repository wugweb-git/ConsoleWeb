// TODO: replace with Docweb admin API
// ============================================================================
// DocWeb — Data Access Layer
// ============================================================================
// Query functions that read/write to Turso (libSQL).
// Each function falls back to mock data when DB is not configured.
// These are the building blocks that components will call instead of
// importing mock data directly.
//
// Usage:
//   import { fetchOrganizations, createUser } from '../lib/queries';
//   const orgs = await fetchOrganizations();
// ============================================================================

import { getDB, isDBConfigured } from './db';
import {
  mockOrganizations,
  mockUsers,
  mockDocuments,
  mockCertificates,
  mockApiKeys,
  mockOrganizationMembers,
} from '../data/mockData';

// ────────────────────────────────────────────
// Helper: generate a UUID-like ID
// ────────────────────────────────────────────
function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ────────────────────────────────────────────
// Organizations
// ────────────────────────────────────────────

export async function fetchOrganizations() {
  if (!isDBConfigured()) return mockOrganizations;
  try {
    const db = getDB();
    const result = await db.execute('SELECT * FROM organizations ORDER BY created_at DESC');
    return result.rows;
  } catch {
    return mockOrganizations;
  }
}

export async function createOrganization(data: { name: string; slug: string; plan?: string; primary_contact_user_id?: string }) {
  if (!isDBConfigured()) return { id: generateId(), ...data };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: 'INSERT INTO organizations (id, name, slug, plan, primary_contact_user_id) VALUES (?, ?, ?, ?, ?)',
    args: [id, data.name, data.slug, data.plan || 'free', data.primary_contact_user_id || null],
  });
  return { id, ...data };
}

// ────────────────────────────────────────────
// Users
// ────────────────────────────────────────────

export async function fetchUsers() {
  if (!isDBConfigured()) return mockUsers;
  try {
    const db = getDB();
    const result = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch {
    return mockUsers;
  }
}

export async function createUser(data: { email: string; first_name: string; last_name: string; status?: string }) {
  if (!isDBConfigured()) return { id: generateId(), ...data };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: 'INSERT INTO users (id, email, first_name, last_name, status) VALUES (?, ?, ?, ?, ?)',
    args: [id, data.email, data.first_name, data.last_name, data.status || 'active'],
  });
  return { id, ...data };
}

// ────────────────────────────────────────────
// Documents
// ────────────────────────────────────────────

export async function fetchDocuments(organizationId?: string) {
  if (!isDBConfigured()) return mockDocuments;
  try {
    const db = getDB();
    const sql = organizationId
      ? 'SELECT * FROM documents WHERE organization_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM documents ORDER BY created_at DESC';
    const result = await db.execute(organizationId ? { sql, args: [organizationId] } : sql);
    return result.rows;
  } catch {
    return mockDocuments;
  }
}

export async function createDocument(data: { organization_id: string; created_by_user_id: string; title: string; file_url: string; file_type?: string; file_size?: number }) {
  if (!isDBConfigured()) return { id: generateId(), ...data };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: 'INSERT INTO documents (id, organization_id, created_by_user_id, title, file_url, file_type, file_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, data.organization_id, data.created_by_user_id, data.title, data.file_url, data.file_type || null, data.file_size || null, 'draft'],
  });
  return { id, ...data };
}

// ────────────────────────────────────────────
// Credentials
// ────────────────────────────────────────────

export async function fetchCredentials(status?: string) {
  if (!isDBConfigured()) return mockCertificates;
  try {
    const db = getDB();
    const sql = status
      ? 'SELECT * FROM credentials WHERE status = ? ORDER BY issued_at DESC'
      : 'SELECT * FROM credentials ORDER BY issued_at DESC';
    const result = await db.execute(status ? { sql, args: [status] } : sql);
    return result.rows;
  } catch {
    return mockCertificates;
  }
}

export async function createCredential(data: { schema_id: string; template_id: string; issuer_id: string; subject_id: string }) {
  if (!isDBConfigured()) return { id: generateId(), ...data, status: 'draft' };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: 'INSERT INTO credentials (id, schema_id, template_id, issuer_id, subject_id, status) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, data.schema_id, data.template_id, data.issuer_id, data.subject_id, 'draft'],
  });
  return { id, ...data, status: 'draft' };
}

export async function issueCredential(credentialId: string) {
  if (!isDBConfigured()) return;
  const db = getDB();
  await db.execute({
    sql: "UPDATE credentials SET status = 'issued', issued_at = datetime('now') WHERE id = ?",
    args: [credentialId],
  });
}

export async function revokeCredential(credentialId: string, reason?: string) {
  if (!isDBConfigured()) return;
  const db = getDB();
  await db.execute({
    sql: "UPDATE credentials SET status = 'revoked', revoked_at = datetime('now') WHERE id = ?",
    args: [credentialId],
  });
  // Log the revocation
  await db.execute({
    sql: "INSERT INTO credential_history (id, credential_id, event_type, event_data, created_at) VALUES (?, ?, 'revoked', ?, datetime('now'))",
    args: [generateId(), credentialId, JSON.stringify({ reason: reason || 'Revoked by admin' })],
  });
}

// ────────────────────────────────────────────
// Credential Schemas
// ────────────────────────────────────────────

export async function fetchSchemas(organizationId?: string) {
  if (!isDBConfigured()) return [];
  try {
    const db = getDB();
    const sql = organizationId
      ? 'SELECT * FROM credential_schemas WHERE organization_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM credential_schemas ORDER BY created_at DESC';
    const result = await db.execute(organizationId ? { sql, args: [organizationId] } : sql);
    return result.rows;
  } catch {
    return [];
  }
}

export async function createSchema(data: { organization_id: string; name: string; description?: string; version?: string }) {
  if (!isDBConfigured()) return { id: generateId(), ...data };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: 'INSERT INTO credential_schemas (id, organization_id, name, description, version, status) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, data.organization_id, data.name, data.description || null, data.version || '1.0', 'draft'],
  });
  return { id, ...data };
}

// ────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────

export async function fetchTemplates(organizationId?: string) {
  if (!isDBConfigured()) return [];
  try {
    const db = getDB();
    const sql = organizationId
      ? 'SELECT * FROM templates WHERE organization_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM templates ORDER BY created_at DESC';
    const result = await db.execute(organizationId ? { sql, args: [organizationId] } : sql);
    return result.rows;
  } catch {
    return [];
  }
}

// ────────────────────────────────────────────
// Products (DigiLabel)
// ────────────────────────────────────────────

export async function fetchProducts(organizationId?: string) {
  if (!isDBConfigured()) return [];
  try {
    const db = getDB();
    const sql = organizationId
      ? 'SELECT * FROM products WHERE organization_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM products ORDER BY created_at DESC';
    const result = await db.execute(organizationId ? { sql, args: [organizationId] } : sql);
    return result.rows;
  } catch {
    return [];
  }
}

export async function createProduct(data: { organization_id: string; product_name: string; manufacturer?: string; batch_number?: string }) {
  if (!isDBConfigured()) return { id: generateId(), ...data };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: 'INSERT INTO products (id, organization_id, product_name, manufacturer, batch_number) VALUES (?, ?, ?, ?, ?)',
    args: [id, data.organization_id, data.product_name, data.manufacturer || null, data.batch_number || null],
  });
  return { id, ...data };
}

// ────────────────────────────────────────────
// API Keys
// ────────────────────────────────────────────

export async function fetchApiKeys(organizationId?: string) {
  if (!isDBConfigured()) return mockApiKeys;
  try {
    const db = getDB();
    const sql = organizationId
      ? 'SELECT * FROM api_keys WHERE organization_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM api_keys ORDER BY created_at DESC';
    const result = await db.execute(organizationId ? { sql, args: [organizationId] } : sql);
    return result.rows;
  } catch {
    return mockApiKeys;
  }
}

// ────────────────────────────────────────────
// Webhooks
// ────────────────────────────────────────────

export async function fetchWebhooks(organizationId?: string) {
  if (!isDBConfigured()) return [];
  try {
    const db = getDB();
    const sql = organizationId
      ? 'SELECT * FROM webhooks WHERE organization_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM webhooks ORDER BY created_at DESC';
    const result = await db.execute(organizationId ? { sql, args: [organizationId] } : sql);
    return result.rows;
  } catch {
    return [];
  }
}

export async function createWebhook(data: { organization_id: string; name: string; url: string; events: string[]; secret?: string }) {
  if (!isDBConfigured()) return { id: generateId(), ...data };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: 'INSERT INTO webhooks (id, organization_id, name, url, events, secret, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [id, data.organization_id, data.name, data.url, JSON.stringify(data.events), data.secret || null, 'active'],
  });
  return { id, ...data };
}

// ────────────────────────────────────────────
// Activity Logs
// ────────────────────────────────────────────

export async function fetchActivityLogs(opts?: { organization_id?: string; limit?: number }) {
  if (!isDBConfigured()) return [];
  try {
    const db = getDB();
    const limit = opts?.limit || 50;
    const sql = opts?.organization_id
      ? `SELECT * FROM activity_logs WHERE organization_id = ? ORDER BY timestamp DESC LIMIT ${limit}`
      : `SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ${limit}`;
    const result = await db.execute(opts?.organization_id ? { sql, args: [opts.organization_id] } : sql);
    return result.rows;
  } catch {
    return [];
  }
}

export async function logActivity(data: { user_id?: string; organization_id?: string; action: string; entity_type?: string; entity_id?: string; metadata?: Record<string, any> }) {
  if (!isDBConfigured()) return;
  const db = getDB();
  await db.execute({
    sql: "INSERT INTO activity_logs (id, user_id, organization_id, action, entity_type, entity_id, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
    args: [generateId(), data.user_id || null, data.organization_id || null, data.action, data.entity_type || null, data.entity_id || null, data.metadata ? JSON.stringify(data.metadata) : null],
  });
}

// ────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────

export async function fetchNotifications(userId: string) {
  if (!isDBConfigured()) return [];
  try {
    const db = getDB();
    const result = await db.execute({
      sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      args: [userId],
    });
    return result.rows;
  } catch {
    return [];
  }
}

// ────────────────────────────────────────────
// Verification
// ────────────────────────────────────────────

export async function createVerificationRequest(data: { credential_id: string; requester_ip?: string; verification_method: string }) {
  if (!isDBConfigured()) return { id: generateId(), ...data };
  const db = getDB();
  const id = generateId();
  await db.execute({
    sql: "INSERT INTO verification_requests (id, credential_id, requester_ip, verification_method) VALUES (?, ?, ?, ?)",
    args: [id, data.credential_id, data.requester_ip || null, data.verification_method],
  });
  return { id, ...data };
}

// ────────────────────────────────────────────
// Dashboard Stats (aggregate)
// ────────────────────────────────────────────

export async function fetchDashboardStats() {
  if (!isDBConfigured()) {
    return {
      totalCredentials: mockCertificates.length,
      totalDocuments: mockDocuments.length,
      totalUsers: mockUsers.length,
      totalOrganizations: mockOrganizations.length,
    };
  }
  try {
    const db = getDB();
    const [creds, docs, users, orgs] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM credentials'),
      db.execute('SELECT COUNT(*) as count FROM documents'),
      db.execute('SELECT COUNT(*) as count FROM users'),
      db.execute('SELECT COUNT(*) as count FROM organizations'),
    ]);
    return {
      totalCredentials: Number(creds.rows[0]?.count || 0),
      totalDocuments: Number(docs.rows[0]?.count || 0),
      totalUsers: Number(users.rows[0]?.count || 0),
      totalOrganizations: Number(orgs.rows[0]?.count || 0),
    };
  } catch {
    return {
      totalCredentials: mockCertificates.length,
      totalDocuments: mockDocuments.length,
      totalUsers: mockUsers.length,
      totalOrganizations: mockOrganizations.length,
    };
  }
}

// ────────────────────────────────────────────
// Table introspection (for Tables & Stats tab)
// ────────────────────────────────────────────

export async function fetchTableStats(): Promise<{ name: string; count: number }[]> {
  if (!isDBConfigured()) return [];
  try {
    const db = getDB();
    const tablesResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name");
    const stats: { name: string; count: number }[] = [];
    for (const row of tablesResult.rows) {
      const tableName = String(row.name);
      try {
        const countResult = await db.execute(`SELECT COUNT(*) as count FROM "${tableName}"`);
        stats.push({ name: tableName, count: Number(countResult.rows[0]?.count || 0) });
      } catch {
        stats.push({ name: tableName, count: -1 });
      }
    }
    return stats;
  } catch {
    return [];
  }
}
