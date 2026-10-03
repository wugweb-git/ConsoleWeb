import { Component, type ReactNode } from 'react';
import { ErrorState } from '../components/ui/ErrorState';
import type { ModuleManifest } from './types';
import { missingEnv } from './backend';

// Keeps one module's failures on that module's screens: missing backend
// configuration or a render error never takes down the console.
class Boundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="p-12">
        <ErrorState
          title={`${this.props.name} could not load`}
          description={this.state.error.message}
          onRetry={() => this.setState({ error: null })}
        />
      </div>
    );
  }
}

export function ModuleBoundary({ manifest, children }: { manifest: ModuleManifest; children: ReactNode }) {
  const missing = missingEnv(manifest);
  if (missing.length > 0) {
    return (
      <div className="p-12">
        <ErrorState
          title={`${manifest.name} is not configured`}
          description={`Set ${missing.join(', ')} in .env.local and restart.`}
        />
      </div>
    );
  }
  return <Boundary key={manifest.id} name={manifest.name}>{children}</Boundary>;
}
