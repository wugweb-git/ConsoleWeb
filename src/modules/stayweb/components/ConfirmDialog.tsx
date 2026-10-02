import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, ShieldAlert, X } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'destructive' shows red confirm button, 'warning' shows amber/warning */
  variant?: 'destructive' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when the dialog opens (safer default)
  useEffect(() => {
    if (open) {
      // Trap focus inside the dialog
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onCancel]);

  if (!open) return null;

  const iconMap = {
    destructive: <Trash2 className="w-6 h-6 text-destructive" />,
    warning: <AlertTriangle className="w-6 h-6 text-warning" />,
    default: <ShieldAlert className="w-6 h-6 text-info" />,
  };

  const confirmButtonStyles = {
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/30',
    warning:
      'bg-warning text-primary-foreground hover:bg-warning/90 focus:ring-warning/30',
    default:
      'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/30',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-[var(--radius-lg)] shadow-sm w-full max-w-md animate-slide-up">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
                variant === 'destructive'
                  ? 'bg-error-bg'
                  : variant === 'warning'
                    ? 'bg-warning-bg'
                    : 'bg-info-bg'
              }`}
            >
              {iconMap[variant]}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-dialog-title"
                className="text-card-foreground font-[var(--font-weight-semibold)] leading-tight"
              >
                {title}
              </h3>
              {description && (
                <p
                  id="confirm-dialog-desc"
                  className="text-muted-foreground text-sm mt-1.5 leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20 rounded-b-[var(--radius-lg)]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-[var(--font-weight-medium)] text-card-foreground bg-card border border-border rounded-[var(--radius-md)] hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-[var(--font-weight-medium)] rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 ${confirmButtonStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}