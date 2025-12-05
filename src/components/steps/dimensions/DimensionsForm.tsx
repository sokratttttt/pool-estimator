'use client';
import { motion } from 'framer-motion';
import { Ruler, Droplet, AlertCircle } from 'lucide-react';
import AppleCard from '../../apple/AppleCard';
import AppleInput from '../../apple/AppleInput';

interface DimensionsFormProps {
    dimensions?: any;
    errors?: any;
    onChange?: (field: string, value: string) => void;
    volume?: any;
    surfaceArea?: any;
}

export default function DimensionsForm({ dimensions, errors, onChange, volume, surfaceArea }: DimensionsFormProps) {
    return (
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
                        onChange={(e: React.ChangeEvent<any>) => onChange?.('length', e.target.value)}
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
                        onChange={(e: React.ChangeEvent<any>) => onChange?.('width', e.target.value)}
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
                        onChange={(e: React.ChangeEvent<any>) => onChange?.('depth', e.target.value)}
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
    );
}
