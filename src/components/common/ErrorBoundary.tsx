import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false,
      showDetails: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NUMM Platform ErrorBoundary intercepted runtime exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleCopyDiagnostic = () => {
    const text = `NUMM Error Diagnostic:\nError: ${this.state.error?.message || 'Unknown error'}\nStack: ${this.state.error?.stack || ''}\nComponentStack: ${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 h-full min-h-[450px]">
          <div
            className="w-full max-w-xl rounded-2xl border p-7 shadow-2xl backdrop-blur-md animate-fade-in"
            style={{
              background: 'var(--card-bg, #111927)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: 'var(--text-primary, #f9fafb)'
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10">
                  Resilience Shield · Non-Fatal Handled
                </span>
                <h3 className="text-lg font-bold mt-1.5 text-slate-100">
                  {this.props.fallbackTitle || 'Component View Encountered an Anomaly'}
                </h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  The application state was protected by NUMM fault-tolerance. Your background services and database remain fully synchronized.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div
              className="p-3.5 rounded-lg border text-xs font-mono mb-5 overflow-x-auto"
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171'
              }}
            >
              <div className="font-semibold text-red-400 mb-1">Exception Trace:</div>
              <div>{this.state.error?.message || 'Unknown runtime error occurred.'}</div>
            </div>

            {/* Collapsible Technical Details */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {this.state.showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>Technical Stack Trace ({this.state.showDetails ? 'Hide' : 'Show'})</span>
              </button>

              {this.state.showDetails && (
                <pre
                  className="mt-2 p-3 rounded-lg text-[11px] font-mono max-h-48 overflow-y-auto leading-tight"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {this.state.error?.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={this.handleCopyDiagnostic}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{this.state.copied ? 'Copied Log' : 'Copy Log'}</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-xs px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Reload App</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="text-xs px-4 py-1.5 rounded-lg font-medium text-white flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-emerald-900/30"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recover View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
