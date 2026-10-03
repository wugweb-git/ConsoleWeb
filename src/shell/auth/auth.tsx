// ============================================================================
// ConsoleWeb — sign-in state
// ============================================================================
// Only platform owners get in: an active core.tenant_members row with product
// 'console' and role 'owner' (checked by core.is_console_owner(), migration 09).
// ============================================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, core } from './supabase';

interface AuthState {
  loading: boolean;
  session: Session | null;
  email: string | null;
  name: string | null;
  isOwner: boolean;
  needsPassword: boolean;
  passwordSet: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const ARRIVED_TO_SET_PASSWORD = typeof window !== 'undefined' && /type=(invite|recovery)/.test(window.location.hash);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(ARRIVED_TO_SET_PASSWORD);

  useEffect(() => {
    let cancelled = false;
    const apply = async (next: Session | null) => {
      setSession(next);
      if (next) {
        const [{ data: owner }, { data: user }] = await Promise.all([
          core().rpc('is_console_owner'),
          core().from('users').select('name').eq('id', next.user.id).maybeSingle(),
        ]);
        if (cancelled) return;
        setIsOwner(owner === true);
        setName(user?.name ?? null);
      } else {
        setIsOwner(false);
        setName(null);
      }
      setLoading(false);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setNeedsPassword(true);
      setTimeout(() => apply(next), 0);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const value: AuthState = {
    loading,
    session,
    email: session?.user.email ?? null,
    name,
    isOwner,
    needsPassword,
    passwordSet: () => setNeedsPassword(false),
    signOut: async () => { await supabase.auth.signOut(); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
