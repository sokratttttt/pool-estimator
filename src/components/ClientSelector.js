'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, User, Check, Plus } from 'lucide-react';
import { useClients } from '@/context/ClientContext';
import { motion, AnimatePresence } from 'framer-motion';
import AppleButton from './apple/AppleButton';

export default function ClientSelector({ onSelect }) {
    const { clients } = useClients();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.includes(search) ||
        client.email?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-3 text-gray-400">
                    <User size={18} />
                    <span>Выбрать клиента из базы</span>
                </div>
                <Search size={16} className="text-gray-500" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-navy-deep border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-2 border-b border-white/10">
                            <input
                                type="text"
                                placeholder="Поиск..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-bright"
                                autoFocus
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto premium-scrollbar">
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <div
                                        key={client.id}
                                        onClick={() => {
                                            onSelect(client);
                                            setIsOpen(false);
                                        }}
                                        className="p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                    >
                                        <div className="font-medium text-white">{client.name}</div>
                                        <div className="text-xs text-gray-400 flex gap-2 mt-1">
                                            {client.phone && <span>{client.phone}</span>}
                                            {client.email && <span>• {client.email}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    {search ? 'Ничего не найдено' : 'Список пуст'}
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-white/10 bg-white/5">
                            <div className="text-xs text-center text-gray-400">
                                Управление клиентами доступно в разделе &quot;Клиенты&quot;
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
