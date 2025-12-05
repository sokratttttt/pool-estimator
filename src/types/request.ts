/**
 * Request Types
 * Type definitions for request/lead management
 */

// ============================================
// REQUEST ENTITY
// ============================================

/**
 * Request status values
 */
export type RequestStatus =
    | 'new'
    | 'in_progress'
    | 'estimate_sent'
    | 'completed'
    | 'cancelled';

/**
 * Request type values
 */
export type RequestType =
    | 'pool'
    | 'spa'
    | 'consultation'
    | 'service'
    | 'other';

/**
 * Forecast status for sales pipeline
 */
export type ForecastStatus =
    | 'hot'
    | 'warm'
    | 'cold'
    | 'lost';

/**
 * Request record from database
 */
export interface Request {
    id: string;
    client_name: string;
    phone?: string;
    email?: string;
    status: RequestStatus;
    request_type?: RequestType;
    forecast_status?: ForecastStatus;
    manager?: string;
    description?: string;
    estimate_id?: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
    created_by?: string;
}

/**
 * Data for creating a new request
 */
export type RequestCreateData = Omit<Request, 'id' | 'created_at' | 'created_by'>;

/**
 * Data for updating a request
 */
export type RequestUpdateData = Partial<RequestCreateData>;

// ============================================
// FILTER TYPES
// ============================================

/**
 * Filters for querying requests
 */
export interface RequestFilters {
    status?: RequestStatus;
    manager?: string;
    forecast_status?: ForecastStatus;
    request_type?: RequestType;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

// ============================================
// STATISTICS TYPES
// ============================================

/**
 * Request statistics from database view
 */
export interface RequestStats {
    total: number;
    new_count: number;
    in_progress_count: number;
    completed_count: number;
    cancelled_count: number;
    hot_count?: number;
    warm_count?: number;
    cold_count?: number;
}

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Requests context value type
 */
export interface RequestsContextValue {
    requests: Request[];
    loading: boolean;
    stats: RequestStats | null;

    // Data fetching
    fetchRequests: (filters?: RequestFilters) => Promise<Request[]>;
    fetchStats: () => Promise<RequestStats | null>;

    // CRUD operations
    createRequest: (requestData: RequestCreateData) => Promise<Request | null>;
    updateRequest: (id: string, updates: RequestUpdateData) => Promise<Request | null>;
    deleteRequest: (id: string) => Promise<boolean>;

    // Special operations
    convertToEstimate: (requestId: string, estimateData: { id: string }) => Promise<Request | null>;
    bulkUpdateStatus: (ids: string[], status: RequestStatus) => Promise<boolean>;
}
