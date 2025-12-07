'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Phone, Mail, MapPin, User, Edit2, Trash2, FileText,
    ChevronUp, ChevronDown, CheckCircle2
} from 'lucide-react';
import AppleCard from '../apple/AppleCard';
import AppleButton from '../apple/AppleButton';
import { EmptyState, LoadingSkeleton } from '../ui';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const REQUEST_TYPES: Record<string, string> = {
    construction: 'Строительство',
    repair: 'Ремонт',
    equipment: 'Оборудование',
    other: 'Другое'
};

const STATUSES: Record<string, { label: string; color: string }> = {
    new: { label: 'Новая', color: 'bg-blue-500' },
    in_progress: { label: 'В работе', color: 'bg-yellow-500' },
    contacted: { label: 'Связались', color: 'bg-purple-500' },
    estimate_sent: { label: 'Смета отправлена', color: 'bg-cyan-500' },
    completed: { label: 'Завершена', color: 'bg-green-500' },
    cancelled: { label: 'Отменена', color: 'bg-red-500' }
};

const FORECAST_STATUSES: Record<string, { label: string; color: string }> = {
    hot: { label: 'Горячая', color: 'bg-red-500' },
    warm: { label: 'Теплая', color: 'bg-orange-500' },
    cold: { label: 'Холодная', color: 'bg-blue-400' },
    neutral: { label: 'Нейтральная', color: 'bg-gray-500' }
};

import { RequestData } from './RequestForm';

interface RequestsTableProps {
    requests?: RequestData[];
    onEdit?: (request: RequestData) => void;
    onDelete?: (id: string) => void;
    onCreateEstimate?: (request: RequestData) => void;
    loading?: boolean;
}

export default function RequestsTable({ requests = [], onEdit, onDelete, onCreateEstimate, loading }: RequestsTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof RequestData; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Sorting logic
    const sortedRequests = useMemo(() => {
        if (!requests) return [];

        return [...requests].sort((a: RequestData, b: RequestData) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal === bVal) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                const comparison = aVal.localeCompare(bVal);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [requests, sortConfig]);

    const handleSort = (key: keyof RequestData) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof RequestData }) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ?
            <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedIds(prev =>
            prev.length === requests.length ? [] : requests.map(r => r.id!)
        );
    };

    if (loading) {
        return <LoadingSkeleton type="table" count={5} />;
    }

    if (!requests || requests.length === 0) {
        return (
            <EmptyState
                icon={<FileText size={64} />}
                title="Нет активных заявок"
                description="Создайте новую заявку или дождитесь входящих запросов от клиентов"
                action={{
                    label: 'Новая заявка',
                    onClick: () => { }, // This will be handled by parent component
                    variant: 'primary'
                }}
            />
        );
    }

    return (
        <AppleCard variant="premium" className="overflow-hidden">
            {selectedIds.length > 0 && (
                <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-6 py-3 flex items-center justify-between">
                    <span className="apple-body text-cyan-bright">
                        Выбрано: {selectedIds.length}
                    </span>
                    <div className="flex gap-2">
                        <AppleButton size="sm" variant="secondary" onClick={() => setSelectedIds([])}>
                            Отменить
                        </AppleButton>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-apple-bg-secondary border-b border-apple-border">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === requests.length}
                                    onChange={toggleSelectAll}
                                    className="rounded"
                                />
                            </th>
                            <th
                                className="px-4 py-3 text-left cursor-pointer hover:bg-apple-bg-tertiary transition-colors"
                                onClick={() => handleSort('client_name')}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="apple-body font-semibold">Клиент</span>
                                    <SortIcon columnKey="client_name" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="apple-body font-semibold">Контакты</span>
                            </th>
                            <th
                                className="px-4 py-3 text-left cursor-pointer hover:bg-apple-bg-tertiary transition-colors"
                                onClick={() => handleSort('request_type')}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="apple-body font-semibold">Тип</span>
                                    <SortIcon columnKey="request_type" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="apple-body font-semibold">Размеры</span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="apple-body font-semibold">Локация</span>
                            </th>
                            <th
                                className="px-4 py-3 text-left cursor-pointer hover:bg-apple-bg-tertiary transition-colors"
                                onClick={() => handleSort('manager')}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="apple-body font-semibold">Менеджер</span>
                                    <SortIcon columnKey="manager" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="apple-body font-semibold">Прогноз</span>
                            </th>
                            <th
                                className="px-4 py-3 text-left cursor-pointer hover:bg-apple-bg-tertiary transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="apple-body font-semibold">Статус</span>
                                    <SortIcon columnKey="status" />
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left cursor-pointer hover:bg-apple-bg-tertiary transition-colors"
                                onClick={() => handleSort('created_at')}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="apple-body font-semibold">Дата</span>
                                    <SortIcon columnKey="created_at" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <span className="apple-body font-semibold">Действия</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRequests.map((request: RequestData, index: number) => (
                            <motion.tr
                                key={request.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="border-b border-apple-border hover:bg-apple-bg-secondary transition-colors"
                            >
                                <td className="px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={request.id ? selectedIds.includes(request.id) : false}
                                        onChange={() => request.id && toggleSelection(request.id)}
                                        className="rounded"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                                            {request.client_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="apple-body font-medium text-white">
                                                {request.client_name || 'Без имени'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="space-y-1">
                                        {request.phone && (
                                            <div className="flex items-center gap-2 apple-caption">
                                                <Phone size={14} className="text-cyan-bright" />
                                                <a href={`tel:${request.phone}`} className="hover:text-cyan-bright">
                                                    {request.phone}
                                                </a>
                                            </div>
                                        )}
                                        {request.email && (
                                            <div className="flex items-center gap-2 apple-caption">
                                                <Mail size={14} className="text-purple-400" />
                                                <a href={`mailto:${request.email}`} className="hover:text-purple-400">
                                                    {request.email}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="apple-caption px-2 py-1 rounded-lg bg-apple-bg-tertiary">
                                        {REQUEST_TYPES[request.request_type] || request.request_type}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="apple-caption">{request.dimensions || '—'}</span>
                                </td>
                                <td className="px-4 py-4">
                                    {request.location && (
                                        <div className="flex items-center gap-2 apple-caption">
                                            <MapPin size={14} className="text-green-400" />
                                            <span>{request.location}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    {request.manager ? (
                                        <div className="flex items-center gap-2 apple-caption">
                                            <User size={14} className="text-blue-400" />
                                            <span>{request.manager}</span>
                                        </div>
                                    ) : (
                                        <span className="apple-caption text-gray-500">Не назначен</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    {request.forecast_status && (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${FORECAST_STATUSES[request.forecast_status]?.color}`} />
                                            <span className="apple-caption">
                                                {FORECAST_STATUSES[request.forecast_status]?.label}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${STATUSES[request.status]?.color}`}>
                                        {STATUSES[request.status]?.label}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="apple-caption">
                                        {request.created_at && formatDistanceToNow(new Date(request.created_at), {
                                            addSuffix: true,
                                            locale: ru
                                        })}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {!request.estimate_id && onCreateEstimate && (
                                            <button
                                                onClick={() => onCreateEstimate(request)}
                                                className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
                                                title="Создать смету"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(request)}
                                                className="p-2 rounded-lg hover:bg-cyan-500/20 text-cyan-bright transition-colors"
                                                title="Редактировать"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        )}
                                        {onDelete && request.id && (
                                            <button
                                                onClick={() => onDelete(request.id!)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                                title="Удалить"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppleCard>
    );
}
