'use client';

import { useState, useEffect } from 'react';
import { Brain, X, ThumbsUp, ThumbsDown, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRecommendations, getRecommendationReason } from '@/lib/aiAssistant';
import type { Recommendation } from '@/types/ai';

const PRIORITY_COLORS: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-green-500',
    info: 'bg-purple-500'
};

interface AIAssistantProps {
    estimate?: Record<string, unknown>;
    recommendation?: Recommendation;
    action?: string;
}

export default function AIAssistant({ estimate }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [showReason, setShowReason] = useState<number | null>(null);

    useEffect(() => {
        if (estimate) {
            const recs = generateRecommendations(estimate);
            setRecommendations(recs);

            // Auto-open if there are high-priority recommendations
            if (recs.some(r => r.priority === 'critical' || r.priority === 'high')) {
                setIsOpen(true);
            }
        }
    }, [estimate]);

    interface HandleFeedbackProps {
        recommendation: Recommendation;
        action: 'accepted' | 'rejected' | string;
    }

    const handleFeedback = ({ recommendation, action }: HandleFeedbackProps) => {
        // Track feedback (could save to Supabase)
        // eslint-disable-next-line no-console
        console.log('Feedback:', recommendation.title, action);

        // Remove recommendation after feedback
        setRecommendations(recs => recs.filter(r => r !== recommendation));
    };

    const newRecsCount = recommendations.length;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-2xl transition-shadow"
            >
                <Brain size={28} />
                {newRecsCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                        {newRecsCount}
                    </span>
                )}
            </motion.button>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 400 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 400 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-white shadow-2xl z-40 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={24} />
                                    <h2 className="text-xl font-bold">AI Ассистент</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-white/90">
                                Умные рекомендации для вашего проекта
                            </p>
                        </div>

                        {/* Recommendations */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {recommendations.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Brain size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>Пока нет рекомендаций</p>
                                    <p className="text-sm mt-1">Добавьте параметры в смету</p>
                                </div>
                            ) : (
                                recommendations.map((rec: Recommendation, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-lg shadow-md p-4 border-l-4"
                                        style={{ borderLeftColor: PRIORITY_COLORS[rec.priority]?.replace('bg-', '#') || '#6B7280' }}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="text-2xl">{rec.icon}</span>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 mb-1">{rec.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                                                {rec.benefit && (
                                                    <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                        {rec.benefit}
                                                    </div>
                                                )}
                                                {rec.estimatedCost && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        ~{(rec.estimatedCost / 1000).toFixed(0)}K ₽
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                            <button
                                                onClick={() => setShowReason(showReason === index ? null : index)}
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <HelpCircle size={14} />
                                                Почему?
                                            </button>
                                            <div className="flex-1" />
                                            <button
                                                onClick={() => handleFeedback({ recommendation: rec, action: 'rejected' })}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                                            >
                                                <ThumbsDown size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleFeedback({ recommendation: rec, action: 'accepted' })}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-green-500"
                                            >
                                                <ThumbsUp size={16} />
                                            </button>
                                        </div>

                                        {/* Reason explanation */}
                                        <AnimatePresence>
                                            {showReason === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700 border-l-2 border-blue-400"
                                                >
                                                    {getRecommendationReason(rec)}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t text-center text-xs text-gray-500">
                            Рекомендации основаны на анализе более 1000 проектов
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
