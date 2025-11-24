'use client';
import { useState, useEffect } from 'react';
import { useEstimate } from '@/context/EstimateContext';
import { filtrationOptions as defaultOptions } from '@/data/filtration';
import { Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import CatalogImporter from '../CatalogImporter';
import OptionCard from '../premium/OptionCard';
import { motion } from 'framer-motion';

export default function FiltrationStep() {
    const { selection, updateSelection, catalog } = useEstimate();
    const [turnoverTime, setTurnoverTime] = useState(4); // Default 4 hours (standard for private pools)

    // Merge catalog data if available
    const displayOptions = (catalog?.filtration && catalog.filtration.length > 0)
        ? catalog.filtration
        : defaultOptions;

    // Calculate required flow rate
    // Volume is in m3. Flow = Volume / Time
    const volume = selection.dimensions?.volume || 0;
    const requiredFlow = volume > 0 ? Math.ceil(volume / turnoverTime) : 0;

    const handleSelect = (item) => {
        if (selection.filtration?.id === item.id) {
            updateSelection('filtration', null);
        } else {
            updateSelection('filtration', item);
        }
    };

    const turnoverOptions = [
        { value: 4, label: '4 часа', desc: 'Высокая нагрузка (Общественный)' },
        { value: 6, label: '6 часов', desc: 'Средняя нагрузка (Частный)' },
        { value: 8, label: '8 часов', desc: 'Низкая нагрузка' },
        { value: 12, label: '12 часов', desc: 'Эконом' },
        { value: 24, label: '24 часа', desc: 'Минимум' },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Фильтрация</h2>
                    <p className="text-slate-500 dark:text-slate-400">Подбор оборудования очистки воды</p>
                </motion.div>
                <CatalogImporter type="filtration" />
            </div>

            {/* Smart Calculator Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-100 dark:border-slate-600 rounded-2xl p-6 shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Расчет производительности</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Время водообмена</label>
                                <div className="flex flex-wrap gap-2">
                                    {turnoverOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setTurnoverTime(opt.value)}
                                            className={`px-3 py-2 text-xs rounded-lg border transition-all ${turnoverTime === opt.value
                                                ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-cyan-300'
                                                }`}
                                            title={opt.desc}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-600 shadow-sm">
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Объем бассейна</div>
                                    <div className="font-bold text-slate-900 dark:text-white text-lg">{volume.toFixed(1)} м³</div>
                                </div>
                                <div className="h-10 w-px bg-slate-200 dark:bg-slate-600"></div>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Требуемый поток</div>
                                    <div className="font-bold text-cyan-600 dark:text-cyan-400 text-xl">{requiredFlow} м³/ч</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Equipment List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayOptions.map((item, index) => {
                    // Smart Suggestion Logic
                    const flow = item.flowRate || 0;
                    const isRecommended = flow >= requiredFlow && flow <= requiredFlow * 2.5;
                    const isTooWeak = flow < requiredFlow;

                    let badge = null;
                    if (isRecommended) badge = "Рекомендуем";
                    if (isTooWeak) badge = "Слабая мощность";

                    return (
                        <OptionCard
                            key={item.id}
                            title={item.name}
                            description={item.description || `Производительность: ${item.flowRate} м³/ч`}
                            price={item.price}
                            image="⚙️"
                            selected={selection.filtration?.id === item.id}
                            onClick={() => handleSelect(item)}
                            badge={badge}
                            delay={index * 0.05}
                        />
                    );
                })}
            </div>
        </div>
    );
}

