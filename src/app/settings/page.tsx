'use client';
import { Settings as SettingsIcon, LogIn, LogOut, User, Zap, Keyboard } from 'lucide-react';
import PDFSettings from '@/components/PDFSettings';
import UpdateChecker from '@/components/UpdateChecker';
import AppleCard from '@/components/apple/AppleCard';
import AppleButton from '@/components/apple/AppleButton';
import { CompactModeToggle } from '@/components/settings/CompactModeToggle';
import { motion } from 'framer-motion';
import { useSync } from '@/context/SyncContext';
import { useSettings } from '@/context/SettingsContext';
import { useState } from 'react';
import LoginPage from '@/components/LoginPage';

export default function SettingsPage() {
    const { user, logout } = useSync();
    const { settings, updateSetting } = useSettings();
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <SettingsIcon size={32} className="text-cyan-bright" />
                    <h1 className="text-3xl font-bold text-white">Настройки</h1>
                </div>
                <p className="text-gray-400">
                    Настройте приложение под ваш рабочий процесс
                </p>
            </motion.div>

            {/* Authentication Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6"
            >
                <AppleCard variant="flat">
                    <h2 className="apple-heading-2 mb-4">Авторизация</h2>

                    {user ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                                    <User size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{user.email}</p>
                                    <p className="text-sm text-apple-text-secondary">Вы авторизованы</p>
                                </div>
                            </div>
                            <AppleButton
                                variant="secondary"
                                icon={<LogOut size={18} />}
                                onClick={logout}
                            >
                                Выйти
                            </AppleButton>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium mb-1">Не авторизован</p>
                                <p className="text-sm text-apple-text-secondary">
                                    Войдите для синхронизации данных между устройствами
                                </p>
                            </div>
                            <AppleButton
                                variant="primary"
                                icon={<LogIn size={18} />}
                                onClick={() => setShowLogin(true)}
                            >
                                Войти
                            </AppleButton>
                        </div>
                    )}
                </AppleCard>
            </motion.div>

            {/* Professional Settings Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mb-6"
            >
                <AppleCard variant="flat">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={20} className="text-yellow-400" />
                        <h2 className="apple-heading-2">Производительность</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Compact Mode */}
                        <CompactModeToggle />

                        {/* Reduced Motion */}
                        <div className="flex items-center justify-between py-3 border-t border-white/10">
                            <div>
                                <p className="text-white font-medium">Уменьшить анимации</p>
                                <p className="text-sm text-apple-text-secondary">
                                    Для слабых компьютеров или при работе с большими данными
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!settings.enableAnimations}
                                    onChange={(e) => updateSetting('enableAnimations', !e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                        </div>

                        {/* Auto Save */}
                        <div className="flex items-center justify-between py-3 border-t border-white/10">
                            <div>
                                <p className="text-white font-medium">Автосохранение</p>
                                <p className="text-sm text-apple-text-secondary">
                                    Автоматически сохранять изменения каждые 30 секунд
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoSave}
                                    onChange={(e) => updateSetting('autoSave', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                        </div>
                    </div>
                </AppleCard>
            </motion.div>

            {/* Keyboard Shortcuts Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.09 }}
                className="mb-6"
            >
                <AppleCard variant="flat">
                    <div className="flex items-center gap-2 mb-4">
                        <Keyboard size={20} className="text-cyan-bright" />
                        <h2 className="apple-heading-2">Горячие клавиши</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+K</kbd>
                            <span className="text-sm text-gray-300">Команды</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+S</kbd>
                            <span className="text-sm text-gray-300">Сохранить</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+E</kbd>
                            <span className="text-sm text-gray-300">Excel</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+P</kbd>
                            <span className="text-sm text-gray-300">PDF</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">F2</kbd>
                            <span className="text-sm text-gray-300">Редактировать</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+T</kbd>
                            <span className="text-sm text-gray-300">Шаблоны</span>
                        </div>
                    </div>

                    <p className="text-sm text-apple-text-secondary mt-4">
                        Нажмите <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Ctrl+/</kbd> для полного списка
                    </p>
                </AppleCard>
            </motion.div>

            {/* Updates Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <AppleCard variant="flat">
                    <h2 className="apple-heading-2 mb-4">Обновления приложения</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium mb-1">Проверка обновлений</p>
                            <p className="text-sm text-apple-text-secondary">
                                Убедитесь, что используете последнюю версию приложения
                            </p>
                        </div>
                        <UpdateChecker />
                    </div>
                </AppleCard>
            </motion.div>

            {/* PDF Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <PDFSettings />
            </motion.div>

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-md w-full">
                        <button
                            onClick={() => setShowLogin(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            Закрыть
                        </button>
                        <LoginPage onSuccess={() => setShowLogin(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

