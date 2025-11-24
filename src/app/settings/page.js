'use client';
import { Settings as SettingsIcon, LogIn, LogOut, User } from 'lucide-react';
import PDFSettings from '@/components/PDFSettings';
import UpdateChecker from '@/components/UpdateChecker';
import AppleCard from '@/components/apple/AppleCard';
import AppleButton from '@/components/apple/AppleButton';
import { motion } from 'framer-motion';
import { useSync } from '@/context/SyncContext';
import { useState } from 'react';
import LoginPage from '@/components/LoginPage';

export default function SettingsPage() {
    const { user, logout } = useSync();
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
                    Настройте PDF экспорт и другие параметры приложения
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
