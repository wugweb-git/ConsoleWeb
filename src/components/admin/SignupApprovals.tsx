import { useCallback, useEffect, useState } from 'react';
import { UserCheck, Check, X } from 'lucide-react';
import { core } from '../../shell/auth/supabase';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';

// Sign-ups waiting for a platform owner. Approving activates the person and their company;
// rejecting suspends them. Both go through core.console_decide_signup (migration 09),
// which checks the caller is a platform owner and writes core.audit_log.

interface Signup {
  tenant_id: string;
  tenant_name: string;
  tenant_status: string;
  user_id: string;
  email: string;
  name: string | null;
  product: string;
  role: string;
  member_status: string;
  requested_at: string;
}

const productNames: Record<string, string> = { docweb: 'DocWeb', stayweb: 'Stayweb', hrweb: 'HRweb', thinkweb: 'ThinkWeb' };

export function SignupApprovals() {
  const [rows, setRows] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await core().rpc('console_signups', { p_status: 'pending' });
    if (error) setError(error.message);
    else { setRows((data ?? []) as Signup[]); setError(null); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (s: Signup, approve: boolean) => {
    const key = `${s.tenant_id}:${s.user_id}:${s.product}`;
    setBusy(key);
    const { error } = await core().rpc('console_decide_signup', {
      p_tenant: s.tenant_id, p_user: s.user_id, p_product: s.product, p_approve: approve,
    });
    setBusy(null);
    if (error) setError(error.message);
    else setRows((r) => r.filter((x) => `${x.tenant_id}:${x.user_id}:${x.product}` !== key));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ minHeight: 'calc(100vh - 5rem)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
          <UserCheck className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
        </div>
        <div>
          <h2 style={{ color: 'var(--foreground)' }}>Sign-ups</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>People who signed up and are waiting for approval</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <LoadingState title="Loading sign-ups..." />
        ) : error ? (
          <ErrorState description={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState icon={UserCheck} title="No sign-ups waiting" description="New sign-ups appear here until you approve or reject them." />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Company', 'Person', 'Product', 'Requested', ''].map((h) => (
                  <th key={h} className="text-left px-6 py-3" style={{ backgroundColor: 'var(--muted)' }}>
                    <h6 style={{ color: 'var(--muted-foreground)' }}>{h}</h6>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, idx) => {
                const key = `${s.tenant_id}:${s.user_id}:${s.product}`;
                return (
                  <tr key={key} style={{ borderBottom: idx < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-6 py-3">
                      <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>{s.tenant_name}</p>
                      <span style={{ color: 'var(--muted-foreground)' }}>{s.tenant_status === 'pending' ? 'New company' : 'Existing company'}</span>
                    </td>
                    <td className="px-6 py-3">
                      <p style={{ color: 'var(--foreground)' }}>{s.name || '—'}</p>
                      <span style={{ color: 'var(--muted-foreground)' }}>{s.email}</span>
                    </td>
                    <td className="px-6 py-3" style={{ color: 'var(--foreground)' }}>{productNames[s.product] ?? s.product}</td>
                    <td className="px-6 py-3" style={{ color: 'var(--muted-foreground)' }}>{new Date(s.requested_at).toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={busy === key}
                          onClick={() => decide(s, false)}
                          className="flex items-center gap-1.5 px-3 py-2 transition-opacity hover:opacity-80 disabled:opacity-50"
                          style={{ border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: 'var(--radius-lg)' }}
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          disabled={busy === key}
                          onClick={() => decide(s, true)}
                          className="flex items-center gap-1.5 px-3 py-2 transition-opacity hover:opacity-80 disabled:opacity-50"
                          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-lg)' }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
