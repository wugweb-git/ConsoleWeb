import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { products, routeTable } from './registry';
import { can, tenants } from './session';

const readHash = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));

export function Shell() {
  const [current, setCurrent] = useState<string>(() => readHash() || Object.keys(routeTable)[0] || '');
  const [productId, setProductId] = useState<string | null>(products[0]?.id ?? null);
  const [tenantId, setTenantId] = useState<string>(tenants[0].id);

  useEffect(() => {
    const onHash = () => setCurrent(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const resolved = routeTable[current];

  // Opening a product module's screen selects that product.
  useEffect(() => {
    if (resolved?.area === 'modules') setProductId(resolved.manifest.id);
  }, [resolved]);

  const navigate = (key: string) => {
    window.location.hash = '/' + key;
    setCurrent(key);
  };

  const Screen = resolved && can(resolved.permission) ? resolved.screen : null;

  const selectStyle = {
    backgroundColor: 'var(--input-background)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <header
        className="fixed top-0 inset-x-0 z-40 flex items-center gap-4 px-6"
        style={{ height: '64px', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--foreground)' }}>ConsoleWeb</span>
        <div className="ml-auto flex items-center gap-2">
          <select aria-label="Product" className="rounded-md px-2 py-1" style={selectStyle} value={productId ?? ''} onChange={e => setProductId(e.target.value || null)}>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select aria-label="Tenant" className="rounded-md px-2 py-1" style={selectStyle} value={tenantId} onChange={e => setTenantId(e.target.value)}>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </header>

      <div className="fixed left-0 z-30" style={{ width: '240px', top: '64px', height: 'calc(100vh - 64px)' }}>
        <Sidebar current={current} onNavigate={navigate} />
      </div>

      <main style={{ paddingTop: '64px', marginLeft: '240px' }}>
        {Screen
          ? <Screen productId={productId} tenantId={tenantId} navigate={navigate} />
          : <div className="p-12" style={{ color: 'var(--muted-foreground)' }}>{resolved ? 'Not permitted.' : 'Select a screen.'}</div>}
      </main>
    </div>
  );
}
