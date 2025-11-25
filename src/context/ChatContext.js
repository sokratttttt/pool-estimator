'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Initialize user and fetch channels
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                await fetchChannels();
            }
            setIsLoading(false);
        };
        init();
    }, []);

    // Subscribe to messages when active channel changes
    useEffect(() => {
        if (!activeChannel) return;

        // Load initial messages
        fetchMessages(activeChannel.id);

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${activeChannel.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `channel_id=eq.${activeChannel.id}`
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeChannel]);

    const fetchChannels = async () => {
        try {
            // Get channels where user is a participant
            const { data: myChannels, error } = await supabase
                .from('channels')
                .select(`
                    *,
                    channel_participants!inner(user_id)
                `)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setChannels(myChannels || []);
        } catch (error) {
            console.error('Error fetching channels:', error);
            toast.error('Не удалось загрузить чаты');
        }
    };

    const fetchMessages = async (channelId) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('channel_id', channelId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (content, type = 'text', fileUrl = null) => {
        if (!activeChannel || !currentUser) return;

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    channel_id: activeChannel.id,
                    user_id: currentUser.id,
                    content,
                    type,
                    file_url: fileUrl
                });

            if (error) throw error;
            // Optimistic update is handled by subscription usually, 
            // but for instant feedback we might want to add it locally too.
            // For now relying on realtime.
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Не удалось отправить сообщение');
        }
    };

    const createChannel = async (name, participantIds) => {
        try {
            // 1. Create channel
            const { data: channel, error: channelError } = await supabase
                .from('channels')
                .insert({
                    name,
                    type: participantIds.length > 1 ? 'group' : 'dm',
                    created_by: currentUser.id
                })
                .select()
                .single();

            if (channelError) throw channelError;

            // 2. Add participants (including self)
            const participants = [...participantIds, currentUser.id].map(uid => ({
                channel_id: channel.id,
                user_id: uid
            }));

            const { error: partError } = await supabase
                .from('channel_participants')
                .insert(participants);

            if (partError) throw partError;

            await fetchChannels();
            setActiveChannel(channel);
            return channel;
        } catch (error) {
            console.error('Error creating channel:', error);
            toast.error('Не удалось создать чат');
        }
    };

    return (
        <ChatContext.Provider value={{
            channels,
            activeChannel,
            messages,
            isLoading,
            currentUser,
            setActiveChannel,
            sendMessage,
            createChannel,
            refreshChannels: fetchChannels
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
