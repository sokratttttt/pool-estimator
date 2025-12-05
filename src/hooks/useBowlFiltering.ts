// TODO: Add proper TypeScript types for state
import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook for filtering and sorting bowls
 */
export function useBowlFiltering(bowls): any {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [lengthRange, setLengthRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('default');

    const getDimensions = (bowl: any) => {
        if (bowl.dimensions) return bowl.dimensions;
        return {
            length: bowl.length || bowl.size?.split('x')[0],
            width: bowl.width || bowl.size?.split('x')[1],
            depth: bowl.depth || '1.5'
        };
    };

    const getManufacturer = (bowl: any) => {
        return bowl.manufacturer || bowl.category || 'Не указан';
    };

    // Memoize manufacturers list
    const manufacturers = useMemo(() => {
        const unique = new Set(bowls.map(b => getManufacturer(b)));
        return [
            { value: 'all', label: 'Все производители' },
            ...Array.from(unique).map(m => ({ value: m, label: m }))
        ];
    }, [bowls]);

    // Memoize filtered bowls
    const filteredBowls = useMemo(() => {
        return bowls.filter(bowl => {
            const matchesSearch = bowl.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || getManufacturer(bowl) === selectedCategory;

            const price = bowl.price || 0;
            const matchesPrice = (!priceRange.min || price >= parseInt(priceRange.min)) &&
                (!priceRange.max || price <= parseInt(priceRange.max));

            const dims = getDimensions(bowl);
            const length = parseFloat(dims.length) || 0;
            const matchesLength = (!lengthRange.min || length >= parseFloat(lengthRange.min)) &&
                (!lengthRange.max || length <= parseFloat(lengthRange.max));

            return matchesSearch && matchesCategory && matchesPrice && matchesLength;
        });
    }, [bowls, debouncedSearchTerm, selectedCategory, priceRange, lengthRange]);

    // Memoize sorted bowls
    const sortedBowls = useMemo(() => {
        const sorted = [...filteredBowls];
        if (sortBy === 'price_asc') sorted.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        if (sortBy === 'price_desc') sorted.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
        if (sortBy === 'length_asc') sorted.sort((a: any, b: any) => {
            const aLen = parseFloat(getDimensions(a).length) || 0;
            const bLen = parseFloat(getDimensions(b).length) || 0;
            return aLen - bLen;
        });
        if (sortBy === 'length_desc') sorted.sort((a: any, b: any) => {
            const aLen = parseFloat(getDimensions(a).length) || 0;
            const bLen = parseFloat(getDimensions(b).length) || 0;
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
