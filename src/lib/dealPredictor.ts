// Deal Probability Predictor
// ML-like scoring system based on multiple factors
import { Deal } from '@/types';
import {
    PredictionInput,
    PredictionFactors,
    ScoreCategory,
    DealRecommendation,
    PredictionResult,
    ScoredDeal,
    DealInsights
} from '@/types/ai';

/**
 * Calculate probability score for a deal/request
 * Returns score 0-100 and detailed factors
 */
export function calculateDealProbability(request: PredictionInput): PredictionResult {
    const factors: PredictionFactors = {};
    let totalScore = 0;

    // 1. Response Time Score (0-25 points)
    if (request.created_at) {
        const hoursSinceCreated = (Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreated < 2) {
            factors.responseTime = 25; // Immediate response
        } else if (hoursSinceCreated < 24) {
            factors.responseTime = 20; // Same day
        } else if (hoursSinceCreated < 72) {
            factors.responseTime = 15; // Within 3 days
        } else if (hoursSinceCreated < 168) {
            factors.responseTime = 10; // Within week
        } else {
            factors.responseTime = 5; // Cold lead
        }
        totalScore += factors.responseTime;
    }

    // 2. Budget Realism Score (0-20 points)
    // Parse estimated budget from notes or size
    const sizeMatch = (request.size || request.pool_size)?.match(/(\d+)x(\d+)/);
    if (sizeMatch) {
        const area = parseInt(sizeMatch[1]) * parseInt(sizeMatch[2]);
        const estimatedBudget = area * 100000; // ~100K per sqm rough estimate

        // Check if mentioned budget is realistic
        const budgetMention = request.notes?.match(/(\d+)\s*(млн|тыс|к)/i);
        if (budgetMention) {
            const mentionedBudget = parseBudget(budgetMention[0]);
            const ratio = mentionedBudget / estimatedBudget;

            if (ratio > 0.8 && ratio < 1.5) {
                factors.budgetRealism = 20; // Realistic
            } else if (ratio > 0.5 && ratio < 2) {
                factors.budgetRealism = 12; // Acceptable
            } else {
                factors.budgetRealism = 5; // Unrealistic
            }
        } else {
            factors.budgetRealism = 10; // No budget mentioned
        }
        totalScore += factors.budgetRealism;
    }

    // 3. Engagement Score (0-25 points)
    const engagement = calculateEngagement(request);
    factors.engagement = engagement;
    totalScore += engagement;

    // 4. Season Score (0-15 points)
    const month = new Date().getMonth(); // 0-11
    if (month >= 2 && month <= 5) { // Mar-Jun
        factors.season = 15; // Peak season
    } else if (month >= 6 && month <= 8) { // Jul-Sep
        factors.season = 10; // Good season
    } else if (month >= 9 && month <= 10) { // Oct-Nov
        factors.season = 5; // Low season
    } else { // Dec-Feb
        factors.season = 3; // Off season
    }
    totalScore += factors.season;

    // 5. Source Score (0-15 points)
    if (request.notes?.toLowerCase().includes('рекоменд')) {
        factors.source = 15; // Referral
    } else if (request.notes?.toLowerCase().includes('сайт')) {
        factors.source = 10; // Website
    } else if (request.notes?.toLowerCase().includes('звонок')) {
        factors.source = 12; // Phone call
    } else {
        factors.source = 7; // Unknown
    }
    totalScore += factors.source;

    return {
        score: Math.min(100, totalScore),
        factors,
        category: categorizeScore(totalScore),
        recommendations: generateRecommendations(totalScore, factors)
    };
}

function calculateEngagement(request: PredictionInput): number {
    let score = 0;

    // Has detailed notes
    if (request.notes && request.notes.length > 50) {
        score += 10;
    } else if (request.notes && request.notes.length > 20) {
        score += 5;
    }

    // Has complete contact info
    if (request.phone || request.client_phone) score += 5;
    if (request.client_email) score += 5;

    // Specific requirements mentioned
    if (request.size || request.pool_size) score += 3;
    if (request.type || request.pool_type) score += 2;

    return Math.min(25, score);
}

function parseBudget(budgetStr: string): number {
    const match = budgetStr.match(/\d+\.?\d*/);
    if (!match) return 0;
    const num = parseFloat(match[0]);
    if (budgetStr.includes('млн')) return num * 1000000;
    if (budgetStr.includes('тыс') || budgetStr.includes('к')) return num * 1000;
    return num;
}

function categorizeScore(score: number): ScoreCategory {
    if (score >= 80) return { label: 'Горячий лид', emoji: '🔥', color: 'red' };
    if (score >= 60) return { label: 'Теплый лид', emoji: '⭐', color: 'orange' };
    if (score >= 40) return { label: 'Перспективный', emoji: '👍', color: 'yellow' };
    return { label: 'Холодный лид', emoji: '🧊', color: 'blue' };
}

function generateRecommendations(score: number, factors: PredictionFactors): DealRecommendation[] {
    const recommendations: DealRecommendation[] = [];

    if ((factors.responseTime || 0) < 15) {
        recommendations.push({
            type: 'urgent',
            text: 'Связаться как можно скорее - лид теряет актуальность',
            action: 'call_now'
        });
    }

    if ((factors.budgetRealism || 0) < 10) {
        recommendations.push({
            type: 'info',
            text: 'Обсудить бюджет и скорректировать ожидания',
            action: 'discuss_budget'
        });
    }

    if ((factors.engagement || 0) < 15) {
        recommendations.push({
            type: 'action',
            text: 'Запросить дополнительную информацию для лучшего понимания потребностей',
            action: 'request_details'
        });
    }

    if (score >= 70) {
        recommendations.push({
            type: 'success',
            text: 'Отличный лид! Подготовить детальное КП и назначить встречу',
            action: 'prepare_proposal'
        });
    }

    return recommendations;
}

/**
 * Batch score all deals/requests
 */
export function scoreAllDeals(deals: Deal[]): ScoredDeal[] {
    return deals.map(deal => ({
        ...deal,
        probabilityData: calculateDealProbability(deal as PredictionInput)
    })).sort((a, b) => b.probabilityData.score - a.probabilityData.score);
}

/**
 * Get insights from scored deals
 */
export function getDealInsights(scoredDeals: ScoredDeal[]): DealInsights {
    const hot = scoredDeals.filter(d => d.probabilityData.score >= 80);
    const warm = scoredDeals.filter(d => d.probabilityData.score >= 60 && d.probabilityData.score < 80);
    const cold = scoredDeals.filter(d => d.probabilityData.score < 40);

    const avgScore = scoredDeals.length > 0
        ? scoredDeals.reduce((sum, d) => sum + d.probabilityData.score, 0) / scoredDeals.length
        : 0;

    return {
        summary: {
            total: scoredDeals.length,
            hot: hot.length,
            warm: warm.length,
            cold: cold.length,
            avgScore: Math.round(avgScore)
        },
        topDeals: scoredDeals.slice(0, 5),
        urgentActions: scoredDeals
            .filter(d => d.probabilityData.recommendations.some(r => r.type === 'urgent'))
            .slice(0, 3)
    };
}
