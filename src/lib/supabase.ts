import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
    interface Window {
        _supabaseClient?: SupabaseClient;
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const createSupabaseClient = (): SupabaseClient => {
    if (typeof window === 'undefined') {
        return createClient(supabaseUrl, supabaseAnonKey);
    }

    if (!window._supabaseClient) {
        window._supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    }
    return window._supabaseClient;
};

export const supabase = createSupabaseClient();
