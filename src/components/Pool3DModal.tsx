'use client';
import { useState, useRef } from 'react';
import { X, Maximize2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Pool3DViewer from './3d/Pool3DViewer';
import { toast } from 'sonner';

/**
 * Pool3DModal - Modal window with 3D pool visualization
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close callback
 * @param {object} poolData - Pool configuration from estimate
 */
import type { Dimensions } from '@/types';

interface PoolData extends Dimensions {
    shape: string;
}

interface Pool3DModalProps {
    isOpen: boolean;
    onClose: () => void;
    poolData: PoolData;
}

export default function Pool3DModal({ isOpen, onClose, poolData }: Pool3DModalProps) {
    const [lighting, setLighting] = useState('day');
    const viewerRef = useRef<{ takeScreenshot: (filename?: string) => void } | null>(null);

    const handleScreenshot = () => {
        const filename = `pool-${poolData.shape}-${poolData.length}x${poolData.width}.png`;
        viewerRef.current?.takeScreenshot(filename);
        toast.success('Скриншот сохранён!');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-8 lg:inset-16 bg-navy-deep rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Maximize2 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-semibold text-lg">
                                        3D Визуализация бассейна
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        {poolData.shape === 'oval' ? 'Овальный' : 'Прямоугольный'} бассейн
                                        {' '}{poolData.length}×{poolData.width}×{poolData.depth}м
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Lighting control */}
                                <select
                                    value={lighting}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLighting(e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                >
                                    <option value="day">☀️ День</option>
                                    <option value="sunset">🌅 Закат</option>
                                    <option value="night">🌙 Ночь</option>
                                </select>

                                {/* Screenshot button */}
                                <button
                                    onClick={handleScreenshot}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Сохранить скриншот"
                                >
                                    <Camera size={20} className="text-white" />
                                </button>

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* 3D Viewer */}
                        <div className="flex-1 relative">
                            <Pool3DViewer ref={viewerRef} poolData={poolData} lighting={lighting} />
                        </div>

                        {/* Footer with controls hint */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <div className="flex items-center justify-between text-sm text-slate-400">
                                <div className="flex gap-6">
                                    <span>🖱️ ЛКМ - вращение</span>
                                    <span>🖱️ ПКМ - панорамирование</span>
                                    <span>🖱️ Колесико - масштаб</span>
                                </div>
                                <div className="text-xs opacity-70">
                                    Three.js • React Three Fiber
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
