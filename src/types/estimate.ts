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

export interface Estimate {
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
    // Добавляем поля, которые используются в коде
    clientId?: string; // Добавлено для совместимости
    clientName?: string; // Добавлено для совместимости
    clientPhone?: string; // Добавлено для совместимости
    clientEmail?: string; // Добавлено для совместимости
}