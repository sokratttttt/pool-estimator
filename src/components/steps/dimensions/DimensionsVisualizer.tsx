'use client';
import { motion } from 'framer-motion';
import AppleCard from '../../apple/AppleCard';
import PoolVisualizer from '../../PoolVisualizer';

import { Dimensions } from '@/types';

interface Preset {
    label: string;
    length: number;
    width: number;
    depth: number;
}

interface DimensionsVisualizerProps {
    dimensions?: Dimensions;
    material?: string;
    presets?: Preset[];
    onApplyPreset?: (preset: Preset) => void;
}

export default function DimensionsVisualizer({ dimensions, material, presets = [], onApplyPreset }: DimensionsVisualizerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
            <PoolVisualizer
                dimensions={dimensions}
                material={material}
            />

            {/* Popular Sizes */}
            <AppleCard className="mt-6">
                <h4 className="apple-heading-3 mb-4">Популярные размеры</h4>
                <div className="grid grid-cols-2 gap-3">
                    {presets.map((preset: Preset) => (
                        <button
                            key={preset.label}
                            onClick={() => onApplyPreset?.(preset)}
                            className="p-3 rounded-lg bg-apple-bg-secondary hover:bg-apple-primary hover:text-white transition-colors text-center"
                        >
                            <div className="font-semibold">{preset.label}</div>
                            <div className="text-xs opacity-70">
                                {(preset.length * preset.width * preset.depth).toFixed(1)} м³
                            </div>
                        </button>
                    ))}
                </div>
            </AppleCard>
        </motion.div>
    );
}
