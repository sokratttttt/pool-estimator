'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import PriceDisplay from './PriceDisplay';
import ProgressIndicator from './ProgressIndicator';

import { useState } from 'react';
import { Settings, X, Moon, Sun, Cloud, LayoutTemplate } from 'lucide-react';
import TemplateManager from '../TemplateManager';
import CloudSync from '../CloudSync';
import ThemeToggle from '../ThemeToggle';

export default function PremiumHeader({ currentStep, totalSteps, totalPrice, steps }) {
    const currentStepNumber = steps.findIndex(s => s.id === currentStep) + 1;
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState('templates'); // templates, cloud, theme

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 h-20 z-50 glass border-b border-white/20"
                style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}
            >
                <div className="h-full max-w-[2000px] mx-auto px-6 md:px-12 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="relative w-40 h-12">
                            <Image
                                src="/images/logo.svg"
                                alt="MOS-POOL"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>

                    {/* Progress */}
                    <div className="hidden md:block">
                        <ProgressIndicator
                            current={currentStepNumber}
                            total={totalSteps}
                            steps={steps}
                        />
                    </div>

                    {/* Right Side: Price & Settings */}
                    <div className="flex items-center gap-4">
                        <PriceDisplay value={totalPrice} />

                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                        >
                            <Settings size={24} />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Настройки</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={24} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'templates'
                                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50 dark:bg-cyan-900/10'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                            >
                                <LayoutTemplate size={18} />
                                Шаблоны
                            </button>
                            <button
                                onClick={() => setActiveTab('cloud')}
                                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'cloud'
                                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50 dark:bg-cyan-900/10'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                            >
                                <Cloud size={18} />
                                Синхронизация
                            </button>
                            <button
                                onClick={() => setActiveTab('theme')}
                                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'theme'
                                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50 dark:bg-cyan-900/10'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                            >
                                <Moon size={18} />
                                Тема
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 min-h-[400px]">
                            {activeTab === 'templates' && (
                                <TemplateManager onClose={() => setShowSettings(false)} embedded />
                            )}
                            {activeTab === 'cloud' && (
                                <CloudSync />
                            )}
                            {activeTab === 'theme' && (
                                <div className="flex flex-col items-center justify-center h-full gap-6">
                                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                                        Выберите тему оформления интерфейса. Темная тема снижает нагрузку на глаза при работе в условиях низкой освещенности.
                                    </p>
                                    <ThemeToggle />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
