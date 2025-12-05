'use client';

import React from 'react';
import { ChatProvider } from '@/context/ChatContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
    return (
        <ChatProvider>
            <div className="flex h-[calc(100vh-64px)] md:h-screen bg-white overflow-hidden">
                <ChatSidebar />
                <ChatWindow />
            </div>
        </ChatProvider>
    );
}
