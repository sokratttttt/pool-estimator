/**
 * Supabase Database Types
 * Generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
 * 
 * TODO: Run the command above to generate actual types from your database schema
 */

// Placeholder types until database types are generated
export interface Database {
    public: {
        Tables: {
            bowls: {
                Row: {
                    id: string;
                    name: string;
                    manufacturer: string;
                    length: number;
                    width: number;
                    depth: number;
                    volume: number;
                    price: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['bowls']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['bowls']['Insert']>;
            };
            estimates: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    data: any; // Replace with proper type after generation
                    total: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['estimates']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['estimates']['Insert']>;
            };
            // Add other tables here
        };
    };
}

// Convenience type exports
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type Bowl = Tables<'bowls'>;
export type Estimate = Tables<'estimates'>;
