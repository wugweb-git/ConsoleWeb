import React, { useState } from 'react';
import {
  CheckSquare, Square, Trash2, Download, Send, Archive, Ban,
  ChevronDown, X, Loader2, CheckCircle, AlertTriangle,
} from 'lucide-react';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  variant: 'default' | 'destructive';
  /** Confirmation message. If set, shows a confirm dialog before executing. */
  confirm?: string;
}

interface BulkOperationsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
  actions: BulkAction[];
  onAction: (actionId: string) => Promise<void> | void;
}

// ────────────────────────────────────────────
// Bulk Operations Bar
// ────────────────────────────────────────────

export function BulkOperationsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  allSelected,
  actions,
  onAction,
}: BulkOperationsBarProps) {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [showActions, setShowActions] = useState(false);

  if (selectedCount === 0) return null;

  const handleAction = async (action: BulkAction) => {
    if (action.confirm) {
      setConfirmAction(action);
      setShowActions(false);
      return;
    }
    setRunningAction(action.id);
    setShowActions(false);
    await onAction(action.id);
    setRunningAction(null);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setRunningAction(confirmAction.id);
    setConfirmAction(null);
    await onAction(confirmAction.id);
    setRunningAction(null);
  };

  return (
    <>
      {/* Floating bar */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3"
        style={{
          backgroundColor: 'var(--primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          minWidth: '320px',
        }}
      >
        {/* Select toggle */}
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          style={{ color: 'var(--primary-foreground)' }}
        >
          {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          <span style={{ fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
            {selectedCount} of {totalCount} selected
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

        {/* Quick actions (show up to 3) */}
        {actions.slice(0, 3).map(action => {
          const Icon = action.icon;
          const isRunning = runningAction === action.id;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: action.variant === 'destructive' ? 'rgba(239,67,67,0.2)' : 'rgba(255,255,255,0.1)',
                color: action.variant === 'destructive' ? 'var(--destructive)' : 'var(--primary-foreground)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
              <span>{action.label}</span>
            </button>
          );
        })}

        {/* More actions dropdown */}
        {actions.length > 3 && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center gap-1 px-3 py-1.5 transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-md)' }}
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showActions && (
              <div
                className="absolute bottom-full mb-2 right-0 py-1 min-w-[180px]"
                style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }}
              >
                {actions.slice(3).map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 transition-all hover:bg-[var(--muted)]"
                      style={{ color: action.variant === 'destructive' ? 'var(--destructive)' : 'var(--foreground)' }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Close */}
        <button
          onClick={onDeselectAll}
          className="ml-auto p-1.5 transition-opacity hover:opacity-70"
          style={{ color: 'var(--primary-foreground)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Confirmation dialog */}
      {confirmAction && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="max-w-md w-full mx-4 p-6"
            style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              {confirmAction.variant === 'destructive' ? (
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--destructive-light)', borderRadius: 'var(--radius-md)' }}>
                  <AlertTriangle className="w-5 h-5" style={{ color: 'var(--destructive)' }} />
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
                </div>
              )}
              <div>
                <h4 style={{ color: 'var(--foreground)', marginBottom: '4px' }}>
                  {confirmAction.label} — {selectedCount} items
                </h4>
                <p style={{ color: 'var(--muted-foreground)' }}>{confirmAction.confirm}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: confirmAction.variant === 'destructive' ? 'var(--destructive)' : 'var(--primary)',
                  color: confirmAction.variant === 'destructive' ? 'var(--destructive-foreground)' : 'var(--primary-foreground)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                Confirm {confirmAction.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────
// Default action sets for common entity types
// ────────────────────────────────────────────

export const credentialBulkActions: BulkAction[] = [
  { id: 'export', label: 'Export', icon: Download, variant: 'default' },
  { id: 'send', label: 'Send', icon: Send, variant: 'default' },
  { id: 'archive', label: 'Archive', icon: Archive, variant: 'default' },
  { id: 'revoke', label: 'Revoke', icon: Ban, variant: 'destructive', confirm: 'This will permanently revoke the selected credentials. This action cannot be undone.' },
  { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive', confirm: 'This will permanently delete the selected items. This action cannot be undone.' },
];

export const documentBulkActions: BulkAction[] = [
  { id: 'export', label: 'Export', icon: Download, variant: 'default' },
  { id: 'archive', label: 'Archive', icon: Archive, variant: 'default' },
  { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive', confirm: 'This will permanently delete the selected documents. This action cannot be undone.' },
];

export const userBulkActions: BulkAction[] = [
  { id: 'export', label: 'Export', icon: Download, variant: 'default' },
  { id: 'send-invite', label: 'Re-invite', icon: Send, variant: 'default' },
  { id: 'suspend', label: 'Suspend', icon: Ban, variant: 'destructive', confirm: 'This will suspend the selected users. They will lose access immediately.' },
  { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive', confirm: 'This will permanently remove the selected users.' },
];