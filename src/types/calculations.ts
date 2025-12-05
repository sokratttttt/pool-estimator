/**
 * Calculation Types for Pool Estimates
 * Strict types for all calculation functions to ensure accuracy
 */

// ============================================
// DIMENSION TYPES
// ============================================

/**
 * Pool dimensions in METERS
 * All measurements must be positive numbers
 */
export interface PoolDimensions {
    /** Length in meters, must be > 0 */
    length: number;
    /** Width in meters, must be > 0 */
    width: number;
    /** Depth in meters, must be > 0 */
    depth: number;
    /** Pre-calculated volume in cubic meters (optional, will be calculated if missing) */
    volume?: number;
}

// ============================================
// MATERIAL TYPES
// ============================================

export type PoolMaterialType = 'concrete' | 'composite' | 'polypropylene';
export type ConstructionType = 'monolith' | 'belt' | 'slab';

export interface PoolMaterial {
    id: PoolMaterialType;
    name: string;
    description: string;
    image?: string;
    basePricePerCubicMeter: number;
    type: 'custom' | 'fixed';
    constructionType: ConstructionType;
}

// ============================================
// ESTIMATE ITEM TYPES
// ============================================

export type EstimateSection =
    | 'Чаша бассейна'
    | 'Оборудование'
    | 'Подогрев'
    | 'Дополнительное оборудование'
    | 'Монтажные работы'
    | 'Строительные работы'
    | 'Строительные материалы';

export interface EstimateItem {
    id: string;
    section: EstimateSection;
    name: string;
    /** Price per unit in RUB, must be >= 0 */
    price: number;
    /** Quantity, must be >= 0, defaults to 1 */
    quantity: number;
    /** Unit of measurement */
    unit: string;
    /** Total price (calculated as price * quantity) */
    total?: number;
    /** Category for grouping */
    category?: string;
}

// ============================================
// EQUIPMENT TYPES
// ============================================

export interface FiltrationEquipment {
    id: string;
    name: string;
    type: 'filter' | 'pump' | 'skimmer' | 'nozzle';
    manufacturer: string;
    price: number;
    installationPrice: number;
    /** Recommended pool volume range in m³ */
    volumeRange?: {
        min: number;
        max: number;
    };
}

export interface HeatingEquipment {
    id: string;
    name: string;
    type: 'heat_exchanger' | 'electric_heater' | 'heat_pump' | 'solar' | 'none';
    power: number; // kW
    price: number;
    installationPrice: number;
    /** Operating cost per hour in RUB */
    operatingCostPerHour?: number;
}

export interface EmbeddedParts {
    id: string;
    name: string;
    material: 'steel' | 'plastic' | 'bronze';
    items: Array<{
        name: string;
        price: number;
        quantity: number;
        installationPrice: number;
        type: 'nozzle' | 'skimmer' | 'drain' | 'light' | 'other';
    }>;
}

// ============================================
// WORK TYPES
// ============================================

export interface WorkItem {
    id: string;
    name: string;
    unit: 'м²' | 'м³' | 'шт' | 'час' | 'комплект';
    pricePerUnit: number;
    /** For auto-calculated works */
    autoCalculate?: boolean;
    /** Formula function for auto-calculation */
    formula?: (dimensions: PoolDimensions, selection: unknown) => number;
}

export interface CalculatedWork extends WorkItem {
    quantity: number;
    total: number;
}

// ============================================
// CALCULATION RESULT TYPES
// ============================================

export interface MaterialQuantities {
    /** Concrete volume in m³ (with 10% reserve) */
    concrete: number;
    /** Tile area in m² (with 5% reserve) */
    tiles: number;
    /** Waterproofing area in m² (with 10% reserve) */
    waterproofing: number;
}

export interface CalculationBreakdown {
    materials: number;
    labor: number;
    equipment: number;
    additional: number;
}

export interface CalculationResult {
    /** Subtotal before VAT */
    total: number;
    breakdown: CalculationBreakdown;
    /** VAT amount */
    vat: number;
    /** Grand total including VAT */
    grandTotal: number;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate that a number is positive
 */
export function assertPositive(value: number, name: string): asserts value is number {
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
        throw new Error(`${name} must be a positive number, got: ${value}`);
    }
}

/**
 * Validate that a number is non-negative
 */
export function assertNonNegative(value: number, name: string): asserts value is number {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
        throw new Error(`${name} must be non-negative, got: ${value}`);
    }
}

/**
 * Round to specified decimal places (defaults to 2 for money)
 */
export function roundMoney(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Round volume to 3 decimal places
 */
export function roundVolume(value: number): number {
    return Math.round(value * 1000) / 1000;
}
