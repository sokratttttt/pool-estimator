// Photo Analysis - Manual annotations for pool site photos
// Future: Upgrade to YandexVision for automatic detection

/**
 * Analyze uploaded photo and extract pool site information
 * Phase 1: Manual annotations
 * Phase 2: Computer Vision integration
 */
export function analyzePhoto(photoData, annotations = null) {
    if (annotations) {
        return processManualAnnotations(photoData, annotations);
    }

    // Return structure for manual annotation
    return {
        needsAnnotation: true,
        photoUrl: photoData.url,
        suggestions: generateSmartSuggestions(photoData)
    };
}

function processManualAnnotations(photoData, annotations) {
    const analysis = {
        photoUrl: photoData.url,
        poolLocation: annotations.poolLocation,
        obstacles: annotations.obstacles || [],
        measurements: annotations.measurements || {},
        terrainType: annotations.terrainType || 'unknown',
        recommendations: []
    };

    // Generate recommendations based on annotations
    analysis.recommendations = generateRecommendations(analysis);

    // Calculate estimated costs for complications
    analysis.additionalCosts = calculateAdditionalCosts(analysis);

    return analysis;
}

function generateSmartSuggestions(photoData) {
    // Basic image analysis without CV
    // Color analysis can suggest terrain type
    return {
        suggestedTerrainType: 'flat', // Default
        tips: [
            'Отметьте желаемое расположение бассейна',
            'Укажите препятствия (деревья, постройки)',
            'Добавьте примерные размеры участка'
        ]
    };
}

function generateRecommendations(analysis) {
    const recommendations = [];

    // Check for obstacles
    if (analysis.obstacles.length > 0) {
        const trees = analysis.obstacles.filter(o => o.type === 'tree');
        const buildings = analysis.obstacles.filter(o => o.type === 'building');

        if (trees.length > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Деревья рядом с бассейном',
                description: `Обнаружено ${trees.length} дерев(о/ьев). Рекомендуем расстояние минимум 3м от бассейна.`,
                impact: 'Листва может загрязнять воду. Корни могут повредить конструкцию.',
                action: 'Возможно потребуется вырубка или корректировать расположение.'
            });
        }

        if (buildings.length > 0) {
            recommendations.push({
                type: 'info',
                title: 'Близость построек',
                description: `Рядом находится ${buildings.length} постройк(а/и).`,
                impact: 'Может затруднить подъезд техники.',
                action: 'Проверьте доступ для экскаватора и других машин.'
            });
        }
    }

    // Terrain recommendations
    if (analysis.terrainType === 'slope') {
        recommendations.push({
            type: 'warning',
            title: 'Участок с уклоном',
            description: 'На участке имеется заметный уклон.',
            impact: 'Потребуются дополнительные земляные работы для выравнивания.',
            action: 'Рекомендуем геодезическую съемку. Дополнительная стоимость: от 150,000₽'
        });
    }

    if (analysis.terrainType === 'rocky') {
        recommendations.push({
            type: 'warning',
            title: 'Каменистый грунт',
            description: 'Обнаружен каменистый или скальный грунт.',
            impact: 'Потребуется специальная техника для бурения.',
            action: 'Дополнительная стоимость: от 200,000₽'
        });
    }

    // Access recommendations
    if (analysis.measurements.accessWidth && analysis.measurements.accessWidth < 3) {
        recommendations.push({
            type: 'alert',
            title: 'Узкий проезд',
            description: `Ширина проезда ${analysis.measurements.accessWidth}м.`,
            impact: 'Затруднен заезд крупной техники.',
            action: 'Возможно потребуется ручная выемка грунта. Дополнительно: от 100,000₽'
        });
    }

    // Good conditions
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'success',
            title: 'Отличные условия',
            description: 'Участок подходит для строительства без дополнительных сложностей.',
            impact: 'Стандартные сроки и стоимость работ.',
            action: 'Можно приступать к детальному проектированию.'
        });
    }

    return recommendations;
}

function calculateAdditionalCosts(analysis) {
    let additionalCost = 0;
    const breakdown = [];

    // Terrain complications
    if (analysis.terrainType === 'slope') {
        additionalCost += 150000;
        breakdown.push({ reason: 'Выравнивание участка', cost: 150000 });
    }

    if (analysis.terrainType === 'rocky') {
        additionalCost += 200000;
        breakdown.push({ reason: 'Работы со скальным грунтом', cost: 200000 });
    }

    // Obstacles
    const trees = analysis.obstacles.filter(o => o.type === 'tree');
    if (trees.length > 0) {
        const treeCost = trees.length * 15000;
        additionalCost += treeCost;
        breakdown.push({ reason: `Вырубка деревьев (${trees.length}шт)`, cost: treeCost });
    }

    // Access issues
    if (analysis.measurements.accessWidth && analysis.measurements.accessWidth < 3) {
        additionalCost += 100000;
        breakdown.push({ reason: 'Ручная выемка грунта', cost: 100000 });
    }

    return {
        total: additionalCost,
        breakdown
    };
}

/**
 * Generate measurement grid overlay for photo
 */
export function generateMeasurementGrid(photoData, realDimensions) {
    // Calculate pixels per meter
    const pixelsPerMeter = photoData.width / realDimensions.width;

    return {
        pixelsPerMeter,
        gridSpacing: Math.round(pixelsPerMeter), // 1m grid
        overlay: {
            horizontal: Math.ceil(photoData.height / pixelsPerMeter),
            vertical: Math.ceil(photoData.width / pixelsPerMeter)
        }
    };
}

/**
 * Validate pool placement
 */
export function validatePoolPlacement(analysis, poolDimensions) {
    const issues = [];

    // Check distance from obstacles
    analysis.obstacles.forEach(obstacle => {
        const distance = calculateDistance(
            analysis.poolLocation,
            obstacle.location
        );

        const minDistance = obstacle.type === 'tree' ? 3 : 1.5;

        if (distance < minDistance) {
            issues.push({
                type: 'error',
                message: `Слишком близко к ${obstacle.type === 'tree' ? 'дереву' : 'препятствию'}: ${distance.toFixed(1)}м (минимум ${minDistance}м)`
            });
        }
    });

    // Check site boundaries
    if (analysis.measurements.siteWidth) {
        const requiredWidth = poolDimensions.width + 3; // 1.5m each side
        if (requiredWidth > analysis.measurements.siteWidth) {
            issues.push({
                type: 'error',
                message: `Недостаточная ширина участка. Требуется: ${requiredWidth}м, доступно: ${analysis.measurements.siteWidth}м`
            });
        }
    }

    return {
        valid: issues.filter(i => i.type === 'error').length === 0,
        issues
    };
}

function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Export analysis as PDF report
 */
export function generateAnalysisReport(analysis, poolConfig) {
    return {
        title: 'Анализ участка для строительства бассейна',
        sections: [
            {
                title: 'Характеристики участка',
                content: [
                    `Тип грунта: ${analysis.terrainType}`,
                    `Препятствия: ${analysis.obstacles.length}`,
                    `Измерения: ${JSON.stringify(analysis.measurements)}`
                ]
            },
            {
                title: 'Рекомендации',
                content: analysis.recommendations.map(r => r.description)
            },
            {
                title: 'Дополнительные расходы',
                content: analysis.additionalCosts.breakdown.map(
                    b => `${b.reason}: ${b.cost.toLocaleString('ru-RU')} ₽`
                )
            },
            {
                title: 'Общая стоимость дополнительных работ',
                content: [`${analysis.additionalCosts.total.toLocaleString('ru-RU')} ₽`]
            }
        ]
    };
}
