import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught rendering exception:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear storage keys to resolve potential parsing or state anomalies
      localStorage.removeItem('vaidik_ai_profile');
      localStorage.removeItem('vaidik_ai_scans');
      localStorage.removeItem('vaidik_ai_auth');
    } catch (_) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-container" className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm text-center space-y-6">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">System Exception Detected</h1>
              <p className="text-xs text-stone-500 leading-relaxed">
                The application encountered an unexpected runtime anomaly or browser extension conflict.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-50 rounded-lg p-3 text-[11px] font-mono text-stone-600 text-left border border-stone-100 max-h-32 overflow-y-auto leading-relaxed break-all">
                {this.state.error.stack || this.state.error.message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset & Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
