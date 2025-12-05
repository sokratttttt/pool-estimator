/**
 * Client Types
 * Type definitions for client management
 */

// ============================================
// CLIENT ENTITY
// ============================================

/**
 * Client record from database
 */
export interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
}

/**
 * Data for creating a new client (without auto-generated fields)
 */
export type ClientCreateData = Omit<Client, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;

/**
 * Data for updating a client
 */
export type ClientUpdateData = Partial<ClientCreateData>;

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Client context value type
 */
export interface ClientContextValue {
    clients: Client[];
    isLoading: boolean;

    // CRUD operations
    loadClients: () => Promise<void>;
    saveClient: (clientData: ClientCreateData) => Promise<Client | null>;
    updateClient: (id: string, updates: ClientUpdateData) => Promise<Client | null>;
    deleteClient: (id: string) => Promise<void>;

    // Query methods
    getClient: (id: string) => Client | undefined;
    searchClients: (query: string) => Client[];
}
