'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow() {
    const { activeChannel, messages, sendMessage, currentUser } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

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

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm z-10">
                <div>
                    <h3 className="font-bold text-gray-800">{activeChannel.name}</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Online
                    </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => {
                    const isMe = msg.user_id === currentUser?.id;
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{msg.content}</p>
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
                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
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
