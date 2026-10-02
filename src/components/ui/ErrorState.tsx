import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

export function ErrorState({
  icon: Icon = AlertTriangle,
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8"
      style={{ minHeight: compact ? '180px' : '320px', paddingTop: compact ? '24px' : '64px', paddingBottom: compact ? '24px' : '64px' }}
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: compact ? '40px' : '56px',
          height: compact ? '40px' : '56px',
          backgroundColor: 'var(--destructive-light)',
          borderRadius: 'var(--radius-full)',
        }}
      >
        <Icon
          className={compact ? 'w-5 h-5' : 'w-6 h-6'}
          style={{ color: 'var(--destructive)' }}
        />
      </div>
      <h4 style={{ color: 'var(--foreground)', textAlign: 'center', marginBottom: '4px' }}>
        {title}
      </h4>
      {description && (
        <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: '400px' }}>
          {description}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2.5 mt-5 transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <RefreshCw className="w-4 h-4" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
