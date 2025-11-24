'use client';
import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            // Could send to Sentry, LogRocket, etc.
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Что-то пошло не так
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Произошла ошибка. Попробуйте обновить страницу.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#00b4d8] text-white rounded-lg hover:bg-[#0096c7] transition-colors"
                        >
                            <RefreshCw size={20} />
                            Обновить страницу
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
