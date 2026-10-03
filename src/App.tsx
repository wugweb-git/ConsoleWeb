import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import type { AppPage } from './components/layout/AppSidebar';
import { routeKey, routeTable } from './shell/registry';
import { ModuleBoundary } from './shell/ModuleBoundary';
import { RouteAdapter } from './shell/RouteAdapter';
import { defaultRoute } from './shell/nav';
import { can, tenants } from './shell/session';
import { PlatformConfigProvider } from './stores/PlatformConfigContext';

const readHash = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));

export default function App() {
  return (
    <PlatformConfigProvider>
      <AppInner />
    </PlatformConfigProvider>
  );
}

function AppInner() {
  const [currentPage, setCurrentPage] = useState<AppPage>(() => readHash() || defaultRoute);

  useEffect(() => {
    const onHash = () => setCurrentPage(readHash() || defaultRoute);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (page: AppPage) => {
    window.location.hash = '/' + page;
    setCurrentPage(page);
  };

  const resolved = routeTable[currentPage];
  const Screen = resolved && can(resolved.permission) ? resolved.screen : null;
  // TODO: product + tenant switchers (placeholders until a switcher UI is approved)
  const productId = resolved?.area === 'modules' ? resolved.manifest.id : null;

  // Module paths (onNavigate / React Router) mapped to this module's routes.
  const goModule = (route: string) => resolved && navigate(routeKey(resolved.area, resolved.manifest.id, route));
  const onNavigate = (path: string) => {
    const route = resolved?.manifest.navigation?.map?.(path);
    if (route) goModule(route);
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={navigate}>
      {Screen && resolved && (
        <ModuleBoundary manifest={resolved.manifest}>
          <RouteAdapter manifest={resolved.manifest} go={goModule}>
            <Screen productId={productId} tenantId={tenants[0].id} navigate={navigate} onNavigate={onNavigate} />
          </RouteAdapter>
        </ModuleBoundary>
      )}
    </AppLayout>
  );
}
