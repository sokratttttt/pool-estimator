/**
 * Global TypeScript Type Definitions
 * Shared types used across the application
 */

// ============================================
// BASE ENTITIES
// ============================================

export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}

export interface User extends BaseEntity {
    email: string;
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'manager' | 'user';
}

// ============================================
// BUSINESS ENTITIES
// ============================================

export interface Estimate extends BaseEntity {
    name: string;
    description?: string;
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    total: number;
    user_id: string;
    client_info?: ClientInfo;
    project_data?: ProjectData;
}

export interface Bowl extends BaseEntity {
    name: string;
    manufacturer: string;
    type: string;
    price: number;
    dimensions?: Dimensions;
    volume?: number;
    material?: string;
    image_url?: string;
}

export interface Equipment extends BaseEntity {
    name: string;
    category: string;
    manufacturer: string;
    price: number;
    specifications?: Record<string, any>;
}

export interface Deal extends BaseEntity {
    title: string;
    client_name?: string;
    client_phone?: string;
    client_email?: string;
    pool_size?: string;
    pool_type?: string;
    value?: number;
    probability?: number;
    stage: string;
    closed_at?: string;
}

export interface Project extends BaseEntity {
    name: string;
    latitude: string;
    longitude: string;
    address: string;
    pool_type: 'premium' | 'standard' | 'sport' | 'kids' | 'infinity';
    description?: string;
    completion_date?: string;
    budget?: number;
}

export interface MapFiltersState {
    poolTypes: string[];
    yearRange: number[];
    budgetRange: number[];
}

// ============================================
// SUPPORTING TYPES
// ============================================

export interface ClientInfo {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    managerName?: string;
    managerPhone?: string;
}

export interface Dimensions {
    length: number;
    width: number;
    depth: number;
}

export interface ProjectData {
    material?: any;
    dimensions?: Dimensions;
    bowl?: Bowl;
    filtration?: any;
    heating?: any;
    parts?: any[];
    additional?: any[];
}

// ============================================
// ESTIMATE HISTORY TYPES
// ============================================

export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';

export interface Customer {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    website?: string;
}

export interface EstimateItem {
    name: string;
    quantity: number;
    unit: string;
    price: number;
}

export interface EstimateSelection {
    items: EstimateItem[];
}

export interface HistoryEstimate {
    id: string;
    title?: string;
    status: EstimateStatus;
    total?: number;
    createdAt: string;
    updatedAt?: string;
    userId?: string;
    customer?: Customer;
    items?: EstimateItem[];
    selection?: EstimateSelection;
    notes?: string;
}

// ============================================
// STORE TYPES
// ============================================

export interface StoreState<T> {
    data: T[];
    current: T | null;
    isLoading: boolean;
    error: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
    data: T;
    error?: string;
    success: boolean;
    message?: string;
}

export interface ApiError {
    message: string;
    code: string;
    details?: any;
}

// ============================================
// FORM TYPES
// ============================================

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
    required?: boolean;
    placeholder?: string;
    options?: SelectOption[];
    validation?: ValidationRule[];
}

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message: string;
}

export interface FormErrors {
    [fieldName: string]: string[];
}

// ============================================
// CALCULATION TYPES
// ============================================

export interface CalculationResult {
    total: number;
    breakdown: {
        materials: number;
        labor: number;
        equipment: number;
        additional: number;
    };
    vat: number;
    grandTotal: number;
}

export interface PriceBreakdown {
    subtotal: number;
    discount?: number;
    tax: number;
    total: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make specified fields optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified fields required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make all fields optional except specified ones
 */
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================
// COMPONENT TYPES
// ============================================

export interface ComponentWithChildren {
    children: React.ReactNode;
}

export interface ComponentWithClassName {
    className?: string;
}

export interface ModalProps extends ComponentWithChildren {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

// ============================================
// FILTER & SORT TYPES
// ============================================

export interface FilterOptions {
    status?: string;
    search?: string;
    dateRange?: DateRange;
    category?: string;
}

export interface DateRange {
    start: Date;
    end: Date;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
    field: string;
    order: SortOrder;
}

// ============================================
// THEME TYPES
// ============================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    warning: string;
    success: string;
}