// Smart Description Generator
// Template-based system for generating compelling sales descriptions

const POOL_SIZE_CATEGORIES = {
    intimate: { maxArea: 15, label: 'уютный', adjective: 'компактный' },
    family: { maxArea: 35, label: 'семейный', adjective: 'просторный' },
    sport: { maxArea: 60, label: 'спортивный', adjective: 'профессиональный' },
    luxury: { maxArea: Infinity, label: 'роскошный', adjective: 'впечатляющий' }
};

const TEMPLATES = {
    family_premium: `{adjective} {label} бассейн площадью {area}м² — это идеальное решение для вашей семьи. {features_intro}

✨ Что делает этот проект особенным:
{features_list}

{season_benefit}

Размеры {size} идеально подходят для {pool_use}. {heating_note} {lighting_note}

💎 Премиум-конфигурация включает только проверенное оборудование ведущих производителей.

{closing}`,

    family_standard: `Классический {label} бассейн {size} — проверенное временем решение для загородного дома. {features_intro}

Что входит в проект:
{features_list}

{season_benefit}

{heating_note} {lighting_note}

{closing}`,

    sport_premium: `{adjective} спортивный бассейн размером {size} — для тех, кто серьезно относится к плаванию. {features_intro}

Профессиональные характеристики:
{features_list}

Длина {length}м позволяет комфортно тренироваться, выполнять повороты и отрабатывать технику.

{heating_note} Профессиональная система фильтрации обеспечивает кристальную чистоту воды.

{closing}`,

    luxury_any: `{adjective} проект класса люкс — воплощение роскоши и технологий. Бассейн {size} станет жемчужиной вашего участка.

🌟 Премиальные решения:
{features_list}

{season_benefit}

Каждая деталь продумана до мелочей. {heating_note} {lighting_note}

Это не просто бассейн — это инвестиция в качество жизни и здоровье семьи.

{closing}`
};

const FEATURE_DESCRIPTIONS = {
    heating: {
        short: 'Современная система подогрева позволит наслаждаться плаванием круглый год.',
        detail: 'Энергоэффективная система подогрева поддерживает комфортную температуру воды 24-30°C в любое время года.'
    },
    lighting: {
        short: 'Атмосферное LED-освещение создаст незабываемую вечернюю атмосферу.',
        detail: 'Современная подводная LED-подсветка с возможностью смены цветов превращает вечернее купание в волшебное шоу.'
    },
    massage: {
        short: 'Система гидромассажа для релаксации после рабочего дня.',
        detail: 'Профессиональная система гидромассажа с регулируемыми форсунками обеспечит максимальное расслабление.'
    },
    automation: {
        short: 'Умная автоматизация управляет всеми системами бассейна.',
        detail: 'Интеллектуальная система управления автоматически поддерживает оптимальные параметры воды и экономит ваше время.'
    },
    filtration: {
        short: 'Профессиональная система очистки воды.',
        detail: 'Многоступенчатая система фильтрации обеспечивает идеальную чистоту воды без применения химии.'
    }
};

const SEASON_BENEFITS = {
    spring: 'Весна — идеальное время для начала строительства. Бассейн будет готов к лету!',
    summer: 'Летний сезон в разгаре — самое время задуматься о собственном бассейне для следующего года.',
    autumn: 'Осень — отличное время для планирования. Избежите весенней загруженности подрядчиков.',
    winter: 'Зимнее время — возможность спокойно спроектировать и подготовиться к весеннему старту работ.'
};

const POOL_USE_CASES = {
    intimate: 'романтичных вечеров и утренних заплывов',
    family: 'семейного отдыха, детских игр и взрослого плавания',
    sport: 'серьезных тренировок и поддержания спортивной формы',
    luxury: 'приема гостей, вечеринок у бассейна и ежедневного релакса'
};

/**
 * Generate compelling description based on estimate data
 */
export function generatePoolDescription(estimate) {
    const config = analyzeEstimate(estimate);
    const template = selectTemplate(config);

    return fillTemplate(template, config);
}

function analyzeEstimate(estimate) {
    const area = (estimate.length || 0) * (estimate.width || 0);
    const sizeCategory = Object.entries(POOL_SIZE_CATEGORIES)
        .find(([_, cat]) => area <= cat.maxArea)?.[0] || 'luxury';

    const segment = determinePriceSegment(estimate.total);
    const features = extractFeatures(estimate);
    const season = getCurrentSeason();

    return {
        area,
        size: `${estimate.length}x${estimate.width}м`,
        length: estimate.length,
        width: estimate.width,
        depth: estimate.depth,
        sizeCategory,
        segment,
        features,
        season,
        total: estimate.total,
        poolUse: POOL_USE_CASES[sizeCategory],
        ...POOL_SIZE_CATEGORIES[sizeCategory]
    };
}

function determinePriceSegment(total) {
    if (!total) return 'standard';
    if (total > 8000000) return 'luxury';
    if (total > 4000000) return 'premium';
    if (total > 2000000) return 'standard';
    return 'economy';
}

function extractFeatures(estimate) {
    const features = [];
    const works = estimate.selectedWorks || [];

    if (works.some(w => w.category === 'heating' || w.name?.includes('одогрев'))) {
        features.push('heating');
    }
    if (works.some(w => w.name?.toLowerCase().includes('освещ') || w.name?.toLowerCase().includes('подсветк'))) {
        features.push('lighting');
    }
    if (works.some(w => w.name?.toLowerCase().includes('массаж'))) {
        features.push('massage');
    }
    if (works.some(w => w.name?.toLowerCase().includes('автомат'))) {
        features.push('automation');
    }
    if (works.some(w => w.name?.toLowerCase().includes('фильтр'))) {
        features.push('filtration');
    }

    return features;
}

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

function selectTemplate(config) {
    const key = `${config.sizeCategory}_${config.segment}`;

    // Check for exact match
    if (TEMPLATES[key]) return TEMPLATES[key];

    // Fallback templates
    if (config.segment === 'luxury') return TEMPLATES.luxury_any;
    if (config.sizeCategory === 'sport') return TEMPLATES.sport_premium;
    if (config.segment === 'premium') return TEMPLATES.family_premium;
    return TEMPLATES.family_standard;
}

function fillTemplate(template, config) {
    let description = template;

    // Basic replacements
    description = description.replace(/{adjective}/g, config.adjective);
    description = description.replace(/{label}/g, config.label);
    description = description.replace(/{size}/g, config.size);
    description = description.replace(/{area}/g, config.area.toFixed(0));
    description = description.replace(/{length}/g, config.length);
    description = description.replace(/{pool_use}/g, config.poolUse);

    // Features intro
    const featuresIntro = config.features.length > 0
        ? `Этот проект включает ${config.features.length} современных систем для максимального комфорта.`
        : 'Базовая комплектация включает все необходимое для комфортного использования.';
    description = description.replace(/{features_intro}/g, featuresIntro);

    // Features list
    const featuresList = config.features
        .map(f => `• ${FEATURE_DESCRIPTIONS[f]?.detail || FEATURE_DESCRIPTIONS[f]?.short}`)
        .join('\n');
    description = description.replace(/{features_list}/g, featuresList || '• Качественная система фильтрации\n• Надежное оборудование');

    // Individual feature notes
    description = description.replace(/{heating_note}/g,
        config.features.includes('heating') ? FEATURE_DESCRIPTIONS.heating.short : '');
    description = description.replace(/{lighting_note}/g,
        config.features.includes('lighting') ? FEATURE_DESCRIPTIONS.lighting.short : '');

    // Season benefit
    description = description.replace(/{season_benefit}/g, SEASON_BENEFITS[config.season]);

    // Closing
    const closing = config.total
        ? `💰 Стоимость проекта: ${(config.total / 1000000).toFixed(1)} млн ₽\n\nГотовы обсудить детали? Свяжитесь с нами для персонализированной консультации!`
        : 'Готовы обсудить детали? Свяжитесь с нами для точного расчета!';
    description = description.replace(/{closing}/g, closing);

    return description.trim();
}

/**
 * Generate short version for WhatsApp/SMS
 */
export function generateShortDescription(estimate) {
    const config = analyzeEstimate(estimate);

    const featuresText = config.features.length > 0
        ? config.features.map(f => FEATURE_DESCRIPTIONS[f].short).join(' ')
        : '';

    return `🏊 ${config.adjective} ${config.label} бассейн ${config.size}
${featuresText}
💰 ${(config.total / 1000000).toFixed(1)} млн ₽`.trim();
}

/**
 * Get description variations for A/B testing
 */
export function generateVariations(estimate) {
    return {
        formal: generatePoolDescription(estimate),
        casual: generateCasualDescription(estimate),
        technical: generateTechnicalDescription(estimate),
        short: generateShortDescription(estimate)
    };
}

function generateCasualDescription(estimate) {
    const config = analyzeEstimate(estimate);
    return `Представьте: ${config.label} бассейн ${config.size} прямо у вас на участке! 🏊‍♂️

${config.features.length > 0 ? 'Со всеми фишками:\n' + config.features.map(f => `✓ ${FEATURE_DESCRIPTIONS[f].short}`).join('\n') : ''}

${SEASON_BENEFITS[config.season]}

Стоимость: ${(config.total / 1000000).toFixed(1)} млн ₽

Хотите так же? Давайте обсудим! 😊`;
}

function generateTechnicalDescription(estimate) {
    const config = analyzeEstimate(estimate);
    return `Технические характеристики бассейна:

Размеры: ${config.size} (площадь ${config.area.toFixed(1)}м²)
Глубина: ${config.depth}м
Категория: ${config.label}

Оборудование:
${config.features.map(f => `- ${FEATURE_DESCRIPTIONS[f].detail}`).join('\n')}

Стоимость под ключ: ${config.total?.toLocaleString('ru-RU')} ₽

Срок реализации: ${estimateTimeline(config.area)} недель`;
}

function estimateTimeline(area) {
    if (area < 20) return '4-6';
    if (area < 40) return '6-8';
    return '8-12';
}
