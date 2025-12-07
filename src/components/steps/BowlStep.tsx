'use client';
import { useEstimate } from '@/context/EstimateContext';
import { Waves } from 'lucide-react';
import CatalogImporter from '../CatalogImporter';
import { EmptyState, LoadingSkeleton } from '../ui';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useBowlFiltering } from '@/hooks/useBowlFiltering';
import BowlHeader from './bowl/BowlHeader';
import BowlFilters from './bowl/BowlFilters';
import BowlGrid from './bowl/BowlGrid';
import BowlList from './bowl/BowlList';
import VirtualizedBowlGrid from './bowl/VirtualizedBowlGrid';

import type { Bowl } from '@/types';

// Порог для включения виртуализации
const VIRTUALIZATION_THRESHOLD = 12;

interface BowlStepProps {
    bowl?: Bowl;
}

export default function BowlStep({ }: BowlStepProps) {
    const { selection, updateSelection, catalog, isLoadingCatalog } = useEstimate();
    const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>('bowl-step-view-mode', 'grid');

    const displayBowls = catalog?.bowls || [];

    const {
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
    } = useBowlFiltering(displayBowls);

    const handleSelect = (bowl: Bowl) => {
        const dims = getDimensions(bowl);
        const depthValue = dims.depth ? parseFloat(String(dims.depth)) : 1.5;
        const length = dims.length ? parseFloat(String(dims.length)) : 0;
        const width = dims.width ? parseFloat(String(dims.width)) : 0;
        const volume = bowl.volume || (length * width * depthValue);

        updateSelection('bowl', bowl);
        updateSelection('dimensions', {
            length: dims.length,
            width: dims.width,
            depth: dims.depth,
            volume: volume
        });
    };

    return (
        <div className="space-y-8 pb-20">
            <BowlHeader />

            <div className="space-y-4">
                <BowlFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    manufacturers={manufacturers}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    lengthRange={lengthRange}
                    onLengthRangeChange={setLengthRange}
                />

                <CatalogImporter type="bowls" />
            </div>

            {isLoadingCatalog ? (
                <LoadingSkeleton type="grid" gridConfig={{ columns: 3, rows: 2 }} />
            ) : sortedBowls.length === 0 ? (
                <EmptyState
                    icon={<Waves size={64} />}
                    title="Чаши не найдены"
                    description={hasActiveFilters
                        ? 'Попробуйте изменить фильтры или условия поиска'
                        : 'Загрузите каталог чаш или обратитесь к администратору'
                    }
                    action={hasActiveFilters ? {
                        label: 'Сбросить фильтры',
                        onClick: resetFilters,
                        variant: 'secondary'
                    } : undefined}
                />
            ) : (
                viewMode === 'grid' ? (
                    // Используем виртуализацию для больших каталогов
                    sortedBowls.length > VIRTUALIZATION_THRESHOLD ? (
                        <VirtualizedBowlGrid
                            bowls={sortedBowls as unknown as import('@/types').Bowl[]}
                            onSelect={handleSelect}
                            selectedId={selection.bowl?.id}
                            getDimensions={getDimensions}
                            getManufacturer={getManufacturer}
                        />
                    ) : (
                        <BowlGrid
                            bowls={sortedBowls as unknown as import('@/types').Bowl[]}
                            onSelect={handleSelect}
                            selectedId={selection.bowl?.id}
                            getDimensions={getDimensions}
                            getManufacturer={getManufacturer}
                        />
                    )
                ) : (
                    <BowlList
                        bowls={sortedBowls as unknown as import('@/types').Bowl[]}
                        onSelect={handleSelect}
                        selectedId={selection.bowl?.id}
                        getDimensions={getDimensions}
                        getManufacturer={getManufacturer}
                    />
                )
            )}
        </div>
    );
}
