// TODO: Add proper TypeScript types for state
import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface Bowl {
    name: string;
    price?: number;
    manufacturer?: string;
    category?: string;
    length?: number;
    width?: number;
    depth?: number;
    size?: string;
    dimensions?: {
        length?: string | number;
        width?: string | number;
        depth?: string | number;
    };
    [key: string]: unknown; // Index signature for compatibility
}

interface BowlDimensions {
    length?: string | number;
    width?: string | number;
    depth?: string | number;
}

interface PriceRange {
    min: string;
    max: string;
}

interface Manufacturer {
    value: string;
    label: string;
}

/**
 * Hook for filtering and sorting bowls
 */
export function useBowlFiltering(bowls: Bowl[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: '', max: '' });
    const [lengthRange, setLengthRange] = useState<PriceRange>({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('default');

    const getDimensions = (bowl: Bowl): BowlDimensions => {
        if (bowl.dimensions) return bowl.dimensions;
        return {
            length: bowl.length || bowl.size?.split('x')[0],
            width: bowl.width || bowl.size?.split('x')[1],
            depth: bowl.depth || '1.5'
        };
    };

    const getManufacturer = (bowl: Bowl): string => {
        return bowl.manufacturer || bowl.category || 'Не указан';
    };

    // Memoize manufacturers list
    const manufacturers = useMemo((): Manufacturer[] => {
        const unique = new Set(bowls.map((b: Bowl) => getManufacturer(b)));
        return [
            { value: 'all', label: 'Все производители' },
            ...Array.from(unique).map((m: string) => ({ value: m, label: m }))
        ];
    }, [bowls]);

    // Memoize filtered bowls
    const filteredBowls = useMemo(() => {
        return bowls.filter((bowl: Bowl) => {
            const matchesSearch = bowl.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || getManufacturer(bowl) === selectedCategory;

            const price = bowl.price || 0;
            const matchesPrice = (!priceRange.min || price >= parseInt(priceRange.min)) &&
                (!priceRange.max || price <= parseInt(priceRange.max));

            const dims = getDimensions(bowl);
            const length = parseFloat(String(dims.length)) || 0;
            const matchesLength = (!lengthRange.min || length >= parseFloat(lengthRange.min)) &&
                (!lengthRange.max || length <= parseFloat(lengthRange.max));

            return matchesSearch && matchesCategory && matchesPrice && matchesLength;
        });
    }, [bowls, debouncedSearchTerm, selectedCategory, priceRange, lengthRange]);

    // Memoize sorted bowls
    const sortedBowls = useMemo(() => {
        const sorted = [...filteredBowls];
        if (sortBy === 'price_asc') sorted.sort((a: Bowl, b: Bowl) => (a.price || 0) - (b.price || 0));
        if (sortBy === 'price_desc') sorted.sort((a: Bowl, b: Bowl) => (b.price || 0) - (a.price || 0));
        if (sortBy === 'length_asc') sorted.sort((a: Bowl, b: Bowl) => {
            const aLen = parseFloat(String(getDimensions(a).length)) || 0;
            const bLen = parseFloat(String(getDimensions(b).length)) || 0;
            return aLen - bLen;
        });
        if (sortBy === 'length_desc') sorted.sort((a: Bowl, b: Bowl) => {
            const aLen = parseFloat(String(getDimensions(a).length)) || 0;
            const bLen = parseFloat(String(getDimensions(b).length)) || 0;
            return bLen - aLen;
        });
        return sorted;
    }, [filteredBowls, sortBy]);

    const resetFilters = () => {
        setSearchTerm('');
        setPriceRange({ min: '', max: '' });
        setLengthRange({ min: '', max: '' });
        setSelectedCategory('all');
        setSortBy('default');
    };

    const hasActiveFilters = searchTerm || priceRange.min || priceRange.max || lengthRange.min || lengthRange.max || selectedCategory !== 'all';

    return {
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        lengthRange,
        setLengthRange,
        sortBy,
        setSortBy,
        manufacturers,
        sortedBowls,
        resetFilters,
        hasActiveFilters,
        getDimensions,
        getManufacturer
    };
}
