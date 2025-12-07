/**
 * Утилиты для расчета аналитических метрик
 */

interface Estimate {
    total?: number;
    status?: string;
    createdAt?: string;
    created_at?: string;
    selection?: {
        clientInfo?: {
            managerName?: string;
        };
        items?: any[];
    };
    items?: any[];
}

interface KPIResult {
    totalEstimates: number;
    totalAmount: number;
    averageCheck: number;
    conversionRate: number;
}

interface MonthData {
    month: string;
    year: number;
    count: number;
    amount: number;
}

interface CategoryData {
    name: string;
    value: number;
    count: number;
    [key: string]: unknown; // Index signature for recharts compatibility
}

/**
 * Рассчитать KPI метрики из массива смет
 */
export const calculateKPIs = (estimates: Estimate[]): KPIResult => {
    if (!estimates || estimates.length === 0) {
        return {
            totalEstimates: 0,
            totalAmount: 0,
            averageCheck: 0,
            conversionRate: 0
        };
    }

    const totalEstimates = estimates.length;
    const totalAmount = estimates.reduce((sum, est) => sum + (est.total || 0), 0);
    const averageCheck = totalAmount / totalEstimates;

    const wonCount = estimates.filter(est =>
        est.status === 'won' || est.status === 'completed'
    ).length;
    const conversionRate = totalEstimates > 0 ? wonCount / totalEstimates : 0;

    return {
        totalEstimates,
        totalAmount,
        averageCheck,
        conversionRate
    };
};

export const getSalesByMonth = (estimates: Estimate[]): MonthData[] => {
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    const grouped = estimates.reduce((acc: Record<string, MonthData>, est) => {
        const date = new Date(est.createdAt || est.created_at || Date.now());
        const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;

        if (!acc[monthKey]) {
            acc[monthKey] = {
                month: monthNames[date.getMonth()],
                year: date.getFullYear(),
                count: 0,
                amount: 0
            };
        }

        acc[monthKey].count++;
        acc[monthKey].amount += est.total || 0;

        return acc;
    }, {});

    return Object.values(grouped).sort((a: MonthData, b: MonthData) => {
        if (a.year !== b.year) return a.year - b.year;
        return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
    });
};

export const getTopEquipment = (estimates: Estimate[], limit: number = 10) => {
    const allItems = estimates.flatMap(est => {
        const selection = est.selection || {};
        return selection.items || est.items || [];
    });

    const grouped = allItems.reduce((acc: Record<string, any>, item: any) => {
        const key = item.name || 'Без названия';

        if (!acc[key]) {
            acc[key] = {
                name: key,
                count: 0,
                totalAmount: 0,
                category: item.category || 'Разное'
            };
        }

        acc[key].count++;
        acc[key].totalAmount += item.total || item.price || 0;

        return acc;
    }, {});

    return Object.values(grouped)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, limit);
};

export const getSalesByCategory = (estimates: Estimate[]): CategoryData[] => {
    const allItems = estimates.flatMap(est => {
        const selection = est.selection || {};
        return selection.items || est.items || [];
    });

    const grouped = allItems.reduce((acc: Record<string, CategoryData>, item: any) => {
        const category = item.category || item.section || 'Разное';

        if (!acc[category]) {
            acc[category] = {
                name: category,
                value: 0,
                count: 0
            };
        }

        acc[category].value += item.total || item.price || 0;
        acc[category].count++;

        return acc;
    }, {});

    return Object.values(grouped).sort((a: CategoryData, b: CategoryData) => b.value - a.value);
};

export const filterByDateRange = (estimates: Estimate[], startDate: Date, endDate: Date): Estimate[] => {
    return estimates.filter(est => {
        const date = new Date(est.createdAt || est.created_at || Date.now());
        return date >= startDate && date <= endDate;
    });
};

export const filterByManager = (estimates: Estimate[], managerName: string): Estimate[] => {
    if (!managerName || managerName === 'all') return estimates;

    return estimates.filter(est => {
        const selection = est.selection || {};
        const clientInfo = selection.clientInfo || {};
        return clientInfo.managerName === managerName;
    });
};

export const filterByStatus = (estimates: Estimate[], status: string): Estimate[] => {
    if (!status || status === 'all') return estimates;
    return estimates.filter(est => est.status === status);
};

export const getManagers = (estimates: Estimate[]): string[] => {
    const managers = new Set<string>();

    estimates.forEach(est => {
        const selection = est.selection || {};
        const clientInfo = selection.clientInfo || {};
        if (clientInfo.managerName) {
            managers.add(clientInfo.managerName);
        }
    });

    return Array.from(managers).sort();
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatPercent = (value: number): string => {
    return `${Math.round(value * 100)}%`;
};