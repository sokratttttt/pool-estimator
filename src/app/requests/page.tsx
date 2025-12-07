'use client';

import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { useRequests } from '@/context/RequestsContext';
import { Plus, Filter, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppleButton from '@/components/apple/AppleButton';
import AppleCard from '@/components/apple/AppleCard';
import RequestsTable from '@/components/requests/RequestsTable';
import RequestStats from '@/components/requests/RequestStats';
import RequestForm from '@/components/requests/RequestForm';
import type {
    Request,
    RequestStatus,
    ForecastStatus,
    RequestType as RequestTypeEnum
} from '@/types/request';
import type { RequestData } from '@/components/requests/RequestForm';

interface Filters {
    status: RequestStatus | '';
    manager: string;
    forecast_status: ForecastStatus | '';
    request_type: RequestTypeEnum | '';
}

interface AppliedFilters {
    status?: RequestStatus;
    manager?: string;
    forecast_status?: ForecastStatus;
    request_type?: RequestTypeEnum;
    search?: string;
}

export default function RequestsPage() {
    const {
        requests,
        loading,
        stats,
        fetchRequests,
        fetchStats,
        createRequest,
        updateRequest,
        deleteRequest
    } = useRequests();

    const [showForm, setShowForm] = useState(false);
    const [editingRequest, setEditingRequest] = useState<Request | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({
        status: '',
        manager: '',
        forecast_status: '',
        request_type: ''
    });

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [fetchRequests, fetchStats]);

    const handleFilter = useCallback(() => {
        const appliedFilters: AppliedFilters = {};

        if (filters.status) appliedFilters.status = filters.status;
        if (filters.manager) appliedFilters.manager = filters.manager;
        if (filters.forecast_status) appliedFilters.forecast_status = filters.forecast_status;
        if (filters.request_type) appliedFilters.request_type = filters.request_type;
        if (searchQuery) appliedFilters.search = searchQuery;

        fetchRequests(appliedFilters);
    }, [filters, searchQuery, fetchRequests]);

    const handleClearFilters = useCallback(() => {
        setFilters({
            status: '',
            manager: '',
            forecast_status: '',
            request_type: ''
        });
        setSearchQuery('');
        fetchRequests();
    }, [fetchRequests]);

    const handleEdit = useCallback((request: RequestData) => {
        setEditingRequest(request as unknown as Request);
        setShowForm(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
            await deleteRequest(id);
        }
    }, [deleteRequest]);

    const handleSave = useCallback(async (data: RequestData) => {
        if (editingRequest) {
            await updateRequest(editingRequest.id, data as unknown as Request);
        } else {
            await createRequest(data as unknown as Request);
        }
        setShowForm(false);
        setEditingRequest(null);
    }, [editingRequest, updateRequest, createRequest]);

    const handleCreateEstimate = useCallback((_request: RequestData) => {
        // Navigate to calculator with pre-filled data
        // This is a placeholder - implement based on your routing
    }, []);

    const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleStatusChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            status: value ? (value as RequestStatus) : ''
        }));
    }, []);

    const handleForecastChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            forecast_status: value ? (value as ForecastStatus) : ''
        }));
    }, []);

    const handleRequestTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            request_type: value ? (value as RequestTypeEnum) : ''
        }));
    }, []);

    const toggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

    const handleNewRequest = useCallback(() => {
        setEditingRequest(null);
        setShowForm(true);
    }, []);

    const handleFormClose = useCallback(() => {
        setShowForm(false);
        setEditingRequest(null);
    }, []);

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Заявки</h1>
                        <p className="text-gray-400">Управление входящими заявками клиентов</p>
                    </div>
                    <div className="flex gap-3">
                        <AppleButton
                            variant="secondary"
                            icon={<Filter size={20} />}
                            onClick={toggleFilters}
                        >
                            Фильтры
                        </AppleButton>
                        <AppleButton
                            variant="primary"
                            icon={<Plus size={20} />}
                            onClick={handleNewRequest}
                        >
                            Новая заявка
                        </AppleButton>
                    </div>
                </div>
            </motion.div>

            {/* Statistics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <RequestStats stats={stats} loading={loading} />
            </motion.div>

            {/* Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                    >
                        <AppleCard variant="premium">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="apple-caption mb-2 block">Поиск</label>
                                    <div className="relative">
                                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Имя или телефон"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-apple-bg-secondary border border-apple-border text-white outline-none focus:border-cyan-bright"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="apple-caption mb-2 block">Статус</label>
                                    <select
                                        value={filters.status}
                                        onChange={handleStatusChange}
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full px-4 py-2 rounded-xl bg-apple-bg-secondary border border-apple-border text-white outline-none focus:border-cyan-bright [&>option]:bg-gray-800 [&>option]:text-white"
                                    >
                                        <option value="">Все</option>
                                        <option value="new">Новая</option>
                                        <option value="in_progress">В работе</option>
                                        <option value="contacted">Связались</option>
                                        <option value="estimate_sent">Смета отправлена</option>
                                        <option value="completed">Завершена</option>
                                        <option value="cancelled">Отменена</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="apple-caption mb-2 block">Прогноз</label>
                                    <select
                                        value={filters.forecast_status}
                                        onChange={handleForecastChange}
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full px-4 py-2 rounded-xl bg-apple-bg-secondary border border-apple-border text-white outline-none focus:border-cyan-bright [&>option]:bg-gray-800 [&>option]:text-white"
                                    >
                                        <option value="">Все</option>
                                        <option value="hot">Горячая</option>
                                        <option value="warm">Теплая</option>
                                        <option value="cold">Холодная</option>
                                        <option value="neutral">Нейтральная</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="apple-caption mb-2 block">Тип</label>
                                    <select
                                        value={filters.request_type}
                                        onChange={handleRequestTypeChange}
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full px-4 py-2 rounded-xl bg-apple-bg-secondary border border-apple-border text-white outline-none focus:border-cyan-bright [&>option]:bg-gray-800 [&>option]:text-white"
                                    >
                                        <option value="">Все</option>
                                        <option value="pool">Бассейн</option>
                                        <option value="spa">СПА</option>
                                        <option value="consultation">Консультация</option>
                                        <option value="service">Обслуживание</option>
                                        <option value="other">Другое</option>
                                    </select>
                                </div>

                                <div className="flex items-end gap-2">
                                    <AppleButton
                                        variant="primary"
                                        onClick={handleFilter}
                                        className="flex-1"
                                    >
                                        Применить
                                    </AppleButton>
                                    <AppleButton
                                        variant="secondary"
                                        onClick={handleClearFilters}
                                        icon={<X size={18} />}
                                    >
                                        Сбросить
                                    </AppleButton>
                                </div>
                            </div>
                        </AppleCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Requests Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <RequestsTable
                    requests={requests as unknown as RequestData[]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreateEstimate={handleCreateEstimate}
                    loading={loading}
                />
            </motion.div>

            {/* Request Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <RequestForm
                        request={editingRequest as unknown as RequestData | undefined}
                        onSave={handleSave}
                        onClose={handleFormClose}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}