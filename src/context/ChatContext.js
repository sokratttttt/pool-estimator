'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const ChatContext = createContext();

const NOTIFICATION_SOUND = 'data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

export function ChatProvider({ children }) {
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [profiles, setProfiles] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    // Initialize user and fetch channels
    useEffect(() => {
        const init = async () => {
            // Request notification permission
            if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
                Notification.requestPermission();
            }

            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                await Promise.all([
                    fetchChannels(),
                    fetchProfiles()
                ]);

                // Initialize presence
                const presenceChannel = supabase.channel('online-users');
                presenceChannel
                    .on('presence', { event: 'sync' }, () => {
                        const state = presenceChannel.presenceState();
                        const online = new Set();
                        Object.values(state).forEach(users => {
                            users.forEach(u => online.add(u.user_id));
                        });
                        setOnlineUsers(online);
                    })
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            await presenceChannel.track({
                                user_id: user.id,
                                online_at: new Date().toISOString()
                            });
                        }
                    });
            }
            setIsLoading(false);
        };
        init();
    }, []);

    // Global message subscription for notifications
    useEffect(() => {
        if (!currentUser) return;

        const globalChannel = supabase
            .channel('global-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                async (payload) => {
                    const newMsg = payload.new;
                    if (newMsg.user_id === currentUser.id) return;

                    // Play sound
                    try {
                        const audio = new Audio(NOTIFICATION_SOUND);
                        audio.volume = 0.5;
                        await audio.play();
                    } catch (e) {
                        // Audio play might fail if user hasn't interacted
                    }

                    // Show notification if hidden or not in this channel
                    if (document.hidden || newMsg.channel_id !== activeChannel?.id) {
                        if (Notification.permission === 'granted') {
                            new Notification('Новое сообщение', {
                                body: newMsg.content || (newMsg.type === 'image' ? 'Изображение' : 'Файл'),
                                icon: '/icon.png'
                            });
                        }

                        // Update title temporarily
                        const originalTitle = document.title;
                        document.title = '(1) Новое сообщение!';
                        setTimeout(() => {
                            document.title = originalTitle;
                        }, 3000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(globalChannel);
        };
    }, [currentUser, activeChannel]);

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

    const fetchProfiles = async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) {
            const profilesMap = data.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
            }, {});
            setProfiles(profilesMap);
        }
    };

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

    const uploadFile = async (file) => {
        if (!activeChannel || !currentUser) {
            toast.error('Нет активного чата');
            return null;
        }

        try {
            // Validate file size (10MB max)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('Файл слишком большой (макс. 10МБ)');
                return null;
            }

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const filePath = `${activeChannel.id}/${currentUser.id}/${filename}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('chat-files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-files')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Ошибка загрузки файла');
            return null;
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
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Не удалось отправить сообщение');
        }
    };

    const createChannel = async (name, participantIds) => {
        try {
            let user = currentUser;
            if (!user) {
                const { data } = await supabase.auth.getUser();
                user = data.user;
                if (user) setCurrentUser(user);
            }

            if (!user) {
                toast.error('Вы не авторизованы');
                return;
            }

            // 1. Create channel
            const { data: channel, error: channelError } = await supabase
                .from('channels')
                .insert({
                    name,
                    type: participantIds.length > 1 ? 'group' : 'dm',
                    created_by: user.id
                })
                .select()
                .single();

            if (channelError) throw channelError;

            // 2. Add participants (including self)
            const participants = [...participantIds, user.id].map(uid => ({
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

    const createDirectMessage = async (otherUserId) => {
        if (!currentUser) return;

        // Check if DM already exists
        const existingChannel = channels.find(c =>
            c.type === 'dm' &&
            c.channel_participants.some(p => p.user_id === otherUserId)
        );

        if (existingChannel) {
            setActiveChannel(existingChannel);
            return existingChannel;
        }

        // Create new DM
        return createChannel('Личное сообщение', [otherUserId]);
    };

    return (
        <ChatContext.Provider value={{
            channels,
            activeChannel,
            messages,
            isLoading,
            currentUser,
            profiles,
            onlineUsers,
            setActiveChannel,
            sendMessage,
            uploadFile,
            createChannel,
            createDirectMessage,
            refreshChannels: fetchChannels
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
