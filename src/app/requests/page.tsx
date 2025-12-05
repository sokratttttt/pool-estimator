'use client';

import { useEffect, useState } from 'react';
import { useRequests } from '@/context/RequestsContext';
import { Plus, Filter, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppleButton from '@/components/apple/AppleButton';

import AppleCard from '@/components/apple/AppleCard';
import RequestsTable from '@/components/requests/RequestsTable';
import RequestStats from '@/components/requests/RequestStats';
import RequestForm from '@/components/requests/RequestForm';

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
    const [editingRequest, setEditingRequest] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        manager: '',
        forecast_status: '',
        request_type: ''
    });

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [fetchRequests, fetchStats]);

    const handleFilter = () => {
        // Convert empty strings to undefined for type compatibility
        type FilterValue = string | undefined;
        const appliedFilters: Record<string, FilterValue> = {};

        if (filters.status) appliedFilters.status = filters.status;
        if (filters.manager) appliedFilters.manager = filters.manager;
        if (filters.forecast_status) appliedFilters.forecast_status = filters.forecast_status;
        if (filters.request_type) appliedFilters.request_type = filters.request_type;
        if (searchQuery) appliedFilters.search = searchQuery;

        fetchRequests(appliedFilters as Parameters<typeof fetchRequests>[0]);
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            manager: '',
            forecast_status: '',
            request_type: ''
        });
        setSearchQuery('');
        fetchRequests();
    };

    const handleEdit = (request: any) => {
        setEditingRequest(request);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
            await deleteRequest(id);
        }
    };

    const handleSave = async (data: any) => {
        if (editingRequest) {
            await updateRequest(editingRequest.id, data);
        } else {
            await createRequest(data);
        }
        setShowForm(false);
        setEditingRequest(null);
    };

    const handleCreateEstimate = (request: any) => {
        // Navigate to calculator with pre-filled data
        // This is a placeholder - implement based on your routing
        console.log('Create estimate for request:', request);
    };

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
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Фильтры
                        </AppleButton>
                        <AppleButton
                            variant="primary"
                            icon={<Plus size={20} />}
                            onClick={() => {
                                setEditingRequest(null);
                                setShowForm(true);
                            }}
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
                <RequestStats stats={stats as Parameters<typeof RequestStats>[0]['stats']} loading={loading} />
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
                                            onChange={(e: React.ChangeEvent<any>) => setSearchQuery(e.target.value)}
                                            placeholder="Имя или телефон"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-apple-bg-secondary border border-apple-border text-white outline-none focus:border-cyan-bright"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="apple-caption mb-2 block">Статус</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e: React.ChangeEvent<any>) => setFilters({ ...filters, status: e.target.value })}
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
                                        onChange={(e: React.ChangeEvent<any>) => setFilters({ ...filters, forecast_status: e.target.value })}
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
                                        onChange={(e: React.ChangeEvent<any>) => setFilters({ ...filters, request_type: e.target.value })}
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full px-4 py-2 rounded-xl bg-apple-bg-secondary border border-apple-border text-white outline-none focus:border-cyan-bright [&>option]:bg-gray-800 [&>option]:text-white"
                                    >
                                        <option value="">Все</option>
                                        <option value="construction">Строительство</option>
                                        <option value="repair">Ремонт</option>
                                        <option value="equipment">Оборудование</option>
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
                    requests={requests}
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
                        request={editingRequest}
                        onSave={handleSave}
                        onClose={() => {
                            setShowForm(false);
                            setEditingRequest(null);
                        }}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
