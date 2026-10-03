import { useEffect, type ReactNode } from 'react';
import { Toaster } from './components/ui/toaster';

// Applies ThinkWeb's design tokens to its screens and portals.
// Router context comes from the shell's RouteAdapter (navigation: react-router).
export function ThinkwebScope({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add('thinkweb-portals');
    return () => document.body.classList.remove('thinkweb-portals');
  }, []);

  return (
    <div className="thinkweb-scope min-h-[calc(100vh-80px)]">
      {children}
      <Toaster />
    </div>
  );
}
