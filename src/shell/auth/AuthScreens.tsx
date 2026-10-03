import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, KeyRound, LogOut, ShieldOff } from 'lucide-react';
import { supabase } from './supabase';
import {
  AuthCard, AuthError, AuthInfo, AuthSpinner,
  authLabelClass, authIconClass, authInputClass, authPrimaryButtonClass, authSecondaryButtonClass, authLinkClass,
} from './AuthCard';

// Sign in. There is no public sign-up for ConsoleWeb: platform owners are added by Wugweb.
export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || !password) return setError('Please fill in all fields');
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsLoading(false);
    if (error) setError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
  };

  // Sends a reset link; the link opens ConsoleWeb on the Set password screen.
  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email) return setError('Enter your email address first, then click "Forgot password?"');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    if (error) setError(error.message);
    else setInfo(`If ${email} has an account, a link to set a new password is on its way.`);
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to Wugweb Console">
      {info && <AuthInfo message={info} />}
      {error && <AuthError message={error} />}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className={authLabelClass}>Email</label>
          <div className="relative">
            <Mail className={authIconClass} />
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@wugweb.com" className={authInputClass} disabled={isLoading} />
          </div>
        </div>
        <div>
          <label htmlFor="password" className={authLabelClass}>Password</label>
          <div className="relative">
            <Lock className={authIconClass} />
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className={`${authInputClass} pr-12`} disabled={isLoading} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={handleForgotPassword} className={authLinkClass}>Forgot password?</button>
        </div>
        <button type="submit" disabled={isLoading} className={authPrimaryButtonClass}>
          {isLoading ? (<><AuthSpinner /><span>Signing in…</span></>) : (<><LogIn className="w-[18px] h-[18px]" /><span>Sign In</span></>)}
        </button>
      </form>
    </AuthCard>
  );
}

// Opened from an invite or password-reset email.
export function SetPasswordScreen({ email, onDone }: { email: string | null; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) return setError(error.message);
    window.history.replaceState(null, '', window.location.pathname);
    onDone();
  };

  return (
    <AuthCard title="Set your password" subtitle={email ? `Choose a password for ${email}` : 'Choose a password for your account'}>
      {error && <AuthError message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: 'new-password', label: 'New password', value: password, set: setPassword, placeholder: 'At least 8 characters' },
          { id: 'confirm-password', label: 'Confirm password', value: confirm, set: setConfirm, placeholder: 'Type it again' },
        ].map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className={authLabelClass}>{f.label}</label>
            <div className="relative">
              <Lock className={authIconClass} />
              <input id={f.id} type="password" autoComplete="new-password" value={f.value} onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder} className={authInputClass} disabled={isLoading} />
            </div>
          </div>
        ))}
        <button type="submit" disabled={isLoading} className={authPrimaryButtonClass}>
          {isLoading ? (<><AuthSpinner /><span>Saving…</span></>) : (<><KeyRound className="w-[18px] h-[18px]" /><span>Save password and continue</span></>)}
        </button>
      </form>
    </AuthCard>
  );
}

// Signed in, but not a platform owner.
export function NoAccessScreen({ email, onSignOut }: { email: string | null; onSignOut: () => void }) {
  return (
    <AuthCard title="No console access" subtitle="Wugweb Console is for platform owners only. Ask a Wugweb owner to give your account access.">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <ShieldOff className="w-6 h-6 text-muted-foreground" />
        </div>
        {email && <p className="text-[length:var(--text-sm)] text-muted-foreground">Signed in as {email}</p>}
      </div>
      <button onClick={onSignOut} className={authSecondaryButtonClass}>
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </AuthCard>
  );
}
