import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function LoadingState({
  title = 'Loading...',
  description,
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8"
      style={{ minHeight: compact ? '180px' : '320px', paddingTop: compact ? '24px' : '64px', paddingBottom: compact ? '24px' : '64px' }}
    >
      <Loader2
        className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} animate-spin mb-4`}
        style={{ color: 'var(--muted-foreground)' }}
      />
      <h4 style={{ color: 'var(--foreground)', textAlign: 'center', marginBottom: '4px' }}>
        {title}
      </h4>
      {description && (
        <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: '360px' }}>
          {description}
        </p>
      )}
    </div>
  );
}
