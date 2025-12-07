'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile } from '@/types/chat';

interface UserSelectorProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSelect: (user: UserProfile) => void;
}

export default function UserSelector({ isOpen, onClose, onSelect }: UserSelectorProps) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name || user.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleUserSelect = (user: UserProfile) => {
        onSelect(user);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Выбор пользователя для чата"
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Новое сообщение</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Закрыть выбор пользователя"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск людей..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    autoFocus
                                    aria-label="Поиск пользователей"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Загрузка...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">Никого не найдено</div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredUsers.map(user => {
                                        const userName = user.full_name || 'Без имени';
                                        const userInitial = userName[0].toUpperCase();

                                        return (
                                            <button
                                                key={user.id}
                                                onClick={() => handleUserSelect(user)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                                aria-label={`Выбрать ${userName} для чата`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium shrink-0 overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <Image
                                                            src={user.avatar_url}
                                                            alt={`Аватар ${userName}`}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <span className="text-white font-medium">
                                                            {userInitial}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {userName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}