'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Phone, Mail, Calculator, Send, Edit, Trash2, TableIcon, Sparkles } from 'lucide-react';
import { calculateDealProbability } from '@/lib/dealPredictor';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const STATUS_COLORS = {
    new: 'bg-purple-500',
    calculated: 'bg-yellow-500',
    sent: 'bg-green-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-gray-500'
};

const STATUS_LABELS = {
    new: 'Новая',
    calculated: 'Просчитано',
    sent: 'Отправлено',
    in_progress: 'В работе',
    completed: 'Завершено'
};

export default function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchRequests();

        // Realtime subscription
        const channel = supabase
            .channel('requests_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'requests'
                },
                () => {
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Не удалось загрузить заявки');
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success('Статус обновлен');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Ошибка обновления');
        }
    };

    const deleteRequest = async (id) => {
        if (!confirm('Удалить заявку?')) return;

        try {
            const { error } = await supabase
                .from('requests')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Заявка удалена');
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('Ошибка удаления');
        }
    };

    return (
        <div className="p-6 max-w-[2000px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TableIcon size={32} className="text-cyan-bright" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Заявки</h1>
                        <p className="text-gray-400">Всего заявок: {requests.length}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-gradient-primary hover:opacity-90 text-white rounded-lg font-medium flex items-center gap-2 transition-opacity"
                >
                    <Plus size={20} />
                    Новая заявка
                </button>
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Дата</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Телефон</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Тип</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Размеры</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Адрес</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Дата работы</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Менеджер</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">🎯 AI</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Статус</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Заметки</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {requests.map((request, index) => (
                                <motion.tr
                                    key={request.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-750 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        {new Date(request.date).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <a href={`tel:${request.phone}`} className="text-cyan-bright hover:underline flex items-center gap-1">
                                            <Phone size={14} />
                                            {request.phone}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{request.type || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{request.size || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{request.address || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        {request.work_date ? new Date(request.work_date).toLocaleDateString('ru-RU') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{request.manager || '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            const prob = calculateDealProbability(request);
                                            return (
                                                <div className="flex items-center justify-center gap-1" title={prob.category.label}>
                                                    <span className="text-xl">{prob.category.emoji}</span>
                                                    <span className="text-sm font-semibold text-gray-300">{prob.score}%</span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={request.status}
                                            onChange={(e) => updateStatus(request.id, e.target.value)}
                                            className={`px-3 py-1 rounded text-white text-sm font-medium cursor-pointer ${STATUS_COLORS[request.status]} border-none focus:ring-2 focus:ring-cyan-bright`}
                                        >
                                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                                        {request.notes || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => window.location.href = '/calculator'}
                                                className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                                                title="Просчитать"
                                            >
                                                <Calculator size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(request.id, 'sent')}
                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                                title="Отправить"
                                                disabled={request.status === 'sent'}
                                            >
                                                <Send size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteRequest(request.id)}
                                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                                title="Удалить"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {requests.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <TableIcon size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Нет заявок</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
