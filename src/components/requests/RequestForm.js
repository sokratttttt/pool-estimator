'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppleInput from '../apple/AppleInput';
import AppleButton from '../apple/AppleButton';
import AppleCard from '../apple/AppleCard';
import { useClient } from '@/context/ClientContext';

const REQUEST_TYPES = [
    { value: 'construction', label: 'Строительство' },
    { value: 'repair', label: 'Ремонт' },
    { value: 'equipment', label: 'Оборудование' },
    { value: 'other', label: 'Другое' }
];

const POOL_TYPES = [
    { value: 'composite', label: 'Композитный' },
    { value: 'concrete', label: 'Бетонный' },
    { value: 'polypropylene', label: 'Полипропиленовый' }
];

const FORECAST_STATUSES = [
    { value: 'hot', label: 'Горячая', color: 'bg-red-500' },
    { value: 'warm', label: 'Теплая', color: 'bg-orange-500' },
    { value: 'cold', label: 'Холодная', color: 'bg-blue-400' },
    { value: 'neutral', label: 'Нейтральная', color: 'bg-gray-500' }
];

const STATUSES = [
    { value: 'new', label: 'Новая' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'contacted', label: 'Связались' },
    { value: 'estimate_sent', label: 'Смета отправлена' },
    { value: 'completed', label: 'Завершена' },
    { value: 'cancelled', label: 'Отменена' }
];

const MANAGERS = ['Платон', 'Другой менеджер']; // You can fetch from DB

export default function RequestForm({ request, onSave, onClose, loading }) {
    const { clients, fetchClients } = useClient();
    const [formData, setFormData] = useState({
        client_name: '',
        phone: '',
        email: '',
        request_type: 'construction',
        pool_type: '', // Тип бассейна для строительства
        dimensions: '',
        location: '',
        manager: '',
        forecast_status: 'neutral',
        status: 'new',
        notes: '',
        client_id: null // ID связанного клиента
    });

    const [errors, setErrors] = useState({});
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);
    const [filteredClients, setFilteredClients] = useState([]);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        if (request) {
            setFormData(request);
        }
    }, [request]);

    // Filter clients based on input
    useEffect(() => {
        if (formData.client_name && formData.client_name.length > 0) {
            const filtered = clients.filter(client =>
                client.name.toLowerCase().includes(formData.client_name.toLowerCase())
            );
            setFilteredClients(filtered);
            setShowClientSuggestions(filtered.length > 0);
        } else {
            setFilteredClients([]);
            setShowClientSuggestions(false);
        }
    }, [formData.client_name, clients]);

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
                setShowClientSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleClientSelect = (client) => {
        setFormData(prev => ({
            ...prev,
            client_name: client.name,
            phone: client.phone || '',
            email: client.email || '',
            client_id: client.id
        }));
        setShowClientSuggestions(false);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.client_name?.trim()) {
            newErrors.client_name = 'Обязательное поле';
        }

        if (!formData.request_type) {
            newErrors.request_type = 'Выберите тип заявки';
        }

        if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Некорректный формат телефона';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-apple-surface rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-apple-border"
            >
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-b border-apple-border p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="apple-heading-2">
                            {request ? 'Редактировать заявку' : 'Новая заявка'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-apple-bg-secondary transition-colors flex items-center justify-center"
                        >
                            <X size={20} className="text-apple-text-secondary" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client Name with Autocomplete */}
                        <div className="relative" ref={autocompleteRef}>
                            <label className="apple-body font-medium mb-2 block">
                                Имя клиента *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.client_name}
                                    onChange={(e) => handleChange('client_name', e.target.value)}
                                    onFocus={() => formData.client_name && setShowClientSuggestions(filteredClients.length > 0)}
                                    placeholder="Введите имя клиента"
                                    className={`w-full px-4 py-3 pl-10 rounded-xl border bg-apple-bg-secondary text-white outline-none focus:border-cyan-bright focus:ring-2 focus:ring-cyan-bright/20 transition-all ${errors.client_name ? 'border-red-500' : 'border-apple-border'
                                        }`}
                                />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            {errors.client_name && (
                                <p className="text-red-400 text-sm mt-1">{errors.client_name}</p>
                            )}

                            {/* Autocomplete Suggestions */}
                            <AnimatePresence>
                                {showClientSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-50 w-full mt-2 bg-apple-bg-secondary border border-apple-border rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                                    >
                                        {filteredClients.map((client) => (
                                            <button
                                                key={client.id}
                                                type="button"
                                                onClick={() => handleClientSelect(client)}
                                                className="w-full px-4 py-3 text-left hover:bg-apple-bg-tertiary transition-colors border-b border-apple-border last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium">{client.name}</p>
                                                        {client.phone && (
                                                            <p className="text-sm text-gray-400">{client.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Phone */}
                        <div>
                            <AppleInput
                                label="Телефон"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="+7 (XXX) XXX-XX-XX"
                                error={errors.phone}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <AppleInput
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="email@example.com"
                                error={errors.email}
                            />
                        </div>

                        {/* Request Type */}
                        <div>
                            <label className="apple-body font-medium mb-2 block">
                                Тип заявки *
                            </label>
                            <select
                                value={formData.request_type}
                                onChange={(e) => handleChange('request_type', e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-bg-secondary text-white outline-none focus:border-cyan-bright focus:ring-2 focus:ring-cyan-bright/20 transition-all [&>option]:bg-gray-800 [&>option]:text-white"
                            >
                                {REQUEST_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Pool Type - показывается только для строительства */}
                        {formData.request_type === 'construction' && (
                            <div>
                                <label className="apple-body font-medium mb-2 block">
                                    Тип бассейна *
                                </label>
                                <select
                                    value={formData.pool_type}
                                    onChange={(e) => handleChange('pool_type', e.target.value)}
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-bg-secondary text-white outline-none focus:border-cyan-bright focus:ring-2 focus:ring-cyan-bright/20 transition-all [&>option]:bg-gray-800 [&>option]:text-white"
                                >
                                    <option value="">Выберите тип</option>
                                    {POOL_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Dimensions */}
                        <div>
                            <AppleInput
                                label="Размеры бассейна"
                                value={formData.dimensions}
                                onChange={(e) => handleChange('dimensions', e.target.value)}
                                placeholder="8x4x1.5"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <AppleInput
                                label="Локация"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="Москва, Южное Бутово"
                            />
                        </div>

                        {/* Manager */}
                        <div>
                            <label className="apple-body font-medium mb-2 block">
                                Менеджер
                            </label>
                            <select
                                value={formData.manager}
                                onChange={(e) => handleChange('manager', e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-bg-secondary text-white outline-none focus:border-cyan-bright focus:ring-2 focus:ring-cyan-bright/20 transition-all [&>option]:bg-gray-800 [&>option]:text-white"
                            >
                                <option value="">Не назначен</option>
                                {MANAGERS.map(manager => (
                                    <option key={manager} value={manager}>
                                        {manager}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Forecast Status */}
                        <div>
                            <label className="apple-body font-medium mb-2 block">
                                Прогноз
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {FORECAST_STATUSES.map(status => (
                                    <button
                                        key={status.value}
                                        type="button"
                                        onClick={() => handleChange('forecast_status', status.value)}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${formData.forecast_status === status.value
                                            ? `${status.color} border-white text-white`
                                            : 'border-apple-border bg-apple-bg-secondary text-apple-text-secondary hover:border-apple-border-hover'
                                            }`}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="apple-body font-medium mb-2 block">
                                Статус *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {STATUSES.map(status => (
                                    <button
                                        key={status.value}
                                        type="button"
                                        onClick={() => handleChange('status', status.value)}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${formData.status === status.value
                                            ? 'border-cyan-bright bg-cyan-bright/20 text-cyan-bright'
                                            : 'border-apple-border bg-apple-bg-secondary text-apple-text-secondary hover:border-apple-border-hover'
                                            }`}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="apple-body font-medium mb-2 block">
                                Заметки
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Дополнительная информация о заявке"
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-bg-secondary text-white outline-none focus:border-cyan-bright focus:ring-2 focus:ring-cyan-bright/20 transition-all resize-none"
                            />
                        </div>
                    </div>
                </form>

                <div className="border-t border-apple-border p-6 flex gap-3">
                    <AppleButton
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Отмена
                    </AppleButton>
                    <AppleButton
                        variant="primary"
                        onClick={handleSubmit}
                        className="flex-1"
                        loading={loading}
                    >
                        {request ? 'Сохранить' : 'Создать'}
                    </AppleButton>
                </div>
            </motion.div>
        </div>
    );
}
