import type { User } from '@supabase/supabase-js';

export interface LoginResult {
    success: boolean;
    error?: string;
}

export interface SyncContextType {
    user: User | null;
    isOnline: boolean;
    isSyncing: boolean;
    lastSync: Date | null;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
}
