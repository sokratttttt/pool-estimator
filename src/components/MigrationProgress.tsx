/**
 * Migration Progress Component
 * Shows development-only migration status
 */

'use client';

import { useEstimateStore } from '@/stores/estimate-store';
import { useEffect, useState } from 'react';

export function MigrationProgress() {
    const selection = useEstimateStore((state: any) => state.selection);
    const historyIndex = useEstimateStore((state: any) => state.historyIndex);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show in development
        setIsVisible(process.env.NODE_ENV === 'development');
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4 text-xs shadow-lg z-50 max-w-xs">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="font-bold text-blue-900">🔄 Migration Status</div>
            </div>

            <div className="space-y-2 text-gray-700">
                <div className="flex items-center justify-between">
                    <span>Zustand Store:</span>
                    <span className="font-semibold text-green-600">✅ Active</span>
                </div>

                <div className="flex items-center justify-between">
                    <span>Selection State:</span>
                    <span className="font-mono text-xs text-blue-600">
                        {Object.keys(selection).filter(k => selection[k as keyof typeof selection]).length} items
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span>History Depth:</span>
                    <span className="font-mono text-xs text-purple-600">{historyIndex + 1}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span>React Query:</span>
                    <span className="font-semibold text-green-600">✅ Integrated</span>
                </div>

                <div className="flex items-center justify-between">
                    <span>TypeScript:</span>
                    <span className="font-semibold text-yellow-600">🟡 In Progress</span>
                </div>

                <div className="flex items-center justify-between">
                    <span>Error Boundary:</span>
                    <span className="font-semibold text-green-600">✅ Active</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Migration Phase 1</span>
                    <span className="font-semibold text-blue-600">Week 1 ✅</span>
                </div>
            </div>
        </div>
    );
}
