/**
 * Предустановленные шаблоны бассейнов
 * Для быстрого создания типовых смет
 */

// ============================================
// TYPES
// ============================================

export type PoolType =
    | 'rectangular_skimmer'     // Прямоугольный скиммерный
    | 'rectangular_overflow'    // Прямоугольный переливной
    | 'oval_skimmer'           // Овальный скиммерный
    | 'oval_overflow'          // Овальный переливной
    | 'freeform'               // Произвольной формы
    | 'infinity'               // Бесконечный край
    | 'spa'                    // СПА
    | 'training'               // Тренировочный
    | 'children';              // Детский

export type PoolCategory = 'residential' | 'commercial' | 'premium';

export interface PoolDimensions {
    length: number;  // метры
    width: number;   // метры
    depth: number;   // метры
    depthShallow?: number; // для переменной глубины
    depthDeep?: number;    // для переменной глубины
}

export interface PoolMaterials {
    bowl: string;       // ID материала чаши
    finish: string;     // ID отделки
    coping?: string;    // ID бордюра
}

export interface PoolEquipment {
    filter: string;        // ID фильтра
    pump: string;          // ID насоса
    heater?: string;       // ID подогрева
    lights?: string;       // ID освещения
    cleaner?: string;      // ID пылесоса
    controller?: string;   // ID автоматики
}

export interface PoolWorks {
    excavation: boolean;      // Земляные работы
    concrete: boolean;        // Бетонные работы
    waterproofing: boolean;   // Гидроизоляция
    plumbing: boolean;        // Закладные и трубопровод
    electrical: boolean;      // Электрика
    finishing: boolean;       // Отделка
    landscaping: boolean;     // Благоустройство
}

export interface PoolParts {
    skimmers: number;         // Кол-во скиммеров
    returns: number;          // Форсунки возврата
    drains: number;           // Донные сливы
    lights: number;           // Подводные светильники
    ladders: number;          // Лестницы
    rails: number;            // Поручни
}

export interface TemplateRecommendations {
    suitableFor: string[];
    notSuitableFor: string[];
    averageCost: number;      // Средняя стоимость в рублях
    buildTime: number;        // Время строительства в днях
    maintenanceCost: number;  // Ежегодное обслуживание
}

export interface PoolTemplate {
    id: string;
    name: string;
    description: string;
    poolType: PoolType;
    category: PoolCategory;
    popular?: boolean;
    icon?: string;

    defaults: {
        dimensions: PoolDimensions;
        materials: PoolMaterials;
        equipment: PoolEquipment;
        works: PoolWorks;
        parts: PoolParts;
    };

    recommendations: TemplateRecommendations;

    /** Теги для поиска */
    tags: string[];
}

// ============================================
// TEMPLATE DATA
// ============================================

export const POOL_TEMPLATES: PoolTemplate[] = [
    // ==========================================
    // RESIDENTIAL - Частные бассейны
    // ==========================================
    {
        id: 'rect_6x3_skimmer',
        name: 'Прямоугольный 6×3 (скиммерный)',
        description: 'Стандартный прямоугольный бассейн для частного дома. Оптимальный размер для семьи из 4-5 человек.',
        poolType: 'rectangular_skimmer',
        category: 'residential',
        popular: true,
        icon: '🏊',
        defaults: {
            dimensions: {
                length: 6,
                width: 3,
                depth: 1.5
            },
            materials: {
                bowl: 'concrete_monolithic',
                finish: 'pvc_liner_blue',
                coping: 'concrete_coping'
            },
            equipment: {
                filter: 'filter_sand_500',
                pump: 'pump_0.75kw',
                heater: 'heat_exchanger_13kw',
                lights: 'led_white_12v'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: true,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: false
            },
            parts: {
                skimmers: 1,
                returns: 2,
                drains: 1,
                lights: 2,
                ladders: 1,
                rails: 0
            }
        },
        recommendations: {
            suitableFor: ['Частные дома', 'Дачи', 'Небольшие участки', 'Семья 3-5 человек'],
            notSuitableFor: ['Коммерческие объекты', 'Спортивное плавание'],
            averageCost: 850000,
            buildTime: 25,
            maintenanceCost: 45000
        },
        tags: ['стандарт', 'семейный', 'экономичный', 'популярный']
    },

    {
        id: 'rect_8x4_skimmer',
        name: 'Прямоугольный 8×4 (скиммерный)',
        description: 'Увеличенный прямоугольный бассейн для комфортного плавания. Подходит для участков от 10 соток.',
        poolType: 'rectangular_skimmer',
        category: 'residential',
        popular: true,
        icon: '🏊‍♂️',
        defaults: {
            dimensions: {
                length: 8,
                width: 4,
                depth: 1.5,
                depthShallow: 1.2,
                depthDeep: 1.8
            },
            materials: {
                bowl: 'concrete_monolithic',
                finish: 'pvc_liner_blue',
                coping: 'natural_stone'
            },
            equipment: {
                filter: 'filter_sand_600',
                pump: 'pump_1.1kw',
                heater: 'heat_exchanger_20kw',
                lights: 'led_color_12v',
                cleaner: 'robotic_cleaner'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: true,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: true
            },
            parts: {
                skimmers: 2,
                returns: 4,
                drains: 2,
                lights: 4,
                ladders: 1,
                rails: 2
            }
        },
        recommendations: {
            suitableFor: ['Большие участки', 'Семья 5+ человек', 'Активное плавание'],
            notSuitableFor: ['Маленькие участки', 'Ограниченный бюджет'],
            averageCost: 1450000,
            buildTime: 35,
            maintenanceCost: 65000
        },
        tags: ['комфорт', 'большой', 'переменная глубина']
    },

    {
        id: 'rect_10x5_overflow',
        name: 'Прямоугольный 10×5 (переливной)',
        description: 'Просторный переливной бассейн премиум-класса. Идеально для загородных резиденций.',
        poolType: 'rectangular_overflow',
        category: 'premium',
        icon: '✨',
        defaults: {
            dimensions: {
                length: 10,
                width: 5,
                depth: 1.6,
                depthShallow: 1.2,
                depthDeep: 2.0
            },
            materials: {
                bowl: 'concrete_monolithic',
                finish: 'mosaic_glass',
                coping: 'granite'
            },
            equipment: {
                filter: 'filter_sand_800',
                pump: 'pump_1.5kw_variable',
                heater: 'heat_pump_15kw',
                lights: 'led_color_24v',
                cleaner: 'robotic_cleaner_premium',
                controller: 'automation_full'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: true,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: true
            },
            parts: {
                skimmers: 0,
                returns: 6,
                drains: 2,
                lights: 6,
                ladders: 2,
                rails: 4
            }
        },
        recommendations: {
            suitableFor: ['Загородные резиденции', 'Премиум сегмент', 'Ландшафтный дизайн'],
            notSuitableFor: ['Ограниченный бюджет', 'Маленькие участки'],
            averageCost: 3500000,
            buildTime: 60,
            maintenanceCost: 120000
        },
        tags: ['премиум', 'переливной', 'мозаика', 'автоматика']
    },

    {
        id: 'children_4x2',
        name: 'Детский бассейн 4×2',
        description: 'Безопасный мелководный бассейн для детей. Глубина до 0.8м.',
        poolType: 'children',
        category: 'residential',
        icon: '👶',
        defaults: {
            dimensions: {
                length: 4,
                width: 2,
                depth: 0.6,
                depthShallow: 0.4,
                depthDeep: 0.8
            },
            materials: {
                bowl: 'polypropylene',
                finish: 'polypropylene_blue',
                coping: 'rubber_safety'
            },
            equipment: {
                filter: 'filter_cartridge_large',
                pump: 'pump_0.5kw',
                heater: 'solar_heating'
            },
            works: {
                excavation: true,
                concrete: false,
                waterproofing: false,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: false
            },
            parts: {
                skimmers: 1,
                returns: 2,
                drains: 1,
                lights: 2,
                ladders: 1,
                rails: 2
            }
        },
        recommendations: {
            suitableFor: ['Семьи с маленькими детьми', 'Дополнение к основному бассейну'],
            notSuitableFor: ['Взрослое плавание', 'Ныряние'],
            averageCost: 350000,
            buildTime: 14,
            maintenanceCost: 25000
        },
        tags: ['детский', 'безопасный', 'мелкий', 'полипропилен']
    },

    {
        id: 'spa_3x3',
        name: 'СПА-бассейн 3×3',
        description: 'Компактный гидромассажный СПА-бассейн с подогревом. Идеален для релакса.',
        poolType: 'spa',
        category: 'residential',
        icon: '🧖',
        defaults: {
            dimensions: {
                length: 3,
                width: 3,
                depth: 1.2
            },
            materials: {
                bowl: 'acrylic_spa',
                finish: 'acrylic_pearl',
                coping: 'composite_decking'
            },
            equipment: {
                filter: 'filter_cartridge_spa',
                pump: 'pump_spa_jets',
                heater: 'electric_heater_9kw',
                controller: 'spa_controller'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: false,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: false
            },
            parts: {
                skimmers: 1,
                returns: 0,
                drains: 1,
                lights: 4,
                ladders: 0,
                rails: 2
            }
        },
        recommendations: {
            suitableFor: ['Релакс', 'Гидромассаж', 'Небольшие участки', 'Всесезонное использование'],
            notSuitableFor: ['Плавание', 'Большие компании'],
            averageCost: 650000,
            buildTime: 10,
            maintenanceCost: 35000
        },
        tags: ['спа', 'гидромассаж', 'компактный', 'подогрев']
    },

    // ==========================================
    // COMMERCIAL - Коммерческие бассейны
    // ==========================================
    {
        id: 'training_25x10',
        name: 'Тренировочный 25×10',
        description: 'Полупрофессиональный бассейн для спортивных школ и фитнес-центров.',
        poolType: 'training',
        category: 'commercial',
        icon: '🏅',
        defaults: {
            dimensions: {
                length: 25,
                width: 10,
                depth: 1.8,
                depthShallow: 1.4,
                depthDeep: 2.2
            },
            materials: {
                bowl: 'concrete_reinforced',
                finish: 'ceramic_tiles',
                coping: 'anti_slip_tiles'
            },
            equipment: {
                filter: 'filter_sand_commercial',
                pump: 'pump_commercial_5kw',
                heater: 'heat_pump_30kw',
                lights: 'led_commercial',
                controller: 'automation_commercial'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: true,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: true
            },
            parts: {
                skimmers: 4,
                returns: 12,
                drains: 4,
                lights: 12,
                ladders: 4,
                rails: 8
            }
        },
        recommendations: {
            suitableFor: ['Спортивные школы', 'Фитнес-центры', 'Гостиницы'],
            notSuitableFor: ['Частные дома', 'Маленькие бюджеты'],
            averageCost: 12000000,
            buildTime: 120,
            maintenanceCost: 450000
        },
        tags: ['коммерческий', 'спортивный', 'тренировочный', '25м']
    },

    {
        id: 'hotel_12x6_overflow',
        name: 'Гостиничный 12×6 (переливной)',
        description: 'Элегантный переливной бассейн для отелей и загородных комплексов.',
        poolType: 'rectangular_overflow',
        category: 'commercial',
        icon: '🏨',
        defaults: {
            dimensions: {
                length: 12,
                width: 6,
                depth: 1.5
            },
            materials: {
                bowl: 'concrete_monolithic',
                finish: 'mosaic_glass_premium',
                coping: 'marble'
            },
            equipment: {
                filter: 'filter_glass_media',
                pump: 'pump_2.2kw_variable',
                heater: 'heat_pump_25kw',
                lights: 'led_color_24v',
                cleaner: 'robotic_commercial',
                controller: 'automation_full'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: true,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: true
            },
            parts: {
                skimmers: 0,
                returns: 8,
                drains: 2,
                lights: 8,
                ladders: 2,
                rails: 4
            }
        },
        recommendations: {
            suitableFor: ['Отели', 'Загородные комплексы', 'SPA-центры'],
            notSuitableFor: ['Частное использование'],
            averageCost: 5500000,
            buildTime: 75,
            maintenanceCost: 180000
        },
        tags: ['гостиничный', 'переливной', 'мрамор', 'премиум']
    },

    // ==========================================
    // PREMIUM - Премиальные решения
    // ==========================================
    {
        id: 'infinity_12x4',
        name: 'Infinity Edge 12×4',
        description: 'Бассейн с бесконечным краем. Эффектное решение для участков с панорамным видом.',
        poolType: 'infinity',
        category: 'premium',
        icon: '🌊',
        defaults: {
            dimensions: {
                length: 12,
                width: 4,
                depth: 1.4
            },
            materials: {
                bowl: 'concrete_monolithic',
                finish: 'mosaic_infinity',
                coping: 'hidden_edge'
            },
            equipment: {
                filter: 'filter_glass_media',
                pump: 'pump_infinity_dual',
                heater: 'heat_pump_20kw',
                lights: 'led_fiber_optic',
                controller: 'automation_premium'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: true,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: true
            },
            parts: {
                skimmers: 0,
                returns: 6,
                drains: 2,
                lights: 10,
                ladders: 1,
                rails: 0
            }
        },
        recommendations: {
            suitableFor: ['Участки с видом', 'Дизайнерские проекты', 'Премиум сегмент'],
            notSuitableFor: ['Ровные участки', 'Ограниченный бюджет'],
            averageCost: 4500000,
            buildTime: 90,
            maintenanceCost: 150000
        },
        tags: ['инфинити', 'бесконечный край', 'панорама', 'дизайнерский']
    },

    {
        id: 'freeform_natural',
        name: 'Природная форма (Natural Pool)',
        description: 'Бассейн свободной формы, имитирующий природный водоем. Экологичное решение.',
        poolType: 'freeform',
        category: 'premium',
        icon: '🌿',
        defaults: {
            dimensions: {
                length: 10,
                width: 6,
                depth: 1.5,
                depthShallow: 0.5,
                depthDeep: 2.0
            },
            materials: {
                bowl: 'concrete_shotcrete',
                finish: 'pebble_finish',
                coping: 'natural_boulder'
            },
            equipment: {
                filter: 'bio_filter',
                pump: 'pump_1.5kw_variable',
                heater: 'solar_heating',
                lights: 'underwater_natural'
            },
            works: {
                excavation: true,
                concrete: true,
                waterproofing: true,
                plumbing: true,
                electrical: true,
                finishing: true,
                landscaping: true
            },
            parts: {
                skimmers: 2,
                returns: 4,
                drains: 1,
                lights: 4,
                ladders: 0,
                rails: 0
            }
        },
        recommendations: {
            suitableFor: ['Ландшафтные проекты', 'Эко-дома', 'Природная эстетика'],
            notSuitableFor: ['Спортивное плавание', 'Минималистичный дизайн'],
            averageCost: 2800000,
            buildTime: 70,
            maintenanceCost: 80000
        },
        tags: ['природный', 'эко', 'свободная форма', 'ландшафт']
    },

    {
        id: 'composite_7x3',
        name: 'Композитный 7×3.5',
        description: 'Готовая композитная чаша. Быстрый монтаж за 3-5 дней.',
        poolType: 'rectangular_skimmer',
        category: 'residential',
        popular: true,
        icon: '⚡',
        defaults: {
            dimensions: {
                length: 7,
                width: 3.5,
                depth: 1.5
            },
            materials: {
                bowl: 'composite_fiberglass',
                finish: 'composite_gelcoat',
                coping: 'composite_coping'
            },
            equipment: {
                filter: 'filter_sand_500',
                pump: 'pump_0.75kw',
                heater: 'heat_exchanger_13kw',
                lights: 'led_color_12v'
            },
            works: {
                excavation: true,
                concrete: false,
                waterproofing: false,
                plumbing: true,
                electrical: true,
                finishing: false,
                landscaping: true
            },
            parts: {
                skimmers: 1,
                returns: 3,
                drains: 1,
                lights: 2,
                ladders: 1,
                rails: 0
            }
        },
        recommendations: {
            suitableFor: ['Быстрая установка', 'Частные дома', 'Средний бюджет'],
            notSuitableFor: ['Нестандартные размеры', 'Узкие проезды'],
            averageCost: 950000,
            buildTime: 7,
            maintenanceCost: 40000
        },
        tags: ['композитный', 'быстрый', 'готовый', 'стекловолокно']
    }
];

// ============================================
// UTILITIES
// ============================================

/**
 * Получить шаблоны по категории
 */
export const getTemplatesByCategory = (category: PoolCategory): PoolTemplate[] => {
    return POOL_TEMPLATES.filter(t => t.category === category);
};

/**
 * Получить популярные шаблоны
 */
export const getPopularTemplates = (): PoolTemplate[] => {
    return POOL_TEMPLATES.filter(t => t.popular);
};

/**
 * Поиск шаблонов по тегам или названию
 */
export const searchTemplates = (query: string): PoolTemplate[] => {
    const q = query.toLowerCase();
    return POOL_TEMPLATES.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    );
};

/**
 * Получить шаблон по ID
 */
export const getTemplateById = (id: string): PoolTemplate | undefined => {
    return POOL_TEMPLATES.find(t => t.id === id);
};

/**
 * Рассчитать объем бассейна
 */
export const calculatePoolVolume = (dimensions: PoolDimensions): number => {
    const avgDepth = dimensions.depthDeep && dimensions.depthShallow
        ? (dimensions.depthDeep + dimensions.depthShallow) / 2
        : dimensions.depth;

    return dimensions.length * dimensions.width * avgDepth;
};

/**
 * Рассчитать площадь зеркала воды
 */
export const calculateWaterSurface = (dimensions: PoolDimensions): number => {
    return dimensions.length * dimensions.width;
};

export default POOL_TEMPLATES;
