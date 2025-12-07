'use client';
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 */
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: (props: { error: Error | null; errorInfo: React.ErrorInfo | null; resetError: () => void }) => React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    onReset?: () => void;
    title?: string;
    message?: string;
    showHomeButton?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(_error: Error) {
        return { hasError: true };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log to error reporting service
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    override render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    errorInfo: this.state.errorInfo,
                    resetError: this.handleReset
                });
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-deep to-slate-900 p-4">
                    <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            {this.props.title || 'Что-то пошло не так'}
                        </h1>

                        <p className="text-white/60 mb-6">
                            {this.props.message || 'Произошла ошибка при загрузке этой части приложения.'}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-cyan-400 mb-2">
                                    Детали ошибки (dev only)
                                </summary>
                                <pre className="text-xs text-red-300 bg-black/30 p-4 rounded overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="
                                    px-6 py-3 rounded-lg
                                    bg-cyan-500 hover:bg-cyan-600
                                    text-white font-medium
                                    transition-colors
                                    flex items-center gap-2
                                "
                            >
                                <RefreshCw size={18} />
                                Попробовать снова
                            </button>

                            {this.props.showHomeButton !== false && (
                                <a
                                    href="/"
                                    className="
                                        px-6 py-3 rounded-lg
                                        bg-white/10 hover:bg-white/20
                                        text-white font-medium
                                        transition-colors
                                    "
                                >
                                    На главную
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
