'use client';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function FiltrationCalculator({
    turnoverTime,
    setTurnoverTime,
    turnoverOptions,
    volume,
    requiredFlow
}) {
    return (
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
    );
}
