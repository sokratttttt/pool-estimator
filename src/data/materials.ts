export const materials = [
    {
        id: 'concrete',
        name: 'Бетонный бассейн',
        description: 'Классический капитальный бассейн. Любая форма и размер.',
        image: '/images/panoramnye-bassejny_2.jpg',
        basePricePerCubicMeter: 25000,
        type: 'custom',
        constructionType: 'monolith'
    },
    {
        id: 'composite',
        name: 'Композитный бассейн',
        description: 'Готовая чаша. Быстрая установка, гладкая поверхность.',
        image: '/images/sompass-pools-xtrainer-3.jpg',
        basePricePerCubicMeter: 0,
        type: 'fixed',
        constructionType: 'belt'
    },
    {
        id: 'polypropylene',
        name: 'Полипропиленовый бассейн',
        description: 'Пластиковая чаша. Герметичность, разнообразие форм.',
        image: '/images/krasivye-bassejny-na-dache.jpeg',
        basePricePerCubicMeter: 15000,
        type: 'custom',
        constructionType: 'slab'
    }
];
