import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createSupabaseClient = () => {
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
