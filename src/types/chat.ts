/**
 * Chat Types
 * Type definitions for chat/messaging system
 */

import type { User } from '@supabase/supabase-js';

// ============================================
// MESSAGE TYPES
// ============================================

/**
 * Message type values
 */
export type MessageType = 'text' | 'image' | 'file' | 'system';

/**
 * Chat message record
 */
export interface ChatMessage {
    id: string;
    channel_id: string;
    user_id: string;
    content: string;
    type: MessageType;
    file_url?: string;
    created_at: string;
    updated_at?: string;
}

// ============================================
// CHANNEL TYPES
// ============================================

/**
 * Channel type values
 */
export type ChannelType = 'dm' | 'group' | 'public';

/**
 * Channel participant record
 */
export interface ChannelParticipant {
    user_id: string;
    channel_id?: string;
}

/**
 * Chat channel record
 */
export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    created_by: string;
    created_at: string;
    updated_at: string;
    channel_participants?: ChannelParticipant[];
}

// ============================================
// USER PROFILE TYPES
// ============================================

/**
 * User profile record
 */
export interface UserProfile {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
}

/**
 * Profiles map keyed by user ID
 */
export type ProfilesMap = Record<string, UserProfile>;

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Chat context value type
 */
export interface ChatContextValue {
    // State
    channels: Channel[];
    activeChannel: Channel | null;
    messages: ChatMessage[];
    isLoading: boolean;
    currentUser: User | null;
    profiles: ProfilesMap;
    onlineUsers: Set<string>;

    // Channel operations
    setActiveChannel: (channel: Channel | null) => void;
    createChannel: (name: string, participantIds: string[]) => Promise<Channel | undefined>;
    createDirectMessage: (otherUserId: string) => Promise<Channel | undefined>;
    refreshChannels: () => Promise<void>;

    // Message operations
    sendMessage: (content: string, type?: MessageType, fileUrl?: string | null) => Promise<void>;
    uploadFile: (file: File) => Promise<string | null>;
}
