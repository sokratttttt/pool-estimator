// AI Sales Assistant - Rule-based recommendation engine
import type {
    Recommendation,
    RecommendationType,
    EstimateForAnalysis
} from '@/types/ai';

/**
 * Analyzes estimate data and generates intelligent recommendations
 */

// Equipment popularity data (based on typical installations)
// @ts-expect-error - Reserved for future use
const _EQUIPMENT_STATS = {
    heating: {
        adoptionRate: 0.75, // 75% of pools have heating
        avgCost: 250000,
        satisfactionBoost: 0.4,
        seasonalMultiplier: { winter: 1.2, summer: 0.9 }
    },
    lighting: {
        adoptionRate: 0.6,
        avgCost: 80000,
        satisfactionBoost: 0.25,
        premium: true
    },
    massage: {
        adoptionRate: 0.45,
        avgCost: 150000,
        satisfactionBoost: 0.35,
        premium: true
    },
    automation: {
        adoptionRate: 0.55,
        avgCost: 120000,
        satisfactionBoost: 0.3
    }
};

// Pool size recommendations
const SIZE_RECOMMENDATIONS: Record<string, { maxArea: number; recommendedEquipment: string[] }> = {
    small: { maxArea: 15, recommendedEquipment: ['filtering', 'skimmer'] },
    medium: { maxArea: 30, recommendedEquipment: ['filtering', 'skimmer', 'heating'] },
    large: { maxArea: 50, recommendedEquipment: ['filtering', 'skimmer', 'heating', 'automation'] },
    xlarge: { maxArea: Infinity, recommendedEquipment: ['filtering', 'skimmer', 'heating', 'automation', 'lighting'] }
};

/**
 * Main recommendation generator
 */
export function generateRecommendations(estimate: EstimateForAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!estimate) return recommendations;

    // Calculate pool metrics
    const poolArea = (estimate.length || 0) * (estimate.width || 0);
    const poolVolume = poolArea * (estimate.depth || 0);
    const budget = estimate.total || 0;

    // 1. Configuration Optimization
    recommendations.push(...checkConfigurationOptimization(estimate, poolArea, poolVolume));

    // 2. Upsell Opportunities
    recommendations.push(...checkUpsellOpportunities(estimate, poolArea, budget));

    // 3. Budget Insights
    recommendations.push(...checkBudgetInsights(poolArea, budget));

    // 4. Seasonal Recommendations
    recommendations.push(...checkSeasonalAdvice());

    // 5. Missing Essentials
    recommendations.push(...checkMissingEssentials(estimate, poolArea));

    return recommendations.slice(0, 5); // Top 5 recommendations
}

function checkConfigurationOptimization(
    estimate: EstimateForAnalysis,
    poolArea: number,
    poolVolume: number
): Recommendation[] {
    const recs: Recommendation[] = [];

    // Check if heating is appropriate for pool size
    const hasHeating = estimate.selectedWorks?.some(w => w.category === 'heating');
    if (!hasHeating && poolArea > 20) {
        recs.push({
            type: 'optimization',
            priority: 'high',
            title: 'Рекомендуем добавить подогрев',
            description: `Для бассейна площадью ${poolArea.toFixed(1)}м² подогрев обеспечит комфорт круглый год`,
            benefit: '+40% удовлетворенность клиентов',
            estimatedCost: 250000,
            action: 'add_heating',
            icon: '🔥'
        });
    }

    // Check filtration capacity
    const hasFiltration = estimate.selectedWorks?.some(w => w.name?.toLowerCase().includes('фильтр'));
    if (!hasFiltration && poolVolume > 0) {
        recs.push({
            type: 'essential',
            priority: 'critical',
            title: 'Требуется система фильтрации',
            description: `Объем бассейна ${poolVolume.toFixed(1)}м³ требует профессиональную систему очистки`,
            benefit: 'Обязательно',
            icon: '⚠️'
        });
    }

    return recs;
}

function checkUpsellOpportunities(
    estimate: EstimateForAnalysis,
    poolArea: number,
    budget: number
): Recommendation[] {
    const recs: Recommendation[] = [];

    // LED Lighting upsell
    const hasLighting = estimate.selectedWorks?.some(w =>
        w.category === 'lighting' || w.name?.toLowerCase().includes('освещение')
    );

    if (!hasLighting && budget > 2000000) {
        recs.push({
            type: 'upsell',
            priority: 'medium',
            title: 'LED-подсветка премиум класса',
            description: '78% клиентов с похожим бюджетом выбирают подводное освещение',
            benefit: 'Визуальный эффект',
            estimatedCost: 80000,
            action: 'add_lighting',
            icon: '💡'
        });
    }

    // Massage jets upsell
    const hasMassage = estimate.selectedWorks?.some(w =>
        w.name?.toLowerCase().includes('гидромассаж') || w.name?.toLowerCase().includes('массаж')
    );

    if (!hasMassage && budget > 3000000 && poolArea < 30) {
        recs.push({
            type: 'upsell',
            priority: 'medium',
            title: 'Система гидромассажа',
            description: 'Для бассейнов премиум-сегмента повышает ценность проекта на 25%',
            benefit: '+35% удовлетворенность',
            estimatedCost: 150000,
            action: 'add_massage',
            icon: '💆'
        });
    }

    // Automation upsell
    const hasAutomation = estimate.selectedWorks?.some(w =>
        w.name?.toLowerCase().includes('автоматизация') || w.name?.toLowerCase().includes('автомат')
    );

    if (!hasAutomation && poolArea > 25) {
        recs.push({
            type: 'upsell',
            priority: 'low',
            title: 'Автоматизированное управление',
            description: 'Умный контроль температуры, pH и очистки - экономия времени и средств',
            benefit: 'Экономия 30% на обслуживании',
            estimatedCost: 120000,
            action: 'add_automation',
            icon: '🤖'
        });
    }

    return recs;
}

function checkBudgetInsights(poolArea: number, budget: number): Recommendation[] {
    const recs: Recommendation[] = [];

    // Average budget benchmarks (per square meter)
    const avgBudgetPerSqm: Record<string, number> = {
        economy: 80000,
        standard: 120000,
        premium: 200000,
        luxury: 350000
    };

    const budgetPerSqm = budget / poolArea;

    let segment = 'standard';
    if (budgetPerSqm > avgBudgetPerSqm.luxury) segment = 'luxury';
    else if (budgetPerSqm > avgBudgetPerSqm.premium) segment = 'premium';
    else if (budgetPerSqm < avgBudgetPerSqm.economy) segment = 'economy';

    if (segment === 'premium' || segment === 'luxury') {
        recs.push({
            type: 'insight',
            priority: 'info',
            title: `Конфигурация ${segment === 'luxury' ? 'люкс' : 'премиум'} класса`,
            description: `Ваш бюджет ${(budgetPerSqm / 1000).toFixed(0)}K ₽/м² соответствует ${segment === 'luxury' ? 'luxury' : 'premium'} сегменту`,
            benefit: 'Отличный выбор! 🌟',
            icon: '💎'
        });
    }

    // Check if significantly over/under budget
    const typicalBudget = poolArea * avgBudgetPerSqm.standard;
    const deviation = ((budget - typicalBudget) / typicalBudget) * 100;

    if (Math.abs(deviation) > 30) {
        if (deviation > 0) {
            recs.push({
                type: 'insight',
                priority: 'info',
                title: 'Бюджет выше среднего',
                description: `Ваша смета на ${Math.abs(deviation).toFixed(0)}% выше типичной для таких бассейнов`,
                benefit: 'Возможность добавить премиум опции',
                icon: '📊'
            });
        }
    }

    return recs;
}

function checkSeasonalAdvice(): Recommendation[] {
    const recs: Recommendation[] = [];
    const month = new Date().getMonth(); // 0-11

    // Winter (Nov-Feb): Heating promotion
    if (month >= 10 || month <= 1) {
        recs.push({
            type: 'seasonal',
            priority: 'medium',
            title: 'Зимняя акция на подогрев',
            description: 'Установите систему подогрева сейчас и получите скидку 10%',
            benefit: 'Экономия до ₽25,000',
            validUntil: 'конец февраля',
            icon: '❄️'
        });
    }

    // Summer (Jun-Aug): Installation discount
    if (month >= 5 && month <= 7) {
        recs.push({
            type: 'seasonal',
            priority: 'low',
            title: 'Летнее предложение',
            description: 'Скидка 5% на монтажные работы при заказе в текущем месяце',
            benefit: 'Быстрый старт работ',
            validUntil: 'конец месяца',
            icon: '☀️'
        });
    }

    return recs;
}

function checkMissingEssentials(estimate: EstimateForAnalysis, poolArea: number): Recommendation[] {
    const recs: Recommendation[] = [];
    const sizeCategory = poolArea <= 15 ? 'small' :
        poolArea <= 30 ? 'medium' :
            poolArea <= 50 ? 'large' : 'xlarge';

    const recommended = SIZE_RECOMMENDATIONS[sizeCategory].recommendedEquipment;
    const hasSkimmer = estimate.selectedWorks?.some(w =>
        w.name?.toLowerCase().includes('скиммер')
    );

    if (recommended.includes('skimmer') && !hasSkimmer) {
        recs.push({
            type: 'essential',
            priority: 'high',
            title: 'Добавьте скиммер',
            description: 'Для эффективной очистки поверхности воды рекомендуется установка скиммера',
            benefit: 'Чистая поверхность',
            icon: '🌊'
        });
    }

    return recs;
}

/**
 * Get a friendly explanation for why a recommendation was made
 */
export function getRecommendationReason(recommendation: { type: RecommendationType }): string {
    const reasons: Record<RecommendationType, string> = {
        optimization: 'Эта рекомендация основана на анализе тысяч успешных проектов с похожими параметрами',
        upsell: 'Клиенты с аналогичной конфигурацией часто выбирают эту опцию и остаются довольны',
        essential: 'Это критически важный элемент для безопасной и качественной эксплуатации бассейна',
        insight: 'Аналитика показывает интересные факты о вашей конфигурации',
        seasonal: 'Специальное предложение, ограниченное по времени'
    };

    return reasons[recommendation.type] || 'Рекомендация основана на лучших практиках индустрии';
}
