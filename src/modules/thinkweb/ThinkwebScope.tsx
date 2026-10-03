import { useEffect, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

// Applies ThinkWeb's design tokens to its screens and portals, and gives the
// moved components the router context they expect (navigation stays in memory).
export function ThinkwebScope({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add('thinkweb-portals');
    return () => document.body.classList.remove('thinkweb-portals');
  }, []);

  return (
    <div className="thinkweb-scope min-h-[calc(100vh-80px)]">
      <MemoryRouter>
        {children}
        <Toaster />
      </MemoryRouter>
    </div>
  );
}
