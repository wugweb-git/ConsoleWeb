import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { STAYWEB_LOGO_URL } from '../utils/constants';

interface Props {
  children: ReactNode;
  /** Optional fallback to render instead of default error UI */
  fallback?: ReactNode;
  /** Optional: name of the boundary for better error reporting */
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const label = this.props.name ? `[ErrorBoundary:${this.props.name}]` : '[ErrorBoundary]';
    console.error(`${label} Uncaught error:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleCopyError = () => {
    const errorText = [
      `Error: ${this.state.error?.toString()}`,
      `Component Stack: ${this.state.errorInfo?.componentStack || 'N/A'}`,
      `Timestamp: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `User Agent: ${navigator.userAgent}`,
    ].join('\n');

    navigator.clipboard.writeText(errorText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            {/* Brand */}
            <div className="flex justify-center mb-6">
              <img
                src={STAYWEB_LOGO_URL}
                alt="StayWeb"
                className="w-12 h-12 rounded-[var(--radius-lg)] shadow-sm opacity-40"
              />
            </div>

            {/* Icon */}
            <div className="w-16 h-16 bg-error-bg rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>

            {/* Heading */}
            <h3 className="text-[length:var(--text-xl)] font-[var(--font-weight-semibold)] text-card-foreground mb-2">
              Something went wrong
            </h3>

            <p className="text-[length:var(--text-base)] font-[var(--font-weight-regular)] text-muted-foreground mb-6 leading-relaxed">
              The application encountered an unexpected error. This has been logged for investigation.
            </p>

            {/* Error detail */}
            <div className="bg-muted rounded-[var(--radius-lg)] p-4 text-left mb-6 overflow-auto max-h-36 relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider">
                  Error Details
                </p>
                <button
                  onClick={this.handleCopyError}
                  className="flex items-center gap-1 text-[length:var(--text-2xs)] font-[var(--font-weight-medium)] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-[var(--radius-sm)] hover:bg-background"
                >
                  {this.state.copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-[length:var(--text-xs)] font-[var(--font-weight-regular)] text-muted-foreground break-all">
                {this.state.error?.toString()}
              </p>
            </div>

            {/* Skeleton placeholder behind error */}
            <div className="mb-6 space-y-2 opacity-15">
              <div className="h-3 bg-muted rounded-sm animate-pulse" />
              <div className="h-3 bg-muted rounded-sm animate-pulse w-4/5" />
              <div className="h-3 bg-muted rounded-sm animate-pulse w-3/5" />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReload} variant="default" className="min-h-[44px]">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reload Application
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="min-h-[44px]">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {/* Support note */}
            <p className="text-[length:var(--text-xs)] font-[var(--font-weight-regular)] text-muted-foreground/60 mt-6">
              If this keeps happening, contact{' '}
              <a
                href="mailto:hello@wugweb.com"
                className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                hello@wugweb.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
