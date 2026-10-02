import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
  /** Color class for the value text */
  valueColor?: string;
}

export function StatCard({ label, value, subtext, icon: Icon, className = '', valueColor = 'text-card-foreground' }: StatCardProps) {
  return (
    <div className={`bg-card border border-border rounded-[var(--radius-md)] p-4 interactive-card ${className}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-primary/10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <p className={`text-2xl font-[var(--font-weight-semibold)] leading-none m-0 ${valueColor} animate-number-pop`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <label className="text-muted-foreground mt-1">{label}</label>
          {subtext && <p className="text-2xs text-muted-foreground/70 mt-0.5 line-clamp-1 m-0">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}