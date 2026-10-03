import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import type { AppPage } from './components/layout/AppSidebar';
import { routeKey, routeTable } from './shell/registry';
import { ModuleBoundary } from './shell/ModuleBoundary';
import { RouteAdapter } from './shell/RouteAdapter';
import { defaultRoute } from './shell/nav';
import { can, tenants } from './shell/session';
import { PlatformConfigProvider } from './stores/PlatformConfigContext';
import { AuthProvider, useAuth } from './shell/auth/auth';
import { LoginScreen, SetPasswordScreen, NoAccessScreen } from './shell/auth/AuthScreens';

const readHash = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));

export default function App() {
  return (
    <AuthProvider>
      <SignInGate />
    </AuthProvider>
  );
}

// Only platform owners get past this point (see shell/auth/auth.tsx).
function SignInGate() {
  const auth = useAuth();
  if (auth.loading) return <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }} />;
  if (auth.session && auth.needsPassword) return <SetPasswordScreen email={auth.email} onDone={auth.passwordSet} />;
  if (!auth.session) return <LoginScreen />;
  if (!auth.isOwner) return <NoAccessScreen email={auth.email} onSignOut={auth.signOut} />;
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
