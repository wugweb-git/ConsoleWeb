import React from 'react';
import type { ConfigCategory } from '../../stores/platformConfig';
import { getStatusStyle } from '../../stores/platformConfig';

interface StatusBadgeProps {
  /** The config category ID, e.g. 'credential-statuses' or 'statuses' (unified) */
  categoryId: string;
  /** The status value, e.g. 'issued' */
  value: string;
  /** Platform config (pass from parent state) */
  config: ConfigCategory[];
  /** Optional size */
  size?: 'sm' | 'md';
}

export function StatusBadge({ categoryId, value, config, size = 'sm' }: StatusBadgeProps) {
  const style = getStatusStyle(config, categoryId, value);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        backgroundColor: style.bgColor,
        color: style.color,
        padding: size === 'sm' ? '2px 10px' : '4px 14px',
        fontWeight: 'var(--font-weight-medium)',
      }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: size === 'sm' ? '6px' : '8px',
          height: size === 'sm' ? '6px' : '8px',
          backgroundColor: style.color,
        }}
      />
      {style.label}
    </span>
  );
}

/** Simple badge without config — for static labels */
interface SimpleBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'destructive' | 'muted';
}

export function SimpleBadge({ children, variant = 'default' }: SimpleBadgeProps) {
  const variants = {
    default: { bg: 'var(--muted)', color: 'var(--foreground)' },
    accent: { bg: 'rgba(255, 190, 26, 0.1)', color: 'var(--accent)' },
    destructive: { bg: 'rgba(239, 67, 67, 0.1)', color: 'var(--destructive)' },
    muted: { bg: 'var(--muted)', color: 'var(--muted-foreground)' },
  };

  const v = variants[variant];

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5"
      style={{
        backgroundColor: v.bg,
        color: v.color,
        fontWeight: 'var(--font-weight-medium)',
      }}
    >
      {children}
    </span>
  );
}