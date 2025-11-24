import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createSupabaseClient = () => {
    if (typeof window !== 'undefined' && window.supabase) {
        return window.supabase;
    }
    const client = createClient(supabaseUrl, supabaseAnonKey);
    if (typeof window !== 'undefined') {
        window.supabase = client;
    }
    return client;
};

export const supabase = createSupabaseClient();
