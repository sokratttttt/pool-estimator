'use client';
import { useEstimate } from '@/context/EstimateContext';
import { usePartsLogic } from '@/hooks/usePartsLogic';
import PartsHeader from './parts/PartsHeader';
import PartsGrid from './parts/PartsGrid';

export default function PartsStep() {
    const { selection, updateSelection } = useEstimate();
    const { partsOptions, handleSelect } = usePartsLogic(selection, updateSelection);

    return (
        <div className="space-y-8 pb-20">
            <PartsHeader />
            <PartsGrid
                options={partsOptions}
                selection={selection.parts}
                onSelect={handleSelect}
            />
        </div>
    );
}
