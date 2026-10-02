import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import type { AppPage } from './components/layout/AppSidebar';
import { routeTable } from './shell/registry';
import { defaultRoute } from './shell/nav';
import { can, tenants } from './shell/session';

const readHash = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));

export default function App() {
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

  return (
    <AppLayout currentPage={currentPage} onNavigate={navigate}>
      {Screen && <Screen productId={productId} tenantId={tenants[0].id} navigate={navigate} />}
    </AppLayout>
  );
}
