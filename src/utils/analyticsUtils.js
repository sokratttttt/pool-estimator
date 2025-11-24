/**
 * Утилиты для расчета аналитических метрик
 */

/**
 * Рассчитать KPI метрики из массива смет
 * @param {Array} estimates - массив смет
 * @returns {Object} - объект с метриками
 */
export const calculateKPIs = (estimates) => {
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

    // Конверсия = (количество со статусом 'won' или 'completed') / общее количество
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

/**
 * Группировать продажи по месяцам
 * @param {Array} estimates - массив смет
 * @returns {Array} - массив объектов с данными по месяцам
 */
export const getSalesByMonth = (estimates) => {
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    // Группировка по месяцам
    const grouped = estimates.reduce((acc, est) => {
        const date = new Date(est.createdAt || est.created_at);
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

    // Преобразовать в массив и отсортировать
    return Object.values(grouped).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
    });
};

/**
 * Получить топ популярного оборудования
 * @param {Array} estimates - массив смет
 * @param {number} limit - количество позиций в топе
 * @returns {Array} - массив топ позиций
 */
export const getTopEquipment = (estimates, limit = 10) => {
    // Собрать все items из всех смет
    const allItems = estimates.flatMap(est => {
        const selection = est.selection || {};
        return selection.items || est.items || [];
    });

    // Группировка по названию
    const grouped = allItems.reduce((acc, item) => {
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

    // Преобразовать в массив, отсортировать по количеству и взять топ
    return Object.values(grouped)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};

/**
 * Получить распределение по категориям
 * @param {Array} estimates - массив смет
 * @returns {Array} - массив с данными по категориям для pie chart
 */
export const getSalesByCategory = (estimates) => {
    const allItems = estimates.flatMap(est => {
        const selection = est.selection || {};
        return selection.items || est.items || [];
    });

    // Группировка по категориям
    const grouped = allItems.reduce((acc, item) => {
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

    return Object.values(grouped).sort((a, b) => b.value - a.value);
};

/**
 * Фильтровать сметы по периоду
 * @param {Array} estimates - массив смет
 * @param {Date} startDate - начальная дата
 * @param {Date} endDate - конечная дата
 * @returns {Array} - отфильтрованные сметы
 */
export const filterByDateRange = (estimates, startDate, endDate) => {
    return estimates.filter(est => {
        const date = new Date(est.createdAt || est.created_at);
        return date >= startDate && date <= endDate;
    });
};

/**
 * Фильтровать сметы по менеджеру
 * @param {Array} estimates - массив смет
 * @param {string} managerName - имя менеджера
 * @returns {Array} - отфильтрованные сметы
 */
export const filterByManager = (estimates, managerName) => {
    if (!managerName || managerName === 'all') return estimates;

    return estimates.filter(est => {
        const selection = est.selection || {};
        const clientInfo = selection.clientInfo || {};
        return clientInfo.managerName === managerName;
    });
};

/**
 * Фильтровать сметы по статусу
 * @param {Array} estimates - массив смет
 * @param {string} status - статус ('draft', 'sent', 'won', 'lost')
 * @returns {Array} - отфильтрованные сметы
 */
export const filterByStatus = (estimates, status) => {
    if (!status || status === 'all') return estimates;
    return estimates.filter(est => est.status === status);
};

/**
 * Получить список уникальных менеджеров
 * @param {Array} estimates - массив смет
 * @returns {Array} - массив имен менеджеров
 */
export const getManagers = (estimates) => {
    const managers = new Set();

    estimates.forEach(est => {
        const selection = est.selection || {};
        const clientInfo = selection.clientInfo || {};
        if (clientInfo.managerName) {
            managers.add(clientInfo.managerName);
        }
    });

    return Array.from(managers).sort();
};

/**
 * Форматировать число как валюту
 * @param {number} amount - сумма
 * @returns {string} - отформатированная строка
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Форматировать процент
 * @param {number} value - значение от 0 до 1
 * @returns {string} - отформатированная строка
 */
export const formatPercent = (value) => {
    return `${Math.round(value * 100)}%`;
};
