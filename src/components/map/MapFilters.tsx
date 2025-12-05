'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POOL_TYPES = [
    { value: 'premium', label: 'Премиум', color: 'bg-yellow-500' },
    { value: 'standard', label: 'Стандарт', color: 'bg-blue-500' },
    { value: 'sport', label: 'Спортивный', color: 'bg-green-500' },
    { value: 'kids', label: 'Детский', color: 'bg-orange-500' },
    { value: 'infinity', label: 'Infinity', color: 'bg-purple-500' },
];

import { MapFiltersState } from '@/types';

interface MapFiltersProps {
    filters: MapFiltersState;
    setFilters: (filters: MapFiltersState) => void;
    projectCount: number;
}

export default function MapFilters({ filters, setFilters, projectCount }: MapFiltersProps) {
    const [isOpen, setIsOpen] = useState(true);

    const togglePoolType = (type: string) => {
        const current = filters.poolTypes;
        if (current.includes(type)) {
            setFilters({ ...filters, poolTypes: current.filter(t => t !== type) });
        } else {
            setFilters({ ...filters, poolTypes: [...current, type] });
        }
    };

    const resetFilters = () => {
        setFilters({
            poolTypes: [],
            yearRange: [2020, 2024],
            budgetRange: [0, 15000000]
        });
    };

    return (
        <div className="absolute top-4 right-4 z-[1000] w-80">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-primary p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Filter size={20} />
                        <h3 className="font-bold">Фильтры</h3>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            {projectCount}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <ChevronDown
                            size={20}
                            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 space-y-4">
                                {/* Pool Types */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Тип бассейна</h4>
                                    <div className="space-y-2">
                                        {POOL_TYPES.map(type => (
                                            <label
                                                key={type.value}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.poolTypes.includes(type.value)}
                                                    onChange={() => togglePoolType(type.value)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                                <span className="text-sm text-gray-700">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Year Range */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Год завершения</h4>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="2020"
                                            max="2024"
                                            value={filters.yearRange[0]}
                                            onChange={(e: React.ChangeEvent<any>) => setFilters({
                                                ...filters,
                                                yearRange: [parseInt(e.target.value), filters.yearRange[1]]
                                            })}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <span className="text-gray-500">—</span>
                                        <input
                                            type="number"
                                            min="2020"
                                            max="2024"
                                            value={filters.yearRange[1]}
                                            onChange={(e: React.ChangeEvent<any>) => setFilters({
                                                ...filters,
                                                yearRange: [filters.yearRange[0], parseInt(e.target.value)]
                                            })}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Budget Range */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Бюджет (млн ₽)</h4>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="15"
                                            step="0.5"
                                            value={filters.budgetRange[0] / 1000000}
                                            onChange={(e: React.ChangeEvent<any>) => setFilters({
                                                ...filters,
                                                budgetRange: [parseFloat(e.target.value) * 1000000, filters.budgetRange[1]]
                                            })}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <span className="text-gray-500">—</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="15"
                                            step="0.5"
                                            value={filters.budgetRange[1] / 1000000}
                                            onChange={(e: React.ChangeEvent<any>) => setFilters({
                                                ...filters,
                                                budgetRange: [filters.budgetRange[0], parseFloat(e.target.value) * 1000000]
                                            })}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Reset Button */}
                                <button
                                    onClick={resetFilters}
                                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={16} />
                                    Сбросить фильтры
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
