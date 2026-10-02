import React from 'react';

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function AppInput({ label, error, icon, className = '', style, ...props }: AppInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label style={{ color: 'var(--foreground)' }}>{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-md transition-all ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 ${className}`}
          style={{
            backgroundColor: 'var(--input-background)',
            border: error ? '1px solid var(--destructive)' : '1px solid var(--border)',
            color: 'var(--foreground)',
            boxShadow: 'var(--elevation-sm)',
            outline: 'none',
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ color: 'var(--destructive)' }}>{error}</p>
      )}
    </div>
  );
}

interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function AppSelect({ label, options, className = '', style, ...props }: AppSelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label style={{ color: 'var(--foreground)' }}>{label}</label>
      )}
      <select
        className={`w-full rounded-md px-3 py-2.5 ${className}`}
        style={{
          backgroundColor: 'var(--input-background)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          boxShadow: 'var(--elevation-sm)',
          outline: 'none',
          ...style,
        }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
