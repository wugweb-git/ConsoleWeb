import { useEffect, type ReactNode } from 'react';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Applies Stayweb's own design tokens to its screens and to portals
// (dialogs, popovers, toasts) opened while a Stayweb screen is mounted.
export function StaywebScope({ variant, children }: { variant: 'console' | 'property'; children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add('stayweb-portals');
    return () => document.body.classList.remove('stayweb-portals');
  }, []);

  return (
    <div className="stayweb-scope">
      <Toaster />
      <ErrorBoundary>
        {variant === 'console'
          // Container from SuperAdminView
          ? <div className="h-[calc(100vh-5rem)] overflow-hidden">{children}</div>
          // Container from the property view (App.tsx)
          : <div className="h-[calc(100vh-80px)] page-enter">{children}</div>}
      </ErrorBoundary>
    </div>
  );
}
