'use client';

import React from 'react';
import { useChat } from '@/context/ChatContext';
import { MessageSquare, Plus, Hash, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatSidebar() {
    const { channels, activeChannel, setActiveChannel, createChannel } = useChat();

    return (
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold text-lg text-gray-800">Сообщения</h2>
                <button
                    onClick={() => {
                        const name = prompt('Название чата:');
                        if (name) createChannel(name, []); // TODO: Add user selector
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Plus size={20} className="text-blue-600" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {channels.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Нет активных чатов</p>
                    </div>
                ) : (
                    <div className="space-y-1 p-2">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => setActiveChannel(channel)}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeChannel?.id === channel.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeChannel?.id === channel.id ? 'bg-blue-100' : 'bg-gray-100'
                                    }`}>
                                    {channel.type === 'group' ? <Hash size={20} /> : <User size={20} />}
                                </div>
                                <div>
                                    <p className="font-medium truncate">{channel.name || 'Без названия'}</p>
                                    <p className="text-xs opacity-70 truncate">Нажмите, чтобы открыть</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
