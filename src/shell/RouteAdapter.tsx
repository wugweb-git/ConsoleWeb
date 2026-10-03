import { useEffect, type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { ModuleManifest } from './types';

// Gives screens that use React Router a router; navigation stays in memory
// and is forwarded to the shell when the module maps the path to a route.
function Forward({ manifest, go }: { manifest: ModuleManifest; go: (route: string) => void }) {
  const location = useLocation();
  useEffect(() => {
    if (location.key === 'default') return;
    const route = manifest.navigation?.map?.(location.pathname);
    if (route) go(route);
  }, [location, manifest, go]);
  return null;
}

export function RouteAdapter({ manifest, go, children }: {
  manifest: ModuleManifest;
  go: (route: string) => void;
  children: ReactNode;
}) {
  if (manifest.navigation?.kind !== 'react-router') return <>{children}</>;
  return (
    <MemoryRouter>
      <Forward manifest={manifest} go={go} />
      {children}
    </MemoryRouter>
  );
}
