'use client';
import { useState, useEffect } from 'react';
import { useEstimate } from '@/context/EstimateContext';
import { motion } from 'framer-motion';
import { Ruler, Droplet, AlertCircle } from 'lucide-react';
import AppleCard from '../apple/AppleCard';
import AppleInput from '../apple/AppleInput';
import PoolVisualizer from '../PoolVisualizer';

export default function DimensionsStep() {
    const { selection, updateSelection } = useEstimate();
    const [dimensions, setDimensions] = useState({
        length: selection.dimensions?.length || 8,
        width: selection.dimensions?.width || 4,
        depth: selection.dimensions?.depth || 1.5,
    });
    const [errors, setErrors] = useState({});

    const validate = (field, value) => {
        const num = parseFloat(value);
        const newErrors = { ...errors };

        if (isNaN(num) || num <= 0) {
            newErrors[field] = 'Введите положительное число';
        } else if (field === 'length' && (num < 3 || num > 25)) {
            newErrors[field] = 'Длина должна быть от 3 до 25 метров';
        } else if (field === 'width' && (num < 2 || num > 15)) {
            newErrors[field] = 'Ширина должна быть от 2 до 15 метров';
        } else if (field === 'depth' && (num < 0.8 || num > 3)) {
            newErrors[field] = 'Глубина должна быть от 0.8 до 3 метров';
        } else {
            delete newErrors[field];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        const newDimensions = { ...dimensions, [field]: value };
        setDimensions(newDimensions);

        if (validate(field, value)) {
            updateSelection('dimensions', newDimensions);
        }
    };

    const volume = dimensions.length * dimensions.width * dimensions.depth;
    const surfaceArea = dimensions.length * dimensions.width;

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto"
            >
                <h2 className="apple-heading-2 mb-4">Размеры бассейна</h2>
                <p className="apple-body-secondary">
                    Укажите желаемые размеры вашего бассейна
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Input Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <AppleCard>
                        <h3 className="apple-heading-3 mb-6">Параметры</h3>

                        <div className="space-y-6">
                            <AppleInput
                                type="number"
                                label="Длина (м)"
                                placeholder="8"
                                value={dimensions.length}
                                onChange={(e) => handleChange('length', e.target.value)}
                                error={errors.length}
                                icon={<Ruler size={20} />}
                                step="0.1"
                                min="3"
                                max="25"
                            />

                            <AppleInput
                                type="number"
                                label="Ширина (м)"
                                placeholder="4"
                                value={dimensions.width}
                                onChange={(e) => handleChange('width', e.target.value)}
                                error={errors.width}
                                icon={<Ruler size={20} />}
                                step="0.1"
                                min="2"
                                max="15"
                            />

                            <AppleInput
                                type="number"
                                label="Глубина (м)"
                                placeholder="1.5"
                                value={dimensions.depth}
                                onChange={(e) => handleChange('depth', e.target.value)}
                                error={errors.depth}
                                icon={<Droplet size={20} />}
                                step="0.1"
                                min="0.8"
                                max="3"
                            />
                        </div>

                        {/* Calculations */}
                        <div className="mt-8 pt-6 border-t border-apple-border space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="apple-body-secondary">Объем воды:</span>
                                <span className="apple-heading-3 text-apple-primary">
                                    {volume.toFixed(1)} м³
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="apple-body-secondary">Площадь поверхности:</span>
                                <span className="apple-heading-3 text-apple-primary">
                                    {surfaceArea.toFixed(1)} м²
                                </span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex gap-3">
                                <AlertCircle size={20} className="text-apple-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="apple-caption">
                                        Объем воды влияет на выбор оборудования для фильтрации и подогрева
                                    </p>
                                </div>
                            </div>
                        </div>
                    </AppleCard>
                </motion.div>

                {/* Visualization */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <PoolVisualizer
                        dimensions={dimensions}
                        material={selection.material?.id}
                    />

                    {/* Popular Sizes */}
                    <AppleCard className="mt-6">
                        <h4 className="apple-heading-3 mb-4">Популярные размеры</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: '6×3м', length: 6, width: 3, depth: 1.5 },
                                { label: '8×4м', length: 8, width: 4, depth: 1.5 },
                                { label: '10×5м', length: 10, width: 5, depth: 1.8 },
                                { label: '12×6м', length: 12, width: 6, depth: 2 },
                            ].map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => {
                                        setDimensions(preset);
                                        updateSelection('dimensions', preset);
                                    }}
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
            </div>
        </div>
    );
}
