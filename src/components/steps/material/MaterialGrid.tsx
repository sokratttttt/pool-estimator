'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, Layers, Sparkles } from 'lucide-react';
import AppleCard from '../../apple/AppleCard';

interface MaterialOption {
    id: string;
    name: string;
    description?: string;
    features?: string[];
    priceRange?: string;
}

interface MaterialGridProps {
    materials?: MaterialOption[];
    selection?: MaterialOption;
    onSelect?: (item: MaterialOption) => void;
}

export default function MaterialGrid({ materials = [], selection, onSelect }: MaterialGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {materials.map((material: MaterialOption, index: number) => (
                <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <AppleCard
                        hover
                        onClick={() => onSelect?.(material)}
                        className={`cursor-pointer transition-all ${selection?.id === material.id
                            ? 'ring-2 ring-apple-primary shadow-lg'
                            : ''
                            }`}
                    >
                        {/* Image */}
                        <div className="relative h-48 bg-apple-bg-secondary rounded-lg mb-4 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-apple-primary">
                                    {material.id === 'concrete' ? (
                                        <Layers size={40} strokeWidth={1} />
                                    ) : (
                                        <Sparkles size={40} strokeWidth={1} />
                                    )}
                                </div>
                            </div>
                            {selection?.id === material.id && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 right-3 bg-green-500 rounded-full p-2"
                                >
                                    <CheckCircle2 size={24} className="text-white" />
                                </motion.div>
                            )}
                        </div>

                        {/* Content */}
                        <h3 className="apple-heading-3 mb-2">{material.name}</h3>
                        <p className="apple-body-secondary mb-4">{material.description}</p>

                        {/* Features */}
                        <div className="space-y-2 mb-4">
                            {material.features?.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="apple-caption">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Price Range */}
                        {material.priceRange && (
                            <div className="pt-4 border-t border-apple-border">
                                <p className="apple-caption mb-1">Стоимость от:</p>
                                <p className="apple-heading-3 text-apple-primary">
                                    {material.priceRange}
                                </p>
                            </div>
                        )}
                    </AppleCard>
                </motion.div>
            ))}
        </div>
    );
}
