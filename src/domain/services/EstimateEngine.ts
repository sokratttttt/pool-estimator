/**
 * Estimate Engine - Единый движок расчёта смет
 * 
 * Централизованная логика всех вычислений:
 * - Расчёт стоимости оборудования
 * - Расчёт работ по размерам
 * - Применение коэффициентов
 * - Скидки и наценки
 */

import type { Dimensions, EstimateItem } from '@/types';

// Локальный интерфейс для Selection (чтобы не зависеть от контекста)
interface Selection {
    bowl?: { id?: string; name?: string; price?: number };
    filtration?: { id?: string; name?: string; price?: number; flowRate?: number };
    heating?: { id?: string; name?: string; price?: number };
    additional?: Array<{ id?: string; name?: string; price?: number; quantity?: number; unit?: string }>;
    [key: string]: unknown;
}

// ===== ТИПЫ =====

export interface EstimateEngineConfig {
    marginPercent: number;        // Наценка компании (%)
    taxRate: number;              // НДС (%)
    roundingStrategy: 'floor' | 'ceil' | 'round';
    applySeasonalCoefficients: boolean;
}

export interface CalculationContext {
    selection: Selection;
    dimensions: Dimensions;
    clientType?: 'individual' | 'company';
    region?: string;
    season?: 'summer' | 'winter' | 'spring' | 'fall';
}

export interface CalculatedItem extends EstimateItem {
    basePrice: number;
    appliedCoefficient: number;
    calculatedBy: 'manual' | 'formula' | 'catalog';
}

export interface CalculationResult {
    items: CalculatedItem[];
    subtotal: number;
    discount: number;
    discountPercent: number;
    tax: number;
    total: number;
    breakdown: CostBreakdown;
    volume: number;
    surfaceArea: number;
}

export interface CostBreakdown {
    equipment: number;
    works: number;
    materials: number;
    additional: number;
}

// ===== КОЭФФИЦИЕНТЫ =====

export const COEFFICIENTS = {
    // Региональные
    regional: {
        moscow: 1.2,
        spb: 1.15,
        regions: 1.0,
        default: 1.0,
    },

    // Сезонные
    seasonal: {
        summer: 1.15,   // Высокий сезон
        spring: 1.0,
        fall: 0.95,
        winter: 0.85,   // Низкий сезон
    },

    // Сложность работ
    complexity: {
        standard: 1.0,
        premium: 1.25,
        custom: 1.5,
    },

    // Объёмные скидки
    volumeDiscounts: [
        { minVolume: 50, discount: 0.03 },
        { minVolume: 100, discount: 0.05 },
        { minVolume: 200, discount: 0.08 },
    ],
} as const;

// ===== ФОРМУЛЫ РАБОТ =====

interface WorkFormula {
    id: string;
    name: string;
    section: string;
    unit: string;
    pricePerUnit: number;
    formula: (d: Dimensions) => number;
    minQuantity?: number;
}

export const WORK_FORMULAS: WorkFormula[] = [
    // Земляные работы
    {
        id: 'excavation',
        name: 'Копка котлована',
        section: 'Земляные работы',
        unit: 'м³',
        pricePerUnit: 2500,
        formula: (d) => {
            // Котлован больше бассейна на 0.5м с каждой стороны и 0.3м глубже
            const length = (d.length || 8) + 1;
            const width = (d.width || 4) + 1;
            const depth = (d.depth || 1.5) + 0.3;
            return length * width * depth * 1.3; // Коэф. рыхления
        },
    },
    {
        id: 'backfill',
        name: 'Обратная засыпка',
        section: 'Земляные работы',
        unit: 'м³',
        pricePerUnit: 1500,
        formula: (d) => {
            const excavationVolume = ((d.length || 8) + 1) * ((d.width || 4) + 1) * ((d.depth || 1.5) + 0.3);
            const poolVolume = (d.length || 8) * (d.width || 4) * (d.depth || 1.5);
            return (excavationVolume - poolVolume) * 0.4;
        },
    },
    {
        id: 'soil_removal',
        name: 'Вывоз грунта',
        section: 'Земляные работы',
        unit: 'м³',
        pricePerUnit: 800,
        formula: (d) => {
            const excavationVolume = ((d.length || 8) + 1) * ((d.width || 4) + 1) * ((d.depth || 1.5) + 0.3);
            return excavationVolume * 0.6; // Вывозим 60% грунта
        },
    },

    // Фундамент и бетонные работы
    {
        id: 'concrete_pad',
        name: 'Бетонная подушка',
        section: 'Бетонные работы',
        unit: 'м³',
        pricePerUnit: 8000,
        formula: (d) => {
            const length = (d.length || 8) + 0.4;
            const width = (d.width || 4) + 0.4;
            return length * width * 0.15; // Толщина 15см
        },
    },
    {
        id: 'concrete_belt',
        name: 'Бетонный пояс',
        section: 'Бетонные работы',
        unit: 'м.п.',
        pricePerUnit: 4500,
        formula: (d) => 2 * ((d.length || 8) + (d.width || 4)) + 4,
    },

    // Монтаж
    {
        id: 'bowl_installation',
        name: 'Монтаж чаши',
        section: 'Монтажные работы',
        unit: 'шт',
        pricePerUnit: 45000,
        formula: () => 1,
        minQuantity: 1,
    },
    {
        id: 'equipment_installation',
        name: 'Монтаж оборудования',
        section: 'Монтажные работы',
        unit: 'комплект',
        pricePerUnit: 35000,
        formula: () => 1,
        minQuantity: 1,
    },
    {
        id: 'piping',
        name: 'Обвязка трубами',
        section: 'Монтажные работы',
        unit: 'м.п.',
        pricePerUnit: 1200,
        formula: (d) => 2 * ((d.length || 8) + (d.width || 4)) + 20,
    },

    // Отделка
    {
        id: 'tile_work',
        name: 'Укладка плитки (борта)',
        section: 'Отделочные работы',
        unit: 'м²',
        pricePerUnit: 3000,
        formula: (d) => 2 * ((d.length || 8) + (d.width || 4)) * 0.5,
    },
    {
        id: 'deck_finishing',
        name: 'Отделка террасы',
        section: 'Отделочные работы',
        unit: 'м²',
        pricePerUnit: 2500,
        formula: (d) => {
            const poolArea = (d.length || 8) * (d.width || 4);
            return poolArea * 0.3; // 30% от площади бассейна
        },
    },
];

// ===== ESTIMATE ENGINE CLASS =====

export class EstimateEngine {
    private config: EstimateEngineConfig;

    constructor(config: Partial<EstimateEngineConfig> = {}) {
        this.config = {
            marginPercent: 15,
            taxRate: 0, // Без НДС по умолчанию
            roundingStrategy: 'round',
            applySeasonalCoefficients: true,
            ...config,
        };
    }

    /**
     * Главный метод расчёта сметы
     */
    calculate(context: CalculationContext): CalculationResult {
        const { dimensions } = context;

        // Рассчитываем объём и площадь
        const volume = this.calculateVolume(dimensions);
        const surfaceArea = this.calculateSurfaceArea(dimensions);

        // Собираем все позиции
        const items: CalculatedItem[] = [
            ...this.calculateEquipmentItems(context),
            ...this.calculateWorksItems(context),
            ...this.calculateAdditionalItems(context),
        ];

        // Применяем коэффициенты
        const itemsWithCoefficients = items.map(item =>
            this.applyCoefficients(item, context)
        );

        // Считаем итоги
        const breakdown = this.calculateBreakdown(itemsWithCoefficients);
        const subtotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

        // Скидки
        const { discount, discountPercent } = this.calculateDiscount(subtotal, volume, context);

        // Налоги
        const tax = (subtotal - discount) * (this.config.taxRate / 100);

        // Итого
        const total = this.round(subtotal - discount + tax);

        return {
            items: itemsWithCoefficients,
            subtotal: this.round(subtotal),
            discount: this.round(discount),
            discountPercent,
            tax: this.round(tax),
            total,
            breakdown,
            volume,
            surfaceArea,
        };
    }

    /**
     * Расчёт объёма воды
     */
    calculateVolume(dimensions: Dimensions): number {
        const { length = 8, width = 4, depth = 1.5 } = dimensions;
        return this.round(length * width * depth, 1);
    }

    /**
     * Расчёт площади поверхности
     */
    calculateSurfaceArea(dimensions: Dimensions): number {
        const { length = 8, width = 4, depth = 1.5 } = dimensions;
        const bottom = length * width;
        const walls = 2 * (length + width) * depth;
        return this.round(bottom + walls, 1);
    }

    /**
     * Расчёт требуемой производительности фильтрации
     */
    calculateRequiredFlow(volume: number, turnoverHours: number = 4): number {
        return this.round(volume / turnoverHours, 1);
    }

    /**
     * Расчёт требуемой мощности подогрева
     */
    calculateRequiredHeating(volume: number): number {
        // ~0.5 кВт на 1 м³ для поддержания температуры
        return this.round(volume * 0.5, 1);
    }

    // ===== PRIVATE METHODS =====

    private calculateEquipmentItems(context: CalculationContext): CalculatedItem[] {
        const items: CalculatedItem[] = [];
        const { selection } = context;

        // Чаша
        if (selection.bowl) {
            items.push({
                id: `bowl-${selection.bowl.id}`,
                name: selection.bowl.name || 'Чаша бассейна',
                section: 'Чаша бассейна',
                category: 'bowl',
                quantity: 1,
                unit: 'шт',
                price: selection.bowl.price || 0,
                total: selection.bowl.price || 0,
                basePrice: selection.bowl.price || 0,
                appliedCoefficient: 1,
                calculatedBy: 'catalog',
            });
        }

        // Фильтрация
        if (selection.filtration) {
            const filtration = selection.filtration as { id?: string; name?: string; price?: number };
            items.push({
                id: `filtration-${filtration.id}`,
                name: filtration.name || 'Система фильтрации',
                section: 'Оборудование',
                category: 'filtration',
                quantity: 1,
                unit: 'комплект',
                price: filtration.price || 0,
                total: filtration.price || 0,
                basePrice: filtration.price || 0,
                appliedCoefficient: 1,
                calculatedBy: 'catalog',
            });
        }

        // Подогрев
        if (selection.heating) {
            const heating = selection.heating as { id?: string; name?: string; price?: number };
            items.push({
                id: `heating-${heating.id}`,
                name: heating.name || 'Система подогрева',
                section: 'Подогрев',
                category: 'heating',
                quantity: 1,
                unit: 'шт',
                price: heating.price || 0,
                total: heating.price || 0,
                basePrice: heating.price || 0,
                appliedCoefficient: 1,
                calculatedBy: 'catalog',
            });
        }

        return items;
    }

    private calculateWorksItems(context: CalculationContext): CalculatedItem[] {
        const { dimensions } = context;

        return WORK_FORMULAS.map((formula) => {
            const quantity = Math.max(
                this.round(formula.formula(dimensions), 1),
                formula.minQuantity || 0
            );
            const total = quantity * formula.pricePerUnit;

            return {
                id: `work-${formula.id}`,
                name: formula.name,
                section: formula.section,
                category: 'works',
                quantity,
                unit: formula.unit,
                price: formula.pricePerUnit,
                total,
                basePrice: formula.pricePerUnit,
                appliedCoefficient: 1,
                calculatedBy: 'formula' as const,
            };
        }).filter(item => item.quantity > 0);
    }

    private calculateAdditionalItems(context: CalculationContext): CalculatedItem[] {
        const items: CalculatedItem[] = [];
        const additional = context.selection.additional || [];

        additional.forEach((item: { id?: string; name?: string; price?: number; quantity?: number; unit?: string }, index: number) => {
            const itemData = item;
            items.push({
                id: `additional-${itemData.id || index}`,
                name: itemData.name || 'Дополнительное оборудование',
                section: 'Дополнительное оборудование',
                category: 'additional',
                quantity: itemData.quantity || 1,
                unit: itemData.unit || 'шт',
                price: itemData.price || 0,
                total: (itemData.price || 0) * (itemData.quantity || 1),
                basePrice: itemData.price || 0,
                appliedCoefficient: 1,
                calculatedBy: 'catalog',
            });
        });

        return items;
    }

    private applyCoefficients(item: CalculatedItem, context: CalculationContext): CalculatedItem {
        let coefficient = 1;

        // Региональный коэффициент
        if (context.region) {
            coefficient *= COEFFICIENTS.regional[context.region as keyof typeof COEFFICIENTS.regional]
                || COEFFICIENTS.regional.default;
        }

        // Сезонный коэффициент (только для работ)
        if (this.config.applySeasonalCoefficients && context.season && item.category === 'works') {
            coefficient *= COEFFICIENTS.seasonal[context.season];
        }

        const newTotal = this.round((item.total ?? 0) * coefficient);

        return {
            ...item,
            total: newTotal,
            appliedCoefficient: coefficient,
        };
    }

    private calculateBreakdown(items: CalculatedItem[]): CostBreakdown {
        return {
            equipment: items
                .filter(i => ['bowl', 'filtration', 'heating', 'parts'].includes(i.category || ''))
                .reduce((sum, i) => sum + (i.total ?? 0), 0),
            works: items
                .filter(i => i.category === 'works')
                .reduce((sum, i) => sum + (i.total ?? 0), 0),
            materials: items
                .filter(i => i.category === 'materials')
                .reduce((sum, i) => sum + (i.total ?? 0), 0),
            additional: items
                .filter(i => i.category === 'additional')
                .reduce((sum, i) => sum + (i.total ?? 0), 0),
        };
    }

    private calculateDiscount(subtotal: number, volume: number, _context: CalculationContext): { discount: number; discountPercent: number } {
        // Объёмная скидка
        const applicableDiscount = COEFFICIENTS.volumeDiscounts
            .filter(d => volume >= d.minVolume)
            .reduce((max, d) => Math.max(max, d.discount), 0);

        return {
            discount: subtotal * applicableDiscount,
            discountPercent: applicableDiscount * 100,
        };
    }

    private round(value: number, decimals: number = 0): number {
        const multiplier = Math.pow(10, decimals);
        switch (this.config.roundingStrategy) {
            case 'floor':
                return Math.floor(value * multiplier) / multiplier;
            case 'ceil':
                return Math.ceil(value * multiplier) / multiplier;
            default:
                return Math.round(value * multiplier) / multiplier;
        }
    }
}

// Экспорт singleton для удобства
export const estimateEngine = new EstimateEngine();
