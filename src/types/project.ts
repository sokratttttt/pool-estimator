/**
 * Project Types
 * Central type definitions for Pool Estimator project
 */

// ============================================
// BASE TYPES
// ============================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}

// ============================================
// PROJECT STATUS & PRIORITY
// ============================================

export type ProjectStatus =
    | 'lead'           // лид
    | 'consultation'   // консультация
    | 'estimation'     // составление сметы
    | 'negotiation'    // переговоры
    | 'contract'       // договор
    | 'design'         // дизайн
    | 'preparation'    // подготовка
    | 'construction'   // строительство
    | 'finishing'      // отделка
    | 'completed'      // завершен
    | 'warranty'       // гарантия
    | 'cancelled';     // отменен

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectType = 'pool' | 'spa' | 'fountain' | 'pond' | 'waterfall' | 'irrigation';

export type ProjectScale = 'residential' | 'commercial' | 'municipal' | 'industrial';

// ============================================
// POOL DIMENSIONS & CONFIGURATION
// ============================================

export type PoolType = 'rectangular' | 'oval' | 'freeform' | 'infinity' | 'lap' | 'plunge';

export interface PoolDimensions {
    length: number;      // meters
    width: number;       // meters
    depth: number;       // average depth in meters
    depthMin?: number;   // shallow end
    depthMax?: number;   // deep end
    volume?: number;     // liters (auto-calculated)
    surfaceArea?: number; // m²
}

export type PoolMaterial =
    | 'concrete'        // бетон
    | 'fiberglass'      // стеклопластик
    | 'liner'           // пленка ПВХ
    | 'stainless_steel' // нержавейка
    | 'mosaic';         // мозаика

export type PoolFinish =
    | 'tiles'           // плитка
    | 'mosaic'          // мозаика
    | 'liner_pvc'       // ПВХ пленка
    | 'paint'           // краска
    | 'aggregate';      // агрегатное покрытие

// ============================================
// SITE CONDITIONS
// ============================================

export type SiteCondition =
    | 'flat'            // ровная
    | 'sloped'          // уклон
    | 'rocky'           // каменистая
    | 'clay'            // глинистая
    | 'sandy'           // песчаная
    | 'wet'             // влажная
    | 'limited_access'  // ограниченный доступ
    | 'urban'           // городская застройка
    | 'rural';          // сельская местность

export interface SiteInfo {
    address?: string;
    city?: string;
    region?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    conditions: SiteCondition[];
    accessNotes?: string;
    groundwaterLevel?: number; // meters
}

// ============================================
// EQUIPMENT & MATERIALS
// ============================================

export interface EquipmentItem {
    id: string;
    name: string;
    category: EquipmentCategory;
    brand?: string;
    model?: string;
    price: number;
    quantity: number;
    unit: string;
    warrantyMonths?: number;
    specifications?: Record<string, string | number>;
}

export type EquipmentCategory =
    | 'filtration'      // фильтрация
    | 'heating'         // обогрев
    | 'lighting'        // освещение
    | 'automation'      // автоматика
    | 'cleaning'        // очистка
    | 'safety'          // безопасность
    | 'entertainment'   // развлечения
    | 'accessories';    // аксессуары

export interface MaterialItem {
    id: string;
    name: string;
    category: MaterialCategory;
    unit: string;
    pricePerUnit: number;
    quantity: number;
    supplier?: string;
}

export type MaterialCategory =
    | 'construction'    // строительные
    | 'waterproofing'   // гидроизоляция
    | 'finishing'       // отделочные
    | 'plumbing'        // сантехника
    | 'electrical';     // электрика

// ============================================
// CALCULATION TYPES
// ============================================

export interface CalculationInput {
    dimensions: PoolDimensions;
    poolType: PoolType;
    material: PoolMaterial;
    finish: PoolFinish;
    equipment: EquipmentItem[];
    materials: MaterialItem[];
    works: WorkItem[];
    options: CalculationOptions;
}

export interface CalculationOptions {
    vatIncluded: boolean;
    vatRate: number;
    currency: Currency;
    discountPercent?: number;
    markupPercent?: number;
    roundToNearest?: number;
}

export type Currency = 'RUB' | 'EUR' | 'USD';

export interface WorkItem {
    id: string;
    name: string;
    category: string;
    unit: string;
    pricePerUnit: number;
    quantity: number;
    durationDays?: number;
}

export interface CalculationResult {
    subtotals: {
        materials: number;
        equipment: number;
        works: number;
        delivery: number;
    };
    totals: {
        beforeDiscount: number;
        discount: number;
        beforeVAT: number;
        vat: number;
        final: number;
    };
    breakdown: CalculationBreakdownItem[];
    generatedAt: string;
}

export interface CalculationBreakdownItem {
    category: string;
    items: Array<{
        name: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
}

// ============================================
// PROJECT TIMELINE
// ============================================

export interface ProjectTimeline {
    estimatedStartDate?: string;
    estimatedEndDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    phases: ProjectPhase[];
    milestones: ProjectMilestone[];
}

export interface ProjectPhase {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'active' | 'completed' | 'delayed';
    completionPercent: number;
}

export interface ProjectMilestone {
    id: string;
    name: string;
    date: string;
    status: 'upcoming' | 'completed' | 'missed';
    notes?: string;
}

// ============================================
// PROJECT ENTITY
// ============================================

export interface Project extends BaseEntity {
    name: string;
    description?: string;
    clientId: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    type: ProjectType;
    scale: ProjectScale;

    // Pool configuration
    poolType?: PoolType;
    dimensions?: PoolDimensions;
    material?: PoolMaterial;
    finish?: PoolFinish;

    // Site
    site?: SiteInfo;

    // Financial
    estimatedCost: number;
    actualCost?: number;
    currency: Currency;

    // Timeline
    timeline?: ProjectTimeline;

    // Metadata
    tags?: string[];
    notes?: string;
    attachments?: string[];
}

// ============================================
// FILTERS & SEARCH
// ============================================

export interface ProjectFilters {
    status?: ProjectStatus[];
    priority?: ProjectPriority[];
    type?: ProjectType[];
    scale?: ProjectScale[];
    dateRange?: { from: string; to: string };
    budgetRange?: { min: number; max: number };
    clientId?: string;
    assignedTo?: string;
    tags?: string[];
    searchText?: string;
}

// ============================================
// STATISTICS
// ============================================

export interface ProjectStatistics {
    totalProjects: number;
    byStatus: Partial<Record<ProjectStatus, number>>;
    byPriority: Partial<Record<ProjectPriority, number>>;
    byType: Partial<Record<ProjectType, number>>;
    averageBudget: number;
    totalRevenue: number;
    completionRate: number;
    averageTimelineDays: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Result type for async operations
 */
export interface AsyncResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Pagination params
 */
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}
