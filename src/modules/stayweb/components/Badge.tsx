interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'info';
  className?: string;
  pulse?: boolean;
  interactive?: boolean;
}

export function Badge({ children, variant = 'neutral', className = '', pulse = false, interactive = false }: BadgeProps) {
  const variants = {
    success: 'bg-success-bg text-success-foreground border-success-border',
    warning: 'bg-warning-bg text-warning-foreground border-warning-border',
    error: 'bg-error-bg text-error-foreground border-error-border',
    neutral: 'bg-muted text-muted-foreground border-border',
    primary: 'bg-info-bg text-info-foreground border-info-border',
    info: 'bg-info-bg text-info-foreground border-info-border',
  };

  return (
    <span
      data-slot="badge"
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-md)] border animate-badge-appear ${variants[variant]} ${pulse ? 'status-pulse' : ''} ${interactive ? 'hover-scale cursor-pointer transition-transform' : ''} ${className}`}
    >
      {children}
    </span>
  );
}