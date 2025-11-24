import { Sparkles } from 'lucide-react';

export default function LoadingSpinner({ fullScreen = true }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 animate-pulse flex items-center justify-center shadow-glow">
                    <Sparkles className="text-white animate-spin-slow" size={32} />
                </div>
                <div className="absolute -inset-4 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
            </div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">Загрузка...</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}
