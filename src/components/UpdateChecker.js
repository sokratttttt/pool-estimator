'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export default function UpdateChecker() {
    const [checking, setChecking] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [updateStatus, setUpdateStatus] = useState('');
    const [currentVersion, setCurrentVersion] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Проверяем есть ли electron API
    const isElectron = typeof window !== 'undefined' && window.electron;

    useEffect(() => {
        if (!isElectron) return;

        // Получаем текущую версию
        window.electron.getAppVersion().then(version => {
            setCurrentVersion(version);
        });

        // Слушаем статусы обновления
        window.electron.onUpdateStatus((data) => {
            setUpdateStatus(data.text);
            if (data.percent !== null) {
                setDownloadProgress(data.percent);
            }

            // Показываем уведомления
            if (data.text.includes('Найдено обновление')) {
                setUpdateAvailable(true);
                setShowModal(true);
                toast.info('Доступно обновление!');
            } else if (data.text.includes('Обновление загружено')) {
                toast.success('Обновление готово к установке!');
            }
        });
    }, [isElectron]);

    const handleCheckForUpdates = async () => {
        if (!isElectron) {
            toast.error('Функция доступна только в desktop приложении');
            return;
        }

        setChecking(true);
        try {
            const result = await window.electron.checkForUpdates();

            if (result.available) {
                setUpdateAvailable(true);
                setUpdateInfo(result);
                setShowModal(true);
                toast.info(`Доступна новая версия ${result.version}`);
            } else {
                toast.success('Вы используете последнюю версию');
            }
        } catch (error) {
            toast.error('Ошибка при проверке обновлений');
        } finally {
            setChecking(false);
        }
    };

    const handleInstallUpdate = async () => {
        if (!isElectron) return;

        try {
            await window.electron.installUpdate();
            toast.info('Перезапуск приложения...');
        } catch (error) {
            toast.error('Ошибка при установке обновления');
        }
    };

    // Если не electron app, не показываем кнопку
    if (!isElectron) {
        return null;
    }

    return (
        <>
            {/* Кнопка проверки обновлений */}
            <button
                onClick={handleCheckForUpdates}
                disabled={checking}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Текущая версия: ${currentVersion}`}
            >
                {checking ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Проверка...</span>
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Обновления</span>
                    </>
                )}
            </button>

            {/* Модалка с информацией об обновлении */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            {/* Заголовок */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {updateAvailable ? (
                                        <div className="p-2 rounded-lg bg-cyan-bright/20">
                                            <Download className="w-6 h-6 text-cyan-bright" />
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded-lg bg-green-500/20">
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {updateAvailable ? 'Доступно обновление' : 'Актуальная версия'}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            Версия {updateInfo?.version || currentVersion}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Статус */}
                            {updateStatus && (
                                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm text-slate-300">{updateStatus}</p>

                                    {/* Прогресс загрузки */}
                                    {downloadProgress > 0 && downloadProgress < 100 && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>Загрузка</span>
                                                <span>{Math.round(downloadProgress)}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${downloadProgress}%` }}
                                                    className="h-full bg-gradient-to-r from-cyan-bright to-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Действия */}
                            <div className="flex gap-2">
                                {updateStatus.includes('Перезапустите') ? (
                                    <button
                                        onClick={handleInstallUpdate}
                                        className="flex-1 px-4 py-2 rounded-lg bg-cyan-bright hover:bg-cyan-bright/90 text-white font-medium transition-all"
                                    >
                                        Установить сейчас
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                                    >
                                        Позже
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
