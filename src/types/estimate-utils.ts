/**
 * Estimate Utility Types
 * Types for estimate generation and calculation
 */

export interface MaterialSelection {
    id: string;
    type: string; // 'concrete' | 'tile' | 'film' | 'mosaic' | 'other' | 'polypropylene' | 'composite' | 'custom' | 'fixed'
    name: string;
    thickness?: number; // mm
    color?: string;
    brand?: string;
    area?: number; // m²
    unitPrice?: number; // price per unit
    basePricePerCubicMeter?: number; // for polypropylene
}

export interface EquipmentSelection {
    id?: string;
    category?: 'pump' | 'filter' | 'heater' | 'lighting' | 'cleaning' | 'control' | 'skimmer' | 'nozzle' | 'other' | string;
    model?: string;
    type?: string; // specific type like 'skimmer', 'nozzle'
    power?: number; // kW
    flowRate?: number; // l/h
    quantity?: number;
    unitPrice?: number;
    installationPrice?: number;
    items?: EquipmentSelection[]; // for nested items
    name?: string; // sometimes used instead of model
    price?: number; // sometimes used instead of unitPrice
}

export interface WorkSelection {
    id: string;
    type: 'excavation' | 'concrete' | 'tiling' | 'plumbing' | 'electrical' | 'finishing' | 'installation';
    name: string;
    duration: number; // hours
    rate: number; // rate per hour
    workers: number;
    total: number; // total cost
    quantity?: number;
    unit?: string;
}

export interface BowlSelection {
    name: string;
    price: number;
    length?: number;
    width?: number;
    depth?: number;
    volume?: number;
}

export interface Dimensions {
    length: number;
    width: number;
    depth: number;
    volume?: number;
}

export interface Selection {
    materials?: MaterialSelection[] | null;
    equipment?: EquipmentSelection[] | null;
    works?: Record<string, WorkSelection> | WorkSelection[] | null;
    dimensions?: Dimensions | null;
    bowl?: BowlSelection | null;
    material?: MaterialSelection | null;
    filtration?: EquipmentSelection | null;
    parts?: {
        name?: string;
        price?: number;
        items?: EquipmentSelection[];
    } | null;
    heating?: (EquipmentSelection & { items?: EquipmentSelection[] }) | null;
    additional?: EquipmentSelection[] | null;
}

export interface PriceList {
    materials: Record<string, number>; // id -> price per unit
    equipment: Record<string, number>;
    works: Record<string, number>;
    coefficients: {
        delivery: number; // delivery coefficient
        complexity: number; // complexity coefficient
        urgency: number; // urgency coefficient
    };
}

export interface EstimateItem {
    id: string;
    section: string; // 'materials' | 'equipment' | 'works' | 'delivery' | 'other' or localized string
    name: string;
    description?: string;
    quantity: number;
    unit: string; // 'шт', 'м²', 'м³', 'час', 'компл'
    unitPrice?: number; // optional as some items might just have price
    price: number; // REQUIRED now to match usage
    total?: number; // calculated total
    notes?: string;
    type?: string;
    installationPrice?: number;
}
