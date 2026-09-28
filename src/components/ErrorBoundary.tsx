"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-red-50 to-white">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Something went wrong
              </h2>
              <p className="mt-3 text-sm text-gray-600 text-center leading-relaxed">
                We encountered an unexpected error. Try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error Details — collapsible for debugging */}
              {this.state.error && (
                <ErrorDetailsCollapsible error={this.state.error} />
              )}

              <div className="mt-8 flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  Go Home
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

function ErrorDetailsCollapsible({ error }: { error: Error }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6 rounded-lg bg-gray-50 p-4 border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors w-full"
        aria-expanded={expanded}
      >
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        Error Details
      </button>
      {expanded && (
        <div className="mt-3 text-xs text-gray-600 font-mono bg-white p-3 rounded border border-gray-200 overflow-auto max-h-32">
          <div className="font-semibold text-gray-900 mb-1">{error.name}</div>
          <div className="text-gray-600 whitespace-pre-wrap break-words">{error.message}</div>
        </div>
      )}
    </div>
  );
}
