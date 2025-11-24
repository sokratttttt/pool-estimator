'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X, Save, FileText, Building } from 'lucide-react';
import AppleCard from '@/components/apple/AppleCard';
import AppleButton from '@/components/apple/AppleButton';
import AppleInput from '@/components/apple/AppleInput';
import { SkeletonCard } from '@/components/Skeleton';
import { useClients } from '@/context/ClientContext';
import { useHistory } from '@/context/HistoryContext';

export default function ClientsPage() {
    const { clients, isLoading, saveClient, updateClient, deleteClient } = useClients();
    const { estimates } = useHistory();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        notes: ''
    });

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getClientEstimates = (clientId) => {
        return estimates.filter(est =>
            est.clientInfo?.id === clientId ||
            est.clientInfo?.name === clients.find(c => c.id === clientId)?.name
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingClient) {
            await updateClient(editingClient.id, formData);
        } else {
            await saveClient(formData);
        }
        closeModal();
    };

    const openModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name || '',
                phone: client.phone || '',
                email: client.email || '',
                company: client.company || '',
                address: client.address || '',
                notes: client.notes || ''
            });
        } else {
            setEditingClient(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                company: '',
                address: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            company: '',
            address: '',
            notes: ''
        });
    };

    const handleDelete = async (id, name) => {
        if (confirm(`Удалить клиента "${name}"?`)) {
            await deleteClient(id);
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={32} className="text-cyan-bright" />
                        <h1 className="text-3xl font-bold text-white">Клиенты</h1>
                    </div>
                    <p className="text-gray-400">
                        {clients.length} {clients.length === 1 ? 'клиент' : 'клиентов'} в базе
                    </p>
                </div>
                <AppleButton variant="primary" icon={<Plus size={20} />} onClick={() => openModal()}>
                    Добавить клиента
                </AppleButton>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск по имени, телефону, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="apple-input w-full pl-12"
                    />
                </div>
            </div>

            {/* Clients Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <AppleCard variant="flat" className="text-center py-12">
                    <Users size={64} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                        {searchQuery ? 'Клиенты не найдены' : 'Нет клиентов'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {searchQuery ? 'Попробуйте изменить запрос' : 'Добавьте первого клиента в базу'}
                    </p>
                    {!searchQuery && (
                        <AppleButton variant="primary" icon={<Plus size={20} />} onClick={() => openModal()}>
                            Добавить клиента
                        </AppleButton>
                    )}
                </AppleCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client, idx) => {
                        const clientEstimates = getClientEstimates(client.id);
                        return (
                            <motion.div
                                key={client.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <AppleCard variant="glass" className="h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-1">{client.name}</h3>
                                            {client.company && (
                                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                                    <Building size={14} />
                                                    <span>{client.company}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModal(client)}
                                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} className="text-cyan-bright" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id, client.name)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 text-sm">
                                        {client.phone && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Phone size={14} className="text-gray-500" />
                                                <a href={`tel:${client.phone}`} className="hover:text-cyan-bright transition-colors">
                                                    {client.phone}
                                                </a>
                                            </div>
                                        )}
                                        {client.email && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Mail size={14} className="text-gray-500" />
                                                <a href={`mailto:${client.email}`} className="hover:text-cyan-bright transition-colors">
                                                    {client.email}
                                                </a>
                                            </div>
                                        )}
                                        {client.address && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <MapPin size={14} className="text-gray-500" />
                                                <span>{client.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {client.notes && (
                                        <div className="bg-white/5 rounded-lg p-3 mb-4">
                                            <p className="text-xs text-gray-400 line-clamp-2">{client.notes}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                                        <FileText size={16} className="text-gray-500" />
                                        <span className="text-sm text-gray-400">
                                            {clientEstimates.length} {clientEstimates.length === 1 ? 'смета' : 'смет'}
                                        </span>
                                    </div>
                                </AppleCard>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-apple-surface border border-apple-border rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingClient ? 'Редактировать клиента' : 'Новый клиент'}
                                </h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AppleInput
                                    label="Имя *"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Иван Иванов"
                                />

                                <AppleInput
                                    label="Компания"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="ООО Компания"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AppleInput
                                        label="Телефон"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+7 (999) 000-00-00"
                                    />

                                    <AppleInput
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <AppleInput
                                    label="Адрес"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Москва, ул. Примерная, д. 1"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-apple-text-primary mb-2">
                                        Заметки
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Дополнительная информация о клиенте..."
                                        className="apple-input w-full min-h-[100px] resize-y"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <AppleButton type="submit" variant="primary" icon={<Save size={18} />} className="flex-1">
                                        {editingClient ? 'Сохранить' : 'Добавить'}
                                    </AppleButton>
                                    <AppleButton type="button" variant="secondary" onClick={closeModal} className="flex-1">
                                        Отмена
                                    </AppleButton>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
