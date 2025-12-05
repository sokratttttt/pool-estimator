'use client';
import { useEstimate } from '@/context/EstimateContext';
import { useAdditionalLogic } from '@/hooks/useAdditionalLogic';
import AdditionalHeader from './additional/AdditionalHeader';
import AdditionalGrid from './additional/AdditionalGrid';

export default function AdditionalStep() {
    const { selection, updateSelection, catalog } = useEstimate();
    const { categories, optionsByCategory, selectedIds, toggleOption } = useAdditionalLogic(catalog, selection, updateSelection);

    return (
        <div className="space-y-8 pb-20">
            <AdditionalHeader />
            <AdditionalGrid
                categories={categories}
                optionsByCategory={optionsByCategory}
                selectedIds={selectedIds}
                onToggle={toggleOption}
            />
        </div>
    );
}
