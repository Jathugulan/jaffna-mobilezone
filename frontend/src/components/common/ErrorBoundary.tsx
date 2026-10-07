import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors in the routed tree so a single failing page shows a
 * recoverable message instead of unmounting the whole application.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unexpected UI error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="surface-card flex max-w-lg flex-col items-center gap-4 rounded-featured px-8 py-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-featured border border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink">
              Something went wrong
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-ink-3">
              {error.message || 'An unexpected error occurred while rendering this page.'}
            </p>
            <button
              onClick={this.handleReload}
              className="focus-ring mt-1 rounded-xl bg-grad-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}