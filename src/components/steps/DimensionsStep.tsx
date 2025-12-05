'use client';
import { useEstimate } from '@/context/EstimateContext';
import { useDimensionsLogic } from '@/hooks/useDimensionsLogic';
import DimensionsHeader from './dimensions/DimensionsHeader';
import DimensionsForm from './dimensions/DimensionsForm';
import DimensionsVisualizer from './dimensions/DimensionsVisualizer';

export default function DimensionsStep() {
    const { selection, updateSelection } = useEstimate();
    const {
        dimensions,
        errors,
        handleChange,
        volume,
        surfaceArea,
        presets,
        applyPreset
    } = useDimensionsLogic(selection, updateSelection);

    return (
        <div className="space-y-8">
            <DimensionsHeader />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <DimensionsForm
                    dimensions={dimensions}
                    errors={errors}
                    onChange={handleChange}
                    volume={volume}
                    surfaceArea={surfaceArea}
                />

                <DimensionsVisualizer
                    dimensions={dimensions}
                    material={selection.material?.id}
                    presets={presets}
                    onApplyPreset={applyPreset}
                />
            </div>
        </div>
    );
}
