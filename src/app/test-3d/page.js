'use client';
import { useState } from 'react';
import Pool3DViewer from '@/components/3d/Pool3DViewer';
import AppleButton from '@/components/apple/AppleButton';
import { Box, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Test page for 3D visualization
 * Navigate to /test-3d to see the demo
 */
export default function Test3DPage() {
    const [poolData, setPoolData] = useState({
        length: 10,
        width: 5,
        depth: 1.5,
        shape: 'rectangular',
        material: 'concrete'
    });
    const [lighting, setLighting] = useState('day');

    return (
        <div className="min-h-screen bg-navy-deep">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/calculator">
                        <AppleButton variant="secondary" icon={<ArrowLeft size={20} />}>
                            Назад
                        </AppleButton>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Box className="text-cyan-bright" />
                            3D Визуализация - Тест
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Phase 1: Basic Scene Setup
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-white font-semibold mb-4">Параметры бассейна</h2>

                    {/* Dimensions */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">
                                Длина (м)
                            </label>
                            <input
                                type="number"
                                value={poolData.length}
                                onChange={(e) => setPoolData({ ...poolData, length: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">
                                Ширина (м)
                            </label>
                            <input
                                type="number"
                                value={poolData.width}
                                onChange={(e) => setPoolData({ ...poolData, width: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">
                                Глубина (м)
                            </label>
                            <input
                                type="number"
                                value={poolData.depth}
                                onChange={(e) => setPoolData({ ...poolData, depth: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Shape and Material */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">
                                Форма
                            </label>
                            <select
                                value={poolData.shape}
                                onChange={(e) => setPoolData({ ...poolData, shape: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            >
                                <option value="rectangular">Прямоугольная</option>
                                <option value="oval">Овальная</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">
                                Материал
                            </label>
                            <select
                                value={poolData.material}
                                onChange={(e) => setPoolData({ ...poolData, material: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            >
                                <option value="concrete">Бетон (серый)</option>
                                <option value="composite">Композит (синий)</option>
                                <option value="liner">Лайнер (голубой)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">
                                Освещение
                            </label>
                            <select
                                value={lighting}
                                onChange={(e) => setLighting(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            >
                                <option value="day">☀️ День</option>
                                <option value="sunset">🌅 Закат</option>
                                <option value="night">🌙 Ночь</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Viewer */}
            <div className="h-[calc(100vh-220px)]">
                <Pool3DViewer poolData={poolData} lighting={lighting} />
            </div>

            {/* Info */}
            <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm max-w-xs">
                <p className="font-semibold mb-2">Управление:</p>
                <ul className="text-slate-300 space-y-1">
                    <li>• ЛКМ + движение - вращение</li>
                    <li>• Колесико - приближение</li>
                    <li>• ПКМ + движение - панорама</li>
                </ul>
            </div>
        </div>
    );
}
