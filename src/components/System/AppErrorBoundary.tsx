import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../services/logger';
import { reportClientError } from '../../services/clientDiagnostics';

export interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(_error: Error): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const metadata = { componentStack: errorInfo?.componentStack };
    logger.error('AppErrorBoundary', 'unhandled_react_render_error', error, metadata);
    reportClientError('AppErrorBoundary', 'unhandled_react_render_error', error, metadata);
  }

  public handleReload = (): void => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-stone-900/90 border border-stone-800 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-stone-100 mb-2">Something went wrong</h1>
            <p className="text-sm text-stone-400 mb-6 leading-relaxed">
              An unexpected error occurred while rendering the page. Please reload TerroirTrail and try again.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition duration-150 ease-in-out cursor-pointer shadow-lg shadow-amber-900/20"
            >
              Reload TerroirTrail
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
