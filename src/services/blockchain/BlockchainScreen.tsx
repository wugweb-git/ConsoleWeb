import { lazy, Suspense } from 'react';

// Blockchain (lazy-loaded — ethers.js must not initialize at app startup)
const BlockchainPanel = lazy(() =>
  import('./components/blockchain/BlockchainPanel').then(m => ({ default: m.BlockchainPanel }))
);

export function BlockchainScreen() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12" style={{ color: 'var(--muted-foreground)' }}>
        Loading Blockchain Panel...
      </div>
    }>
      <BlockchainPanel />
    </Suspense>
  );
}
