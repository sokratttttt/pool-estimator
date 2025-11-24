'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Trash2, Eye, Copy, Calendar, Search, SortAsc, SortDesc } from 'lucide-react';
import AppleButton from '../../components/apple/AppleButton';
import AppleCard from '../../components/apple/AppleCard';
import ContextMenu from '@/components/ContextMenu';
import { SkeletonListItem } from '@/components/Skeleton';
import { useHistory } from '../../context/HistoryContext';
import { useEstimate } from '../../context/EstimateContext';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { toast } from 'sonner';

export default function HistoryPage() {
    const { estimates, updateEstimate, deleteEstimate, duplicateEstimate } = useHistory();
    const { setSelection } = useEstimate();
    const router = useRouter();
    const [deletingId, setDeletingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, [estimates]);

    const handleLoad = (estimate) => {
        let selection = estimate.selection || {};
        let items = estimate.items || selection.items || [];

        if (!selection.items && items.length > 0) {
            selection = {
                ...selection,
                items: items,
                clientInfo: selection.clientInfo || {
                    name: '',
                    phone: '',
                    email: '',
                    managerName: 'Платон',
                    managerPhone: '+7 (919) 296-16-47'
                }
            };
        }

        if (!selection.items || selection.items.length === 0) {
            toast.error('Ошибка: пустая смета');
            return;
        }

        try {
            setSelection(selection);
            localStorage.setItem('pool-estimate-selection', JSON.stringify(selection));
            localStorage.setItem('mos-pool-current-estimate', JSON.stringify({ ...estimate, selection }));
            toast.success(`Загружена смета: ${estimate.name}`);
            setTimeout(() => router.push('/calculator?step=summary'), 100);
        } catch (error) {
            console.error('Ошибка загрузки сметы:', error);
            toast.error('Не удалось загрузить смету');
        }
    };

    const handleDelete = async (id, name) => {
        if (confirm(`Удалить смету "${name}"?`)) {
            setDeletingId(id);
            setTimeout(() => {
                deleteEstimate(id);
                toast.success('Смета удалена');
                setDeletingId(null);
            }, 300);
        }
    };

    const handleDuplicate = (id) => {
        const newId = duplicateEstimate(id);
        if (newId) toast.success('Смета скопирована');
    };

    const handleExportExcel = async (estimate) => {
        try {
            const clientInfo = estimate.selection?.clientInfo || { name: '', phone: '', email: '' };
            await exportToExcel(estimate.items, estimate.total, clientInfo);
            toast.success('Excel экспортирован');
        } catch (error) {
            console.error(error);
            toast.error('Ошибка экспорта');
        }
    };

    const handleExportPDF = async (estimate) => {
        try {
            const clientInfo = estimate.selection?.clientInfo || { name: '', phone: '', email: '' };
            await exportToPDF(estimate.items, estimate.total, clientInfo);
            toast.success('PDF экспортирован');
        } catch (error) {
            console.error(error);
            toast.error('Ошибка экспорта');
        }
    };

    const filteredEstimates = useMemo(() => {
        let filtered = estimates.filter(estimate =>
            estimate.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (statusFilter !== 'all') {
            filtered = filtered.filter(estimate => (estimate.status || 'draft') === statusFilter);
        }

        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'total') {
                comparison = a.total - b.total;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [estimates, searchQuery, sortBy, sortOrder, statusFilter]);

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    return (
        <div className="min-h-screen bg-apple-bg-primary">
            <div className="apple-container apple-section">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="apple-heading-1 mb-4">История проектов</h1>
                        <p className="apple-body-secondary max-w-2xl mx-auto">
                            {estimates.length > 0
                                ? `У вас ${estimates.length} ${estimates.length === 1 ? 'сохраненная смета' : 'сохраненных смет'}`
                                : 'Все ваши сохраненные сметы и проекты в одном месте'}
                        </p>
                    </motion.div>
                </div>

                {/* Search and Sort */}
                {estimates.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mb-6 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary" size={20} />
                            <input
                                type="text"
                                placeholder="Поиск по названию..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="apple-input w-full pl-12"
                            />
                        </div>

                        {/* Sort buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => toggleSort('date')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${sortBy === 'date' ? 'bg-apple-primary text-white' : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                                    }`}
                            >
                                <Calendar size={16} />
                                Дата
                                {sortBy === 'date' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </button>
                            <button
                                onClick={() => toggleSort('name')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${sortBy === 'name' ? 'bg-apple-primary text-white' : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                                    }`}
                            >
                                <FileText size={16} />
                                Название
                                {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </button>
                            <button
                                onClick={() => toggleSort('total')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${sortBy === 'total' ? 'bg-apple-primary text-white' : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                                    }`}
                            >
                                Сумма
                                {sortBy === 'total' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </button>
                        </div>

                        {/* Status filter */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-apple-border">
                            <span className="text-xs text-apple-text-secondary self-center mr-2">Статус:</span>
                            {[
                                { value: 'all', label: 'Все' },
                                { value: 'draft', label: 'Черновик' },
                                { value: 'in_progress', label: 'В работе' },
                                { value: 'sent', label: 'Отправлена' },
                                { value: 'completed', label: 'Завершена' }
                            ].map(status => (
                                <button
                                    key={status.value}
                                    onClick={() => setStatusFilter(status.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === status.value
                                        ? status.value === 'completed'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                            : status.value === 'in_progress'
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                                : status.value === 'sent'
                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                                    : status.value === 'draft'
                                                        ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                                                        : 'bg-apple-primary text-white'
                                        : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                                        }`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Estimates List */}
                {isLoading ? (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <SkeletonListItem key={i} />
                        ))}
                    </div>
                ) : filteredEstimates.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <AppleCard variant="premium" className="max-w-md mx-auto text-center py-12">
                            <FileText size={64} className="mx-auto text-apple-text-tertiary mb-4" />
                            <h3 className="apple-heading-3 mb-2">Нет смет</h3>
                            <p className="apple-body-secondary mb-6">
                                {searchQuery || statusFilter !== 'all' ? 'Попробуйте изменить фильтры поиска' : 'Создайте первую смету'}
                            </p>
                            <Link href="/calculator">
                                <AppleButton variant="primary">Создать смету</AppleButton>
                            </Link>
                        </AppleCard>
                    </motion.div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        <AnimatePresence>
                            {filteredEstimates.map((estimate, idx) => (
                                <motion.div
                                    key={estimate.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <ContextMenu
                                        items={[
                                            {
                                                label: 'Открыть',
                                                icon: <Eye size={16} />,
                                                action: () => handleLoad(estimate),
                                                shortcut: 'Enter'
                                            },
                                            { separator: true },
                                            {
                                                label: 'Экспорт в PDF',
                                                icon: <Download size={16} />,
                                                action: () => handleExportPDF(estimate)
                                            },
                                            {
                                                label: 'Экспорт в Excel',
                                                icon: <Download size={16} />,
                                                action: () => handleExportExcel(estimate)
                                            },
                                            { separator: true },
                                            {
                                                label: 'Дублировать',
                                                icon: <Copy size={16} />,
                                                action: () => handleDuplicate(estimate.id),
                                                shortcut: 'Ctrl+D'
                                            },
                                            { separator: true },
                                            {
                                                label: 'Удалить',
                                                icon: <Trash2 size={16} />,
                                                action: () => handleDelete(estimate.id, estimate.name),
                                                danger: true,
                                                shortcut: 'Del'
                                            }
                                        ]}
                                    >
                                        <AppleCard variant="glass" className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="apple-heading-3">{estimate.name}</h3>
                                                        {estimate.author && (
                                                            <div className="px-2 py-0.5 bg-white/5 rounded text-xs text-apple-text-secondary border border-white/10">
                                                                {estimate.author}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Status Selector */}
                                                    <div className="mb-3">
                                                        <select
                                                            value={estimate.status || 'draft'}
                                                            onChange={(e) => updateEstimate(estimate.id, { status: e.target.value })}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${estimate.status === 'completed'
                                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                                                : estimate.status === 'in_progress'
                                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                                                    : estimate.status === 'sent'
                                                                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                                                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                                                                }`}
                                                        >
                                                            <option value="draft">Черновик</option>
                                                            <option value="in_progress">В работе</option>
                                                            <option value="sent">Отправлена</option>
                                                            <option value="completed">Завершена</option>
                                                        </select>
                                                    </div>

                                                    <p className="apple-heading-2 text-apple-primary">
                                                        {estimate.total.toLocaleString('ru-RU')} ₽
                                                    </p>
                                                    <p className="apple-body-secondary text-xs mt-1">
                                                        <Calendar size={12} className="inline mr-1" />
                                                        {new Date(estimate.createdAt).toLocaleDateString('ru-RU')}
                                                        {estimate.selection?.items?.length > 0 && ` • ${estimate.selection.items.length} позиций`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                <AppleButton variant="secondary" size="sm" icon={<Eye size={16} />} onClick={() => handleLoad(estimate)}>
                                                    Открыть
                                                </AppleButton>
                                                <AppleButton variant="secondary" size="sm" icon={<Download size={16} />} onClick={() => handleExportPDF(estimate)}>
                                                    PDF
                                                </AppleButton>
                                                <AppleButton variant="secondary" size="sm" icon={<Download size={16} />} onClick={() => handleExportExcel(estimate)}>
                                                    Excel
                                                </AppleButton>
                                                <AppleButton variant="secondary" size="sm" icon={<Copy size={16} />} onClick={() => handleDuplicate(estimate.id)}>
                                                    Копия
                                                </AppleButton>
                                                <AppleButton
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => handleDelete(estimate.id, estimate.name)}
                                                    className="ml-auto text-red-400 hover:text-red-300"
                                                >
                                                    Удалить
                                                </AppleButton>
                                            </div>
                                        </AppleCard>
                                    </ContextMenu>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
