/**
 * Estimate Calculation Utilities
 * Business logic for calculating pool estimates
 */

import type { Bowl, Estimate } from '@/types';

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

export interface CalculationParams {
    bowls: Bowl[];
    laborCost: number;
    equipmentCost: number;
    additionalCosts: number;
    vatRate: number;
}

/**
 * Calculate total estimate with breakdown
 */
export const calculateEstimateTotal = (params: CalculationParams): CalculationResult => {
    const { bowls, laborCost, equipmentCost, additionalCosts, vatRate } = params;

    const materialsTotal = bowls.reduce((sum: number, bowl: Bowl) => sum + (bowl.price || 0), 0);
    const subtotal = materialsTotal + laborCost + equipmentCost + additionalCosts;
    const vat = subtotal * (vatRate / 100);
    const grandTotal = subtotal + vat;

    return {
        total: subtotal,
        breakdown: {
            materials: materialsTotal,
            labor: laborCost,
            equipment: equipmentCost,
            additional: additionalCosts,
        },
        vat,
        grandTotal,
    };
};

/**
 * Validate estimate data
 */
export const validateEstimateData = (estimate: Partial<Estimate>): string[] => {
    const errors: string[] = [];

    if (!estimate.name || estimate.name.trim().length === 0) {
        errors.push('Название сметы обязательно');
    }

    if (estimate.name && estimate.name.length > 200) {
        errors.push('Название сметы не должно превышать 200 символов');
    }

    if (estimate.total !== undefined && estimate.total < 0) {
        errors.push('Сумма сметы не может быть отрицательной');
    }

    if (estimate.status && !['draft', 'in_progress', 'completed', 'archived'].includes(estimate.status)) {
        errors.push('Некорректный статус сметы');
    }

    return errors;
};

/**
 * Generate unique estimate number
 */
export const generateEstimateNumber = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `EST-${timestamp.slice(-6)}-${random}`;
};

export interface FormattedEstimate extends Estimate {
    formattedTotal: string;
    createdDate: string;
    updatedDate: string | null;
}

/**
 * Format estimate for export
 */
export const formatEstimateForExport = (estimate: Estimate): FormattedEstimate => {
    return {
        ...estimate,
        formattedTotal: new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
        }).format(estimate.total || 0),
        createdDate: new Date(estimate.created_at).toLocaleDateString('ru-RU'),
        updatedDate: estimate.updated_at
            ? new Date(estimate.updated_at).toLocaleDateString('ru-RU')
            : null,
    };
};

/**
 * Calculate pool volume based on dimensions
 */
export const calculatePoolVolume = (
    length: number,
    width: number,
    depth: number
): number => {
    return length * width * depth;
};

/**
 * Calculate required materials based on pool dimensions
 */
export const calculateMaterialQuantities = (
    length: number,
    width: number,
    depth: number
): {
    concrete: number;
    tiles: number;
    waterproofing: number;
} => {
    const surfaceArea = 2 * (length * depth + width * depth) + length * width;
    const volume = calculatePoolVolume(length, width, depth);

    return {
        concrete: volume * 1.1, // 10% запас
        tiles: surfaceArea * 1.05, // 5% запас
        waterproofing: surfaceArea * 1.1, // 10% запас
    };
};

/**
 * Calculate estimated labor hours
 */
export const calculateLaborHours = (volume: number): number => {
    // Примерно 20 часов на кубометр
    const baseHours = volume * 20;
    // Минимум 40 часов
    return Math.max(baseHours, 40);
};

/**
 * Calculate project timeline in days
 */
export const calculateProjectTimeline = (volume: number): number => {
    // Базовый расчет: 2 дня на кубометр + фиксированное время на подготовку
    const preparationDays = 7;
    const constructionDays = Math.ceil(volume * 2);
    const finishingDays = Math.ceil(volume * 1.5);

    return preparationDays + constructionDays + finishingDays;
};
