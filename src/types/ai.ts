// AI Types - Type definitions for AI-related functionality

// ============================================
// AI ASSISTANT TYPES
// ============================================

export type RecommendationType = 'optimization' | 'upsell' | 'essential' | 'insight' | 'seasonal';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type RecommendationAction =
    | 'add_heating'
    | 'add_lighting'
    | 'add_massage'
    | 'add_automation'
    | 'add_filtration';

export interface Recommendation {
    type: RecommendationType;
    priority: RecommendationPriority;
    title: string;
    description: string;
    benefit: string;
    estimatedCost?: number;
    action?: RecommendationAction;
    icon?: string;
    validUntil?: string;
}

export interface EstimateForAnalysis {
    length?: number;
    width?: number;
    depth?: number;
    total?: number;
    selectedWorks?: SelectedWork[];
}

export interface SelectedWork {
    category?: string;
    name?: string;
}

export interface PoolSizeCategory {
    maxArea: number;
    recommendedEquipment: string[];
}

export interface EquipmentStats {
    adoptionRate: number;
    avgCost: number;
    satisfactionBoost: number;
    premium?: boolean;
    seasonalMultiplier?: {
        winter: number;
        summer: number;
    };
}

// ============================================
// DEAL PREDICTOR TYPES  
// ============================================

export interface PredictionInput {
    created_at?: string;
    size?: string;
    pool_size?: string;
    notes?: string;
    phone?: string;
    client_phone?: string;
    client_email?: string;
    type?: string;
    pool_type?: string;
}

export interface PredictionFactors {
    responseTime?: number;
    budgetRealism?: number;
    engagement?: number;
    season?: number;
    source?: number;
}

export interface ScoreCategory {
    label: string;
    emoji: string;
    color: 'red' | 'orange' | 'yellow' | 'blue';
}

export interface DealRecommendation {
    type: 'urgent' | 'info' | 'action' | 'success';
    text: string;
    action: 'call_now' | 'discuss_budget' | 'request_details' | 'prepare_proposal';
}

export interface PredictionResult {
    score: number;
    factors: PredictionFactors;
    category: ScoreCategory;
    recommendations: DealRecommendation[];
}

export interface ScoredDeal {
    probabilityData: PredictionResult;
    [key: string]: unknown;
}

export interface DealInsights {
    summary: {
        total: number;
        hot: number;
        warm: number;
        cold: number;
        avgScore: number;
    };
    topDeals: ScoredDeal[];
    urgentActions: ScoredDeal[];
}

// ============================================
// PHOTO ANALYZER TYPES
// ============================================

export interface PhotoData {
    url: string;
    width: number;
    height: number;
}

export type ObstacleType = 'tree' | 'building';
export type TerrainType = 'flat' | 'slope' | 'rocky' | 'unknown';

export interface Obstacle {
    type: ObstacleType;
    location: Point2D;
}

export interface Point2D {
    x: number;
    y: number;
}

export interface PhotoAnnotations {
    poolLocation?: Point2D;
    obstacles?: Obstacle[];
    measurements?: SiteMeasurements;
    terrainType?: TerrainType;
}

export interface SiteMeasurements {
    accessWidth?: number;
    siteWidth?: number;
    siteLength?: number;
    [key: string]: number | undefined;
}

export interface PhotoRecommendation {
    type: 'warning' | 'info' | 'alert' | 'success';
    title: string;
    description: string;
    impact: string;
    action: string;
}

export interface CostBreakdownItem {
    reason: string;
    cost: number;
}

export interface AdditionalCosts {
    total: number;
    breakdown: CostBreakdownItem[];
}

export interface PhotoAnalysis {
    photoUrl: string;
    poolLocation: Point2D | undefined;
    obstacles: Obstacle[];
    measurements: SiteMeasurements;
    terrainType: TerrainType;
    recommendations: PhotoRecommendation[];
    additionalCosts: AdditionalCosts;
}

export interface AnnotationNeeded {
    needsAnnotation: true;
    photoUrl: string;
    suggestions: {
        suggestedTerrainType: TerrainType;
        tips: string[];
    };
}

export interface MeasurementGrid {
    pixelsPerMeter: number;
    gridSpacing: number;
    overlay: {
        horizontal: number;
        vertical: number;
    };
}

export interface PlacementValidationResult {
    valid: boolean;
    issues: PlacementIssue[];
}

export interface PlacementIssue {
    type: 'error' | 'warning';
    message: string;
}

export interface AnalysisReportSection {
    title: string;
    content: string[];
}

export interface AnalysisReport {
    title: string;
    sections: AnalysisReportSection[];
}
