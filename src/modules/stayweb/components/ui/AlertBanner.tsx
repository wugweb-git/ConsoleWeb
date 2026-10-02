import { CheckCircle, XCircle, AlertTriangle, Info, type LucideIcon } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
  variant: AlertVariant;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

const variantConfig: Record<AlertVariant, { bg: string; text: string; border: string; Icon: LucideIcon }> = {
  success: { bg: 'bg-success-bg', text: 'text-success-foreground', border: 'border-success-border', Icon: CheckCircle },
  error:   { bg: 'bg-error-bg',   text: 'text-error-foreground',   border: 'border-error-border',   Icon: XCircle },
  warning: { bg: 'bg-warning-bg', text: 'text-warning-foreground', border: 'border-warning-border', Icon: AlertTriangle },
  info:    { bg: 'bg-info-bg',    text: 'text-info-foreground',    border: 'border-info-border',    Icon: Info },
};

export function AlertBanner({ variant, title, description, icon, action, className = '' }: AlertBannerProps) {
  const cfg = variantConfig[variant];
  const IconComponent = icon || cfg.Icon;

  return (
    <div className={`px-4 py-3 rounded-[var(--radius-md)] border ${cfg.bg} ${cfg.text} ${cfg.border} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)]">{title}</p>
            {description && (
              <p className="text-[length:var(--text-xs)] font-[var(--font-weight-regular)] mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}