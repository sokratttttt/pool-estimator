'use client';
import { useEstimate } from '@/context/EstimateContext';
import { useMaterialLogic } from '@/hooks/useMaterialLogic';
import MaterialHeader from './material/MaterialHeader';
import MaterialGrid from './material/MaterialGrid';
import MaterialInfo from './material/MaterialInfo';

export default function MaterialStep() {
    const { selection, updateSelection } = useEstimate();
    const { materials, handleSelect } = useMaterialLogic(selection, updateSelection);

    return (
        <div className="space-y-8">
            <MaterialHeader />

            <MaterialGrid
                materials={materials}
                selection={selection.material as unknown as Parameters<typeof MaterialGrid>[0]['selection']}
                onSelect={handleSelect as unknown as Parameters<typeof MaterialGrid>[0]['onSelect']}
            />

            <MaterialInfo />
        </div>
    );
}
