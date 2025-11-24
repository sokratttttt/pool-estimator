'use client';
import { useEstimate } from '@/context/EstimateContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Filter, Waves, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import OptionCard from '../premium/OptionCard';
import CatalogImporter from '../CatalogImporter';

export default function BowlStep() {
    const { selection, updateSelection, catalog, isLoadingCatalog } = useEstimate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    // Advanced Filters State
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [lengthRange, setLengthRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('default'); // default, price_asc, price_desc, length_asc, length_desc

    // Use catalog data from API
    const displayBowls = catalog?.bowls || [];

    // Get unique manufacturers
    const getManufacturer = (bowl) => {
        if (bowl.manufacturer) return bowl.manufacturer;
        const name = bowl.name.toUpperCase();
        if (name.includes('LUXOR') || name.includes('MARATHON') || name.includes('QUICK') ||
            name.includes('RIO') || name.includes('SPA') || name.includes('SPLASH') ||
            name.includes('IPOOL') || name.includes('MINIPOOL') || name.includes('CLASSIC') ||
            name.includes('SUPERMINI') || name.includes('TECH ROOM')) {
            return 'sanjuan';
        }
        return 'iqpools';
    };

    // Extract dimensions
    const getDimensions = (bowl) => {
        if (bowl.length && bowl.width && bowl.depth) {
            return { length: bowl.length, width: bowl.width, depth: bowl.depth };
        }
        const name = bowl.name.toUpperCase();
        const numberMatch = name.match(/(\d{2,4})(\d{2})/);
        if (numberMatch) {
            const fullMatch = numberMatch[0];
            const lengthDm = fullMatch.slice(0, -2);
            const widthDm = fullMatch.slice(-2);
            return {
                length: (parseInt(lengthDm) / 10).toFixed(1),
                width: (parseInt(widthDm) / 10).toFixed(1),
                depth: '1.5'
            };
        }
        return { length: null, width: null, depth: null };
    };

    const manufacturers = ['all', ...new Set(displayBowls.map(getManufacturer))];

    // Filter Logic
    const filteredBowls = displayBowls.filter(bowl => {
        const matchesSearch = bowl.name.toLowerCase().includes(searchTerm.toLowerCase());
        const manufacturer = getManufacturer(bowl);
        const matchesCategory = selectedCategory === 'all' || manufacturer === selectedCategory;

        const dims = getDimensions(bowl);
        const length = parseFloat(dims.length) || 0;

        const matchesPrice = (!priceRange.min || bowl.price >= parseFloat(priceRange.min)) &&
            (!priceRange.max || bowl.price <= parseFloat(priceRange.max));

        const matchesLength = (!lengthRange.min || length >= parseFloat(lengthRange.min)) &&
            (!lengthRange.max || length <= parseFloat(lengthRange.max));

        return matchesSearch && matchesCategory && matchesPrice && matchesLength;
    });

    // Sort Logic
    const sortedBowls = [...filteredBowls].sort((a, b) => {
        if (sortBy === 'default') return 0;

        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;

        const lenA = parseFloat(getDimensions(a).length) || 0;
        const lenB = parseFloat(getDimensions(b).length) || 0;

        if (sortBy === 'length_asc') return lenA - lenB;
        if (sortBy === 'length_desc') return lenB - lenA;

        return 0;
    });

    const handleSelect = (bowl) => {
        if (selection.bowl?.id === bowl.id) {
            updateSelection('bowl', null);
        } else {
            const dims = getDimensions(bowl);
            const depthValue = dims.depth ? parseFloat(dims.depth) : 1.5;
            const length = dims.length ? parseFloat(dims.length) : 0;
            const width = dims.width ? parseFloat(dims.width) : 0;
            const volume = bowl.volume || (length * width * depthValue);

            updateSelection('bowl', bowl);
            updateSelection('dimensions', {
                length: dims.length,
                width: dims.width,
                depth: dims.depth,
                volume: volume
            });
        }
    };

    const quickLengthOptions = [
        { label: 'Все', min: '', max: '' },
        { label: '3-5м', min: '3', max: '5' },
        { label: '5-7м', min: '5', max: '7' },
        { label: '7-9м', min: '7', max: '9' },
        { label: '9м+', min: '9', max: '' },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto"
            >
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Выберите чашу бассейна
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Широкий выбор композитных чаш от ведущих производителей
                </p>
            </motion.div>

            {/* Controls Container */}
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">

                {/* Top Row: Search, Category, Sort, View */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full lg:w-auto lg:min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Поиск по названию..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">
                        {/* Category */}
                        <div className="relative flex-1 min-w-[180px]">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full appearance-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                            >
                                {manufacturers.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'Все производители' : category}
                                    </option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>

                        {/* Sort */}
                        <div className="relative flex-1 min-w-[180px]">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                            >
                                <option value="default">По умолчанию</option>
                                <option value="price_asc">Цена (по возрастанию)</option>
                                <option value="price_desc">Цена (по убыванию)</option>
                                <option value="length_asc">Длина (по возрастанию)</option>
                                <option value="length_desc">Длина (по убыванию)</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-cyan-600' : 'text-slate-400'}`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-cyan-600' : 'text-slate-400'}`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">

                    {/* Price Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Цена (₽)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="От"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="number"
                                placeholder="До"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                            />
                        </div>
                    </div>

                    {/* Length Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Длина (м)</label>

                        {/* Quick Buttons */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {quickLengthOptions.map((opt) => {
                                const isActive = lengthRange.min === opt.min && lengthRange.max === opt.max;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => setLengthRange({ min: opt.min, max: opt.max })}
                                        className={`
                                            px-3 py-1 rounded-full text-xs font-medium transition-all
                                            ${isActive
                                                ? 'bg-cyan-500 text-white shadow-md'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Manual Inputs */}
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="От"
                                value={lengthRange.min}
                                onChange={(e) => setLengthRange({ ...lengthRange, min: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="number"
                                placeholder="До"
                                value={lengthRange.max}
                                onChange={(e) => setLengthRange({ ...lengthRange, max: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <CatalogImporter type="bowls" />
            </div>

            {/* Content */}
            {isLoadingCatalog ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {sortedBowls.map((bowl, index) => {
                        const dims = getDimensions(bowl);
                        const depthValue = dims.depth ? parseFloat(dims.depth) : 1.5;
                        const length = dims.length ? parseFloat(dims.length) : 0;
                        const width = dims.width ? parseFloat(dims.width) : 0;
                        const volume = bowl.volume || (length * width * depthValue).toFixed(1);

                        if (viewMode === 'list') {
                            return (
                                <motion.div
                                    key={bowl.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleSelect(bowl)}
                                    className={`
                                        flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border
                                        ${selection.bowl?.id === bowl.id
                                            ? 'bg-cyan-50 border-cyan-500 shadow-md'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-300 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <Waves className="text-cyan-600" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white">{bowl.name}</h3>
                                        <p className="text-sm text-slate-500">{getManufacturer(bowl)}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500 mb-1">
                                            {dims.length || '?'} × {dims.width || '?'} × {dims.depth || '?'}м
                                        </div>
                                        <div className="font-bold text-cyan-600">
                                            {bowl.price.toLocaleString('ru-RU')} ₽
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }

                        return (
                            <OptionCard
                                key={bowl.id}
                                title={bowl.name}
                                description={`${dims.length || '?'} × ${dims.width || '?'} × ${dims.depth || '?'}м • ${volume}м³`}
                                price={bowl.price}
                                image={bowl.image || <Waves size={64} className="text-cyan-600" />}
                                selected={selection.bowl?.id === bowl.id}
                                onClick={() => handleSelect(bowl)}
                                badge={getManufacturer(bowl)}
                                delay={index * 0.05}
                            />
                        );
                    })}
                </div>
            )}

            {!isLoadingCatalog && sortedBowls.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    Ничего не найдено
                </div>
            )}
        </div>
    );
}
