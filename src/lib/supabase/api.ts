/**
 * Supabase API Layer
 * Typed functions for database operations
 */

import { getSupabaseClient } from './client';
import type { Database } from './types';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Estimates API
export const estimateApi = {
    async getAll() {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('estimates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch estimates: ${error.message}`);
        }

        return data as Tables<'estimates'>[];
    },

    async getById(id: string) {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('estimates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Failed to fetch estimate: ${error.message}`);
        }

        return data as Tables<'estimates'>;
    },

    async create(estimateData: Omit<Inserts<'estimates'>, 'id' | 'created_at'>) {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('estimates')
            .insert([estimateData])
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create estimate: ${error.message}`);
        }

        return data as Tables<'estimates'>;
    },

    async update(id: string, updates: Updates<'estimates'>) {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('estimates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update estimate: ${error.message}`);
        }

        return data as Tables<'estimates'>;
    },

    async delete(id: string) {
        const supabase = getSupabaseClient();

        const { error } = await supabase
            .from('estimates')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete estimate: ${error.message}`);
        }
    },
};

// Bowls API
export const bowlApi = {
    async getAll() {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('bowls')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch bowls: ${error.message}`);
        }

        return data as Tables<'bowls'>[];
    },

    async getById(id: string) {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('bowls')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Failed to fetch bowl: ${error.message}`);
        }

        return data as Tables<'bowls'>;
    },

    async getByManufacturer(manufacturer: string) {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('bowls')
            .select('*')
            .eq('manufacturer', manufacturer)
            .order('name', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch bowls by manufacturer: ${error.message}`);
        }

        return data as Tables<'bowls'>[];
    },
};

// Equipment API (for future implementation)
export const equipmentApi = {
    async getAll() {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('equipment')
            .select('*');

        if (error) {
            throw new Error(`Failed to fetch equipment: ${error.message}`);
        }

        return data;
    },
};
