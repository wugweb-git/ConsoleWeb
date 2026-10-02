import type { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Badge shown after title (e.g. "Admin Tool") */
  badge?: string;
  /** Action buttons on the right */
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, description, icon: Icon, badge, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 bg-muted rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-[length:var(--text-xl)] text-card-foreground font-[var(--font-weight-semibold)] leading-tight">{title}</h3>
            {badge && (
              <span className="px-2.5 py-0.5 bg-muted border border-border rounded-full text-[length:var(--text-2xs)] text-muted-foreground font-[var(--font-weight-semibold)] tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[length:var(--text-sm)] text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}