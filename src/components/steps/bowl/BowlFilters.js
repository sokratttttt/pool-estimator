'use client';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { SearchInput, Select } from '@/components/common';

export default function BowlFilters({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    manufacturers,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
    priceRange,
    onPriceRangeChange,
    lengthRange,
    onLengthRangeChange
}) {
    const sortOptions = [
        { value: 'default', label: 'По умолчанию' },
        { value: 'price_asc', label: 'Цена (по возрастанию)' },
        { value: 'price_desc', label: 'Цена (по убыванию)' },
        { value: 'length_asc', label: 'Длина (по возрастанию)' },
        { value: 'length_desc', label: 'Длина (по убыванию)' }
    ];

    const quickLengthOptions = [
        { label: 'Все', min: '', max: '' },
        { label: '3-5м', min: '3', max: '5' },
        { label: '5-7м', min: '5', max: '7' },
        { label: '7-9м', min: '7', max: '9' },
        { label: '9м+', min: '9', max: '' },
    ];

    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            {/* Top Row: Search, Category, Sort, View */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="w-full lg:w-auto lg:min-w-[300px]">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Поиск по названию..."
                    />
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">
                    {/* Category */}
                    <div className="flex-1 min-w-[200px]">
                        <Select
                            value={selectedCategory}
                            onChange={onCategoryChange}
                            options={manufacturers}
                            placeholder="Производитель"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex-1 min-w-[200px]">
                        <Select
                            value={sortBy}
                            onChange={onSortChange}
                            options={sortOptions}
                            placeholder="Сортировка"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-cyan-600' : 'text-slate-400'}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
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
                            onChange={(e) => onPriceRangeChange({ ...priceRange, min: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="number"
                            placeholder="До"
                            value={priceRange.max}
                            onChange={(e) => onPriceRangeChange({ ...priceRange, max: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                                    onClick={() => onLengthRangeChange({ min: opt.min, max: opt.max })}
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
                            onChange={(e) => onLengthRangeChange({ ...lengthRange, min: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="number"
                            placeholder="До"
                            value={lengthRange.max}
                            onChange={(e) => onLengthRangeChange({ ...lengthRange, max: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
