import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in NUMM component tree:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.hash = '';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen w-full flex items-center justify-center p-6"
          style={{
            backgroundColor: 'var(--bg, #070908)',
            color: 'var(--text-primary, #F3F4F6)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            className="max-w-xl w-full rounded-2xl p-8 space-y-6 shadow-2xl border animate-fade-in"
            style={{
              backgroundColor: 'var(--bg-card, #0C0E0D)',
              borderColor: 'var(--border, #232825)',
            }}
          >
            {/* Header with Error Badge */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <span className="material-symbols-outlined text-[26px]">error</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {this.props.fallbackTitle || "Application Runtime Exception"}
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-muted, #9CA3AF)' }}>
                  National Unified Material Master · Client Boundary Protection
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div
              className="p-4 rounded-xl border text-xs font-mono space-y-2"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                color: '#F87171',
              }}
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                <span className="material-symbols-outlined text-[15px]">report</span>
                <span>Error Message</span>
              </div>
              <p className="break-words leading-relaxed text-xs">
                {this.state.error?.message || 'An unexpected runtime error occurred while rendering this interface.'}
              </p>
            </div>

            {/* Guidance Text */}
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary, #A7ADA9)' }}>
              Catalog data in local storage and backend state is preserved. You can safely return to the Executive Dashboard or reload the page to restore the application state.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex-1 h-10 px-5 rounded-lg text-xs font-bold text-black flex items-center justify-center gap-2 transition-all hover:brightness-110 cursor-pointer shadow-md"
                style={{ backgroundColor: '#10B981' }}
              >
                <span className="material-symbols-outlined text-[17px]">dashboard</span>
                <span>Return to Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto h-10 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg-hover, #141715)',
                  borderColor: 'var(--border, #232825)',
                  color: 'var(--text-primary, #F3F4F6)',
                }}
              >
                <span className="material-symbols-outlined text-[17px]">refresh</span>
                <span>Reload Page</span>
              </button>
            </div>

            {/* Collapsible Technical Details for Debugging */}
            {this.state.errorInfo && (
              <details className="pt-2 border-t border-white/5 text-[11px] text-[#6B7280]">
                <summary className="cursor-pointer hover:text-[#9CA3AF] transition-colors font-mono select-none">
                  View component stack trace
                </summary>
                <pre
                  className="mt-2 p-3 rounded-lg overflow-x-auto max-h-40 font-mono text-[10px] leading-tight"
                  style={{
                    backgroundColor: 'var(--bg-input, #070908)',
                    color: 'var(--text-muted, #9CA3AF)',
                    border: '1px solid var(--border, #232825)',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
