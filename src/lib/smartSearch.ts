// Smart Catalog Search with Natural Language Processing
// Understands queries like "насос для 50 кубов до 100к"

const PATTERNS = {
    volume: /(\d+)\s*(куб|м3|м³)/i,
    area: /(\d+)\s*м2|м²|квадрат/i,
    price: /до\s*(\d+)\s*([кт]ыс|млн)?|бюджет\s*(\d+)/i,
    power: /(мощн|сильн|производ)/i,
    brand: /(aqua|emaux|astral|pentair|hayward|intex)/i,
    type: /(насос|фильтр|нагрев|освещ|подсвет|скиммер|форсунк|лестниц|покрыти)/i,
    quality: /(лучш|топ|премиум|дешев|бюджет|эконом)/i,
};

interface SearchFilters {
    type: string | null;
    brands: string[];
    minPrice: number;
    maxPrice: number;
    volume: number | null;
    power: number | null;
    sortBy: string;
}

interface EquipmentItem {
    name?: string;
    category?: string;
    price?: number;
    description?: string;
    rating?: number;
}

/**
 * Parse natural language search query
 */
export function parseSearchQuery(query: string): SearchFilters {
    const filters = {
        type: null as string | null,
        brands: [] as string[],
        minPrice: 0,
        maxPrice: Infinity,
        volume: null as number | null,
        power: null as number | null,
        sortBy: 'popularity'
    };

    const lowerQuery = query.toLowerCase();

    // Extract volume/area
    const volumeMatch = lowerQuery.match(PATTERNS.volume);
    if (volumeMatch) {
        filters.volume = parseInt(volumeMatch[1]);
    }

    // Extract price limit
    const priceMatch = lowerQuery.match(PATTERNS.price);
    if (priceMatch) {
        let price = parseInt(priceMatch[1] || priceMatch[3]);
        if (priceMatch[2]?.includes('млн')) {
            price *= 1000000;
        } else if (!priceMatch[2] || priceMatch[2].includes('к') || priceMatch[2].includes('тыс')) {
            price *= 1000;
        }
        filters.maxPrice = price;
    }

    // Extract brand
    const brandMatch = lowerQuery.match(PATTERNS.brand);
    if (brandMatch) {
        filters.brands.push(brandMatch[1]);
    }

    // Extract equipment type
    const typeMatch = lowerQuery.match(PATTERNS.type);
    if (typeMatch) {
        filters.type = mapEquipmentType(typeMatch[1]);
    }

    // Determine sort order
    if (PATTERNS.power.test(lowerQuery)) {
        filters.sortBy = 'power';
    } else if (PATTERNS.quality.test(lowerQuery) && (lowerQuery.includes('лучш') || lowerQuery.includes('топ'))) {
        filters.sortBy = 'rating';
    } else if (lowerQuery.includes('дешев') || lowerQuery.includes('бюджет')) {
        filters.sortBy = 'price_asc';
    }

    return filters;
}

function mapEquipmentType(typeStr: string) {
    const typeMap = {
        'насос': 'pump',
        'фильтр': 'filter',
        'нагрев': 'heater',
        'освещ': 'lighting',
        'подсвет': 'lighting',
        'скиммер': 'skimmer',
        'форсунк': 'nozzle',
        'лестниц': 'ladder',
        'покрыти': 'cover'
    };

    for (const [key, value] of Object.entries(typeMap)) {
        if (typeStr.includes(key)) return value;
    }
    return null;
}

/**
 * Apply filters to equipment list
 */
export function applySmartFilters(equipment: EquipmentItem[], filters: SearchFilters): any {
    let results = equipment;

    // Filter by type
    if (filters.type) {
        const type = filters.type;
        results = results.filter(item =>
            item.category?.toLowerCase().includes(type) ||
            item.name?.toLowerCase().includes(type)
        );
    }

    // Filter by brand
    if (filters.brands.length > 0) {
        results = results.filter(item =>
            filters.brands.some((brand: string) =>
                item.name?.toLowerCase().includes(brand.toLowerCase())
            )
        );
    }

    // Filter by price
    results = results.filter(item => {
        const price = item.price || 0;
        return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Filter by volume (for pumps/filters)
    if (filters.volume) {
        const volume = filters.volume;
        results = results.filter(item => {
            const capacity = extractCapacity(item.description || item.name || '');
            return !capacity || (capacity >= volume * 0.8 && capacity <= volume * 1.3);
        });
    }

    // Sort results
    results = sortResults(results, filters.sortBy);

    return results;
}

function extractCapacity(text: string) {
    const match = text.match(/(\d+)\s*(м3|куб)/i);
    return match ? parseInt(match[1]) : null;
}

function sortResults(items: EquipmentItem[], sortBy: string) {
    switch (sortBy) {
        case 'price_asc':
            return [...items].sort((a: EquipmentItem, b: EquipmentItem) => (a.price || 0) - (b.price || 0));
        case 'price_desc':
            return [...items].sort((a: EquipmentItem, b: EquipmentItem) => (b.price || 0) - (a.price || 0));
        case 'power':
            return [...items].sort((a: EquipmentItem, b: EquipmentItem) => {
                const powerA = extractPower(a.description || a.name || '');
                const powerB = extractPower(b.description || b.name || '');
                return powerB - powerA;
            });
        case 'rating':
            return [...items].sort((a: EquipmentItem, b: EquipmentItem) => (b.rating || 0) - (a.rating || 0));
        default:
            return items; // Keep original order (popularity)
    }
}

function extractPower(text: string) {
    const match = text.match(/(\d+\.?\d*)\s*(кВт|квт|kw)/i);
    return match ? parseFloat(match[1]) : 0;
}

/**
 * Generate search suggestions
 */
export function getSearchSuggestions(query: string, equipment: EquipmentItem[]): any {
    const suggestions: string[] = [];

    if (!query || query.length < 2) {
        return [
            'насос для 50 кубов',
            'фильтр до 100 тысяч',
            'самый мощный нагреватель',
            'LED освещение премиум',
            'скиммер для 8 метров'
        ];
    }

    // Extract unique categories
    const categories = [...new Set(equipment.map((e: EquipmentItem) => e.category).filter((c): c is string => !!c))];
    const matchingCategories = categories.filter((cat: any) =>
        cat.toLowerCase().includes(query.toLowerCase())
    );

    matchingCategories.forEach((cat: string) => {
        suggestions.push(`${cat} до 50 тысяч`);
        suggestions.push(`лучший ${cat}`);
    });

    // Brand suggestions
    const brands = ['Aqua', 'Emaux', 'Astral', 'Pentair', 'Hayward'];
    brands.forEach((brand: string) => {
        if (brand.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push(`${brand} насосы`);
            suggestions.push(`${brand} фильтры`);
        }
    });

    return suggestions.slice(0, 5);
}

/**
 * Explain what filters were applied
 */
export function explainSearch(_query: string, filters: SearchFilters, resultsCount: number): any {
    const parts: string[] = [];

    if (filters.type) {
        parts.push(`тип: ${filters.type}`);
    }
    if (filters.brands.length > 0) {
        parts.push(`бренд: ${filters.brands.join(', ')}`);
    }
    if (filters.maxPrice < Infinity) {
        parts.push(`до ${(filters.maxPrice / 1000).toFixed(0)}K ₽`);
    }
    if (filters.volume) {
        parts.push(`для ${filters.volume}м³`);
    }

    const explanation = parts.length > 0
        ? `Найдено ${resultsCount} товаров (${parts.join(', ')})`
        : `Найдено ${resultsCount} товаров`;

    return explanation;
}
