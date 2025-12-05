import { Deal } from '@/types';

/**
 * Analyze deals and generate actionable insights
 */
export function generateManagerInsights(deals: Deal[], requests: any[]): any {
    const insights: any[] = [];

    // 1. Stuck Deals Alert
    const stuckDeals = findStuckDeals(deals);
    if (stuckDeals.length > 0) {
        insights.push({
            type: 'alert',
            priority: 'high',
            title: `${stuckDeals.length} сделок без движения`,
            description: `${stuckDeals.length} сделок не обновлялись более 7 дней`,
            deals: stuckDeals,
            action: {
                label: 'Просмотреть',
                type: 'view_deals',
                data: stuckDeals
            },
            icon: '⚠️'
        });
    }

    // 2. Best Contact Times
    const contactTimeInsights = analyzeBestContactTimes(deals, requests);
    if (contactTimeInsights) {
        insights.push(contactTimeInsights);
    }

    // 3. Priority Tasks
    const priorityTasks = generatePriorityTasks(deals, requests);
    if (priorityTasks.length > 0) {
        insights.push({
            type: 'tasks',
            priority: 'medium',
            title: `${priorityTasks.length} приоритетных задач`,
            description: 'Действия, требующие внимания сегодня',
            tasks: priorityTasks,
            icon: '📋'
        });
    }

    // 4. Conversion Insights
    const conversionInsights = analyzeConversion(deals);
    if (conversionInsights) {
        insights.push(conversionInsights);
    }

    // 5. Revenue Forecast
    const forecast = calculateForecast(deals);
    if (forecast) {
        insights.push(forecast);
    }

    return insights;
}

function findStuckDeals(deals: Deal[]) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return deals
        .filter((deal: any) => {
            const updated = new Date(deal.updated_at);
            return updated < sevenDaysAgo && deal.stage !== 'completed';
        })
        .map((deal: Deal) => ({
            ...deal,
            daysStuck: Math.floor((Date.now() - new Date(deal.updated_at || deal.created_at).getTime()) / (1000 * 60 * 60 * 24))
        }))
        .sort((a: any, b: any) => b.daysStuck - a.daysStuck);
}

function analyzeBestContactTimes(deals: Deal[], _requests: any[]) {
    // Analyze when clients typically respond
    const hourCounts = Array(24).fill(0);

    deals.forEach(deal => {
        if (deal.created_at) {
            const hour = new Date(deal.created_at).getHours();
            hourCounts[hour]++;
        }
    });

    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHours = hourCounts
        .map((count: number, hour: number) => ({ hour, count }))
        .filter(h => h.count > 0)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 3);

    if (peakHours.length > 0) {
        return {
            type: 'recommendation',
            priority: 'low',
            title: 'Лучшее время для контактов',
            description: `Клиенты чаще всего отвечают в ${peakHours.map(p => `${p.hour}:00`).join(', ')}`,
            data: { peakHours, bestHour },
            icon: '⏰'
        };
    }

    return null;
}

function generatePriorityTasks(deals: Deal[], requests: any[]) {
    const tasks: any[] = [];

    // Tasks from deals
    deals.forEach(deal => {
        // Send estimate if calculated but not sent
        if (deal.stage === 'estimate_calculated' || deal.stage === 'leads') {
            tasks.push({
                type: 'send_estimate',
                priority: 'high',
                title: `Отправить КП: ${deal.client_name}`,
                dealId: deal.id,
                dueDate: 'сегодня'
            });
        }

        // Follow up on sent estimates
        if (deal.stage === 'estimate_sent') {
            const sentDaysAgo = Math.floor((Date.now() - new Date(deal.updated_at || deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
            if (sentDaysAgo >= 3) {
                tasks.push({
                    type: 'follow_up',
                    priority: 'medium',
                    title: `Связаться с ${deal.client_name}`,
                    dealId: deal.id,
                    dueDate: 'сегодня',
                    note: `КП отправлено ${sentDaysAgo} дней назад`
                });
            }
        }

        // Close hot deals
        if ((deal.probability || 0) >= 80 && deal.stage === 'negotiation') {
            tasks.push({
                type: 'close_deal',
                priority: 'high',
                title: `🔥 Закрыть сделку: ${deal.client_name}`,
                dealId: deal.id,
                dueDate: 'приоритет',
                note: `Вероятность ${deal.probability}%`
            });
        }
    });

    // Tasks from new requests
    requests.forEach(req => {
        if (req.status === 'new') {
            const hoursSinceCreated = (Date.now() - new Date(req.created_at).getTime()) / (1000 * 60 * 60);
            if (hoursSinceCreated < 24) {
                tasks.push({
                    type: 'process_request',
                    priority: hoursSinceCreated < 2 ? 'high' : 'medium',
                    title: `Обработать заявку: ${req.phone}`,
                    requestId: req.id,
                    dueDate: 'сегодня'
                });
            }
        }
    });

    return tasks.slice(0, 10); // Top 10 tasks
}

function analyzeConversion(deals: Deal[]) {
    if (deals.length === 0) return null;

    const completed = deals.filter(d => d.stage === 'completed' || d.closed_at);
    const conversionRate = (completed.length / deals.length) * 100;

    // Calculate trend (compare with previous period)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentDeals = deals.filter(d => new Date(d.created_at) > thirtyDaysAgo);
    const recentCompleted = recentDeals.filter(d => d.stage === 'completed');
    const recentConversion = recentDeals.length > 0 ? (recentCompleted.length / recentDeals.length) * 100 : 0;

    const trend = recentConversion - conversionRate;

    return {
        type: 'analytics',
        priority: 'info',
        title: 'Конверсия за месяц',
        description: `${recentConversion.toFixed(0)}% ${trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} ${Math.abs(trend).toFixed(0)}%`,
        data: {
            overall: conversionRate,
            recent: recentConversion,
            trend,
            completed: completed.length,
            total: deals.length
        },
        icon: trend > 0 ? '📈' : trend < 0 ? '📉' : '📊'
    };
}

function calculateForecast(deals: Deal[]) {
    const activeDeals = deals.filter(d => d.stage !== 'completed' && d.value);

    if (activeDeals.length === 0) return null;

    // Calculate weighted forecast based on probability
    const forecast = activeDeals.reduce((sum: number, deal: Deal) => {
        const probability = deal.probability || 50;
        return sum + (Number(deal.value) * probability / 100);
    }, 0);

    const optimistic = activeDeals.reduce((sum: number, deal: Deal) => sum + (deal.value || 0), 0);

    return {
        type: 'forecast',
        priority: 'info',
        title: 'Прогноз продаж',
        description: `Взвешенный прогноз: ${(forecast / 1000000).toFixed(1)}M ₽`,
        data: {
            weighted: forecast,
            optimistic: optimistic,
            deals: activeDeals.length,
            avgDealSize: optimistic / activeDeals.length
        },
        icon: '💰'
    };
}

/**
 * Get quick action recommendations for a specific deal
 */
export function getDealRecommendations(deal: Deal): any {
    const actions: any[] = [];

    const daysSinceUpdate = Math.floor((Date.now() - new Date(deal.updated_at || deal.created_at).getTime()) / (1000 * 60 * 60 * 24));

    // Stuck deal
    if (daysSinceUpdate > 7) {
        actions.push({
            type: 'urgent',
            text: `Сделка без движения ${daysSinceUpdate} дней - связаться срочно!`,
            action: 'contact_client',
            icon: '🚨'
        });
    }

    // High probability, long time in negotiation
    if (deal.stage === 'negotiation' && daysSinceUpdate > 3 && (deal.probability || 0) > 70) {
        actions.push({
            type: 'opportunity',
            text: 'Высокая вероятность закрытия - предложить финальную скидку',
            action: 'offer_discount',
            icon: '💎'
        });
    }

    // Low engagement
    if ((deal.probability || 0) < 30) {
        actions.push({
            type: 'warning',
            text: 'Низкий интерес - возможно, стоит переквалифицировать лид',
            action: 'requalify',
            icon: '⚠️'
        });
    }

    return actions;
}

/**
 * Generate daily digest for manager
 */
export function generateDailyDigest(deals: Deal[], requests: any[]): any {
    const insights = generateManagerInsights(deals, requests);

    const newRequests = requests.filter(r => {
        const created = new Date(r.created_at);
        const today = new Date();
        return created.toDateString() === today.toDateString();
    });

    const closedToday = deals.filter(d => {
        if (!d.closed_at) return false;
        const closed = new Date(d.closed_at);
        const today = new Date();
        return closed.toDateString() === today.toDateString();
    });

    return {
        date: new Date().toLocaleDateString('ru-RU'),
        summary: {
            newRequests: newRequests.length,
            closedDeals: closedToday.length,
            revenue: closedToday.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0),
            activeDeals: deals.filter(d => d.stage !== 'completed').length
        },
        insights,
        topPriorities: insights.filter(i => i.priority === 'high').slice(0, 3)
    };
}
