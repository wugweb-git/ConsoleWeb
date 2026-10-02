import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  compact?: boolean;
}

export function EmptyState({ icon: Icon = FileX, title, description, action, compact = false }: EmptyStateProps) {
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
          backgroundColor: 'var(--muted)',
          borderRadius: 'var(--radius-full)',
        }}
      >
        <Icon className={compact ? 'w-5 h-5' : 'w-6 h-6'} style={{ color: 'var(--muted-foreground)' }} />
      </div>
      <h4 style={{ color: 'var(--foreground)', textAlign: 'center', marginBottom: '4px' }}>
        {title}
      </h4>
      {description && (
        <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: '360px' }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2.5 mt-5 transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
}