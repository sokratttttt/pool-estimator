'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';
import type { Channel, UserProfile } from '@/types/chat';
import { MessageSquare, Plus } from 'lucide-react';
import UserSelector from './UserSelector';

interface ChatSidebarProps {
    channel?: Channel;
}

export default function ChatSidebar({ }: ChatSidebarProps) {
    const { channels, activeChannel, setActiveChannel, createDirectMessage, currentUser, profiles, onlineUsers } = useChat();
    const [showUserSelector, setShowUserSelector] = useState(false);

    const getChannelInfo = (channel: Channel) => {
        if (channel.type === 'group') {
            return {
                name: channel.name,
                avatar: null,
                isOnline: false,
                initials: channel.name?.[0]?.toUpperCase() || '#'
            };
        }

        // For DMs, find the other participant
        const otherParticipant = channel.channel_participants?.find(p => p.user_id !== currentUser?.id);
        const profile = otherParticipant ? profiles[otherParticipant.user_id] : null;

        return {
            name: profile?.full_name || profile?.email || 'Личное сообщение',
            avatar: profile?.avatar_url,
            isOnline: otherParticipant ? onlineUsers.has(otherParticipant.user_id) : false,
            initials: (profile?.full_name || profile?.email || '?')[0]?.toUpperCase()
        };
    };

    return (
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold text-lg text-gray-800">Сообщения</h2>
                <button
                    onClick={() => setShowUserSelector(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Начать новый чат"
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
                        {channels.map(channel => {
                            const info = getChannelInfo(channel);
                            const isActive = activeChannel?.id === channel.id;

                            return (
                                <button
                                    key={channel.id}
                                    onClick={() => setActiveChannel(channel)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    aria-label={`Открыть чат с ${info.name}`}
                                >
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isActive ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
                                            {info.avatar ? (
                                                <Image
                                                    src={info.avatar}
                                                    alt={`Аватар ${info.name}`}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                    style={{ objectFit: 'cover' }}
                                                    priority={isActive} // Prioritize active channel avatar
                                                />
                                            ) : (
                                                <span className="font-medium text-lg">{info.initials}</span>
                                            )}
                                        </div>
                                        {info.isOnline && (
                                            <div
                                                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                                                aria-label="В сети"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{info.name}</p>
                                        <p className="text-xs opacity-70 truncate">
                                            {info.isOnline ? 'В сети' : 'Нажмите, чтобы открыть'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <UserSelector
                isOpen={showUserSelector}
                onClose={() => setShowUserSelector(false)}
                onSelect={async (user: UserProfile) => {
                    await createDirectMessage(user.id);
                    setShowUserSelector(false);
                }}
            />
        </div>
    );
}