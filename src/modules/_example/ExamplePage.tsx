import type { ScreenContext } from '../../shell/types';

export function ExamplePage({ productId, tenantId }: ScreenContext) {
  return (
    <div className="p-8" style={{ color: 'var(--foreground)' }}>
      <h2>Example module</h2>
      <p style={{ color: 'var(--muted-foreground)' }}>
        Product: {productId} · Tenant: {tenantId}
      </p>
    </div>
  );
}
