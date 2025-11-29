'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileMessage from './FileMessage';
import { toast } from 'sonner';

export default function ChatWindow() {
    const { activeChannel, messages, sendMessage, uploadFile, currentUser, profiles, onlineUsers } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await sendMessage(newMessage);
        setNewMessage('');
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        toast.loading('Загрузка файла...');

        try {
            const fileUrl = await uploadFile(file);
            if (fileUrl) {
                const fileType = file.type.startsWith('image/') ? 'image' : 'file';
                await sendMessage(file.name, fileType, fileUrl);
                toast.dismiss();
                toast.success('Файл отправлен!');
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Ошибка отправки файла');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!activeChannel) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <div className="text-center">
                    <MessagePlaceholder />
                    <p className="mt-4">Выберите чат для начала общения</p>
                </div>
            </div>
        );
    }

    // Get channel info (name, avatar, status)
    const getChannelInfo = () => {
        if (activeChannel.type === 'group') {
            return {
                name: activeChannel.name,
                isOnline: false
            };
        }
        const otherParticipant = activeChannel.channel_participants?.find(p => p.user_id !== currentUser?.id);
        const profile = otherParticipant ? profiles[otherParticipant.user_id] : null;
        return {
            name: profile?.full_name || profile?.email || 'Личное сообщение',
            isOnline: otherParticipant ? onlineUsers.has(otherParticipant.user_id) : false
        };
    };

    const channelInfo = getChannelInfo();

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm z-10">
                <div>
                    <h3 className="font-bold text-gray-800">{channelInfo.name}</h3>
                    {channelInfo.isOnline && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Online
                        </p>
                    )}
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => {
                    const isMe = msg.user_id === currentUser?.id;
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].user_id !== msg.user_id);
                    const profile = profiles[msg.user_id];

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isMe && (
                                <div className="w-8 h-8 flex-shrink-0 flex flex-col justify-end">
                                    {showAvatar ? (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-500">
                                                    {(profile?.full_name || '?')[0]}
                                                </div>
                                            )}
                                        </div>
                                    ) : <div className="w-8" />}
                                </div>
                            )}

                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${isMe
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none'
                                }`}>
                                {!isMe && showAvatar && (
                                    <p className="text-xs text-gray-500 mb-1 font-medium">
                                        {profile?.full_name || 'Пользователь'}
                                    </p>
                                )}
                                {msg.type === 'text' ? (
                                    <p className="text-sm">{msg.content}</p>
                                ) : (
                                    <FileMessage message={msg} />
                                )}
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'
                                    }`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-100 rounded-xl p-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`p-2 rounded-full transition-colors ${isUploading ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Напишите сообщение..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500"
                    />
                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
                        <Smile size={20} />
                    </button>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

function MessagePlaceholder() {
    return (
        <svg className="w-24 h-24 mx-auto text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );
}
