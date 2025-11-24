// Comprehensive work items database for pool construction
export const works = {
    earthworks: {
        excavation: {
            id: 'excavation',
            name: 'Котлован',
            description: 'Выемка грунта под бассейн',
            pricePerM3: 1500,
            unit: 'м³',
            category: 'earthworks',
            autoCalculate: true,
            formula: (dimensions) => {
                // Котлован = (длина + 1м) × (ширина + 1м) × (глубина + 0.3м)
                const length = dimensions.length + 1;
                const width = dimensions.width + 1;
                const depth = parseFloat(dimensions.depth) + 0.3;
                return length * width * depth;
            }
        },
        backfill: {
            id: 'backfill',
            name: 'Обратная засыпка',
            description: 'Засыпка пазух котлована',
            pricePerM3: 800,
            unit: 'м³',
            category: 'earthworks',
            autoCalculate: true,
            formula: (dimensions) => {
                // Примерно 30% от объема котлована
                const excavationVolume = (dimensions.length + 1) * (dimensions.width + 1) * (parseFloat(dimensions.depth) + 0.3);
                return excavationVolume * 0.3;
            }
        },
        removal: {
            id: 'removal',
            name: 'Вывоз грунта',
            description: 'Погрузка и вывоз лишнего грунта',
            pricePerM3: 500,
            unit: 'м³',
            category: 'earthworks',
            autoCalculate: true,
            formula: (dimensions) => {
                // Примерно 50% от объема котлована
                const excavationVolume = (dimensions.length + 1) * (dimensions.width + 1) * (parseFloat(dimensions.depth) + 0.3);
                return excavationVolume * 0.5;
            }
        },
        leveling: {
            id: 'leveling',
            name: 'Планировка дна',
            description: 'Выравнивание и уплотнение дна котлована',
            pricePerM2: 300,
            unit: 'м²',
            category: 'earthworks',
            autoCalculate: true,
            formula: (dimensions) => {
                return dimensions.length * dimensions.width;
            }
        }
    },

    foundation: {
        sandBase: {
            id: 'sandBase',
            name: 'Песчаная подушка',
            description: 'Устройство песчаного основания 20см',
            pricePerM3: 2500,
            unit: 'м³',
            category: 'foundation',
            autoCalculate: true,
            formula: (dimensions) => {
                return dimensions.length * dimensions.width * 0.2;
            }
        },
        concreteSlab: {
            id: 'concreteSlab',
            name: 'Бетонная плита',
            description: 'Заливка бетонной плиты 25см (бетон М300)',
            pricePerM3: 8000,
            unit: 'м³',
            category: 'foundation',
            autoCalculate: true,
            formula: (dimensions) => {
                return dimensions.length * dimensions.width * 0.25;
            }
        },
        reinforcement: {
            id: 'reinforcement',
            name: 'Армирование плиты',
            description: 'Армирование бетонной плиты (сетка 200x200)',
            pricePerM2: 1200,
            unit: 'м²',
            category: 'foundation',
            autoCalculate: true,
            formula: (dimensions) => {
                return dimensions.length * dimensions.width;
            }
        },
        waterproofing: {
            id: 'waterproofing',
            name: 'Гидроизоляция',
            description: 'Гидроизоляция плиты (2 слоя)',
            pricePerM2: 800,
            unit: 'м²',
            category: 'foundation',
            autoCalculate: true,
            formula: (dimensions) => {
                return dimensions.length * dimensions.width;
            }
        }
    },

    installation: {
        bowlInstallation: {
            id: 'bowlInstallation',
            name: 'Установка чаши',
            description: 'Монтаж композитной чаши с выравниванием',
            price: 150000,
            unit: 'шт',
            category: 'installation',
            autoCalculate: false,
            quantity: 1
        },
        equipmentInstallation: {
            id: 'equipmentInstallation',
            name: 'Монтаж оборудования',
            description: 'Установка и подключение всего оборудования',
            pricePerHour: 2500,
            unit: 'час',
            category: 'installation',
            autoCalculate: true,
            formula: (selection) => {
                // Базовое время + время на каждую единицу оборудования
                let hours = 4; // Базовое время
                if (selection.heating) hours += 2;
                if (selection.parts) hours += selection.parts.length * 0.5;
                if (selection.additional) hours += selection.additional.length * 1;
                return hours;
            }
        },
        plumbing: {
            id: 'plumbing',
            name: 'Сантехнические работы',
            description: 'Прокладка труб, подключение к коммуникациям',
            price: 45000,
            unit: 'компл',
            category: 'installation',
            autoCalculate: false,
            quantity: 1
        },
        electrical: {
            id: 'electrical',
            name: 'Электромонтажные работы',
            description: 'Прокладка кабелей, установка автоматики',
            price: 35000,
            unit: 'компл',
            category: 'installation',
            autoCalculate: false,
            quantity: 1
        },
        commissioning: {
            id: 'commissioning',
            name: 'Пуско-наладочные работы',
            description: 'Настройка и тестирование всех систем',
            price: 25000,
            unit: 'компл',
            category: 'installation',
            autoCalculate: false,
            quantity: 1
        }
    },

    finishing: {
        tiling: {
            id: 'tiling',
            name: 'Облицовка плиткой',
            description: 'Укладка плитки вокруг бассейна',
            pricePerM2: 3000,
            unit: 'м²',
            category: 'finishing',
            autoCalculate: false,
            quantity: 0
        },
        coping: {
            id: 'coping',
            name: 'Копинговый камень',
            description: 'Установка бортового камня',
            pricePerM: 2000,
            unit: 'м',
            category: 'finishing',
            autoCalculate: true,
            formula: (dimensions) => {
                return (dimensions.length + dimensions.width) * 2;
            }
        },
        deck: {
            id: 'deck',
            name: 'Террасная доска',
            description: 'Укладка террасной доски вокруг бассейна',
            pricePerM2: 4500,
            unit: 'м²',
            category: 'finishing',
            autoCalculate: false,
            quantity: 0
        },
        ladder: {
            id: 'ladder',
            name: 'Лестница из нержавейки',
            description: 'Установка лестницы для спуска в бассейн',
            price: 35000,
            unit: 'шт',
            category: 'finishing',
            autoCalculate: false,
            quantity: 1
        }
    },

    additional: {
        delivery: {
            id: 'delivery',
            name: 'Доставка материалов',
            description: 'Доставка всех материалов на объект',
            price: 25000,
            unit: 'компл',
            category: 'additional',
            autoCalculate: false,
            quantity: 1
        },
        unloading: {
            id: 'unloading',
            name: 'Разгрузка',
            description: 'Разгрузка материалов и оборудования',
            price: 15000,
            unit: 'компл',
            category: 'additional',
            autoCalculate: false,
            quantity: 1
        },
        waste: {
            id: 'waste',
            name: 'Вывоз мусора',
            description: 'Вывоз строительного мусора',
            price: 20000,
            unit: 'компл',
            category: 'additional',
            autoCalculate: false,
            quantity: 1
        }
    }
};

// Work categories for UI grouping
export const workCategories = {
    earthworks: {
        name: 'Земляные работы',
        icon: '🏗️',
        description: 'Подготовка котлована'
    },
    foundation: {
        name: 'Фундамент',
        icon: '🧱',
        description: 'Устройство основания'
    },
    installation: {
        name: 'Монтаж',
        icon: '🔧',
        description: 'Установка чаши и оборудования'
    },
    finishing: {
        name: 'Отделка',
        icon: '✨',
        description: 'Финишные работы'
    },
    additional: {
        name: 'Дополнительно',
        icon: '📦',
        description: 'Доставка и прочее'
    }
};

// Helper function to calculate all auto-calculated works
export function calculateAutoWorks(selection) {
    const results = {};
    const dimensions = selection.dimensions || selection.bowl;

    if (!dimensions) return results;

    Object.entries(works).forEach(([category, items]) => {
        Object.entries(items).forEach(([key, work]) => {
            if (work.autoCalculate && work.formula) {
                try {
                    const quantity = work.formula(dimensions, selection);
                    results[work.id] = {
                        ...work,
                        quantity: Math.ceil(quantity * 10) / 10, // Round to 1 decimal
                        total: work.pricePerM3
                            ? Math.ceil(quantity * work.pricePerM3)
                            : work.pricePerM2
                                ? Math.ceil(quantity * work.pricePerM2)
                                : work.pricePerHour
                                    ? Math.ceil(quantity * work.pricePerHour)
                                    : work.price || 0
                    };
                } catch (error) {
                    console.error(`Error calculating ${work.id}:`, error);
                }
            }
        });
    });

    return results;
}
