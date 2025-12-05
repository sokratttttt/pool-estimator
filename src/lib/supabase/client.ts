/**
 * Consolidated Supabase Client
 * Single source of truth for Supabase instance
 * Prevents multiple client instances and memory leaks
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getEnvVar } from '../env';

// Singleton instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase browser client
 * Uses singleton pattern to prevent multiple instances
 */
export const getSupabaseClient = (): SupabaseClient => {
    if (!supabaseClient) {
        const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

        supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Supabase client initialized');
        }
    }

    return supabaseClient;
};

/**
 * For server-side usage (API routes, Server Components)
 * Creates a new instance for each request
 */
export const createServerSupabaseClient = (): SupabaseClient => {
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Legacy export for backwards compatibility
 * TODO: Migrate all imports to use getSupabaseClient()
 */
export const supabase = getSupabaseClient();
