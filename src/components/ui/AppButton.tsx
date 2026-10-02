import React from 'react';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    fontWeight: 'var(--font-weight-medium)',
  },
  secondary: {
    backgroundColor: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    fontWeight: 'var(--font-weight-medium)',
  },
  accent: {
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-foreground)',
    fontWeight: 'var(--font-weight-medium)',
  },
  destructive: {
    backgroundColor: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    fontWeight: 'var(--font-weight-medium)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontWeight: 'var(--font-weight-regular)',
  },
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 rounded-md',
  md: 'px-4 py-2.5 rounded-lg',
  lg: 'px-6 py-3 rounded-lg',
};

export function AppButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  style,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 ${sizeClasses[size]} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
