'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateManagerInsights, generateDailyDigest } from '@/lib/managerAssistant';
import { TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AssistantPage() {
    const [insights, setInsights] = useState([]);
    const [digest, setDigest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch deals
            const { data: deals } = await supabase
                .from('deals')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch requests
            const { data: requests } = await supabase
                .from('requests')
                .select('*')
                .order('created_at', { ascending: false });

            const generatedInsights = generateManagerInsights(deals || [], requests || []);
            const dailyDigest = generateDailyDigest(deals || [], requests || []);

            setInsights(generatedInsights);
            setDigest(dailyDigest);
        } catch (error) {
            console.error('Error loading assistant data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'alert': return AlertCircle;
            case 'success': return CheckCircle;
            case 'tasks': return Clock;
            case 'forecast': return DollarSign;
            case 'analytics': return TrendingUp;
            default: return Target;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-red-500 bg-red-50';
            case 'medium': return 'border-l-yellow-500 bg-yellow-50';
            case 'low': return 'border-l-blue-500 bg-blue-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Анализирую данные...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={32} className="text-purple-600" />
                    <h1 className="text-3xl font-bold text-gray-900">AI Помощник менеджера</h1>
                </div>
                <p className="text-gray-600">
                    Персональные инсайты и рекомендации на основе анализа ваших сделок
                </p>
            </div>

            {/* Daily Digest */}
            {digest && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white mb-8">
                    <h2 className="text-xl font-semibold mb-4">📊 Сводка за сегодня</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 rounded-lg p-4">
                            <div className="text-sm opacity-90">Новые заявки</div>
                            <div className="text-3xl font-bold">{digest.summary.newRequests}</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-4">
                            <div className="text-sm opacity-90">Закрыто сделок</div>
                            <div className="text-3xl font-bold">{digest.summary.closedDeals}</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-4">
                            <div className="text-sm opacity-90">Выручка</div>
                            <div className="text-2xl font-bold">{(digest.summary.revenue / 1000000).toFixed(1)}M₽</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-4">
                            <div className="text-sm opacity-90">В работе</div>
                            <div className="text-3xl font-bold">{digest.summary.activeDeals}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Insights */}
            <div className="grid gap-6">
                {insights.map((insight, index) => {
                    const Icon = getIconForType(insight.type);
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border-l-4 rounded-lg p-6 ${getPriorityColor(insight.priority)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-lg">
                                    <Icon size={24} className="text-gray-700" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{insight.icon}</span>
                                        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">{insight.description}</p>

                                    {/* Tasks */}
                                    {insight.tasks && (
                                        <div className="space-y-2">
                                            {insight.tasks.slice(0, 5).map((task, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <input type="checkbox" className="rounded" />
                                                    <span className="text-gray-800">{task.title}</span>
                                                    {task.priority === 'high' && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Срочно</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {insight.action && (
                                        <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                                            {insight.action.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {insights.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Всё отлично! 🎉</h3>
                        <p className="text-gray-600">Нет срочных задач. Продолжайте в том же духе!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
