'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw } from 'lucide-react';
import AppleButton from './apple/AppleButton';
import { supabase } from '@/lib/supabase';
import type { UpdateStatusData } from '@/types/electron';

// Текущая версия приложения (синхронизировать с package.json)
const APP_VERSION = '2.2.0';

export default function VersionChecker() {
    // const [updateAvailable, setUpdateAvailable] = useState(false); // Removed unused
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [releaseNotes, setReleaseNotes] = useState('');
    const [isElectron, setIsElectron] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [updateProgress, setUpdateProgress] = useState<number | null>(null);
    const [currentVersion, setCurrentVersion] = useState(APP_VERSION);

    useEffect(() => {
        // Check if running in Electron
        const inElectron = typeof window !== 'undefined' && !!window.electron;
        setIsElectron(inElectron);

        if (inElectron && window.electron?.getAppVersion) {
            window.electron.getAppVersion().then((ver: string) => {
                setCurrentVersion(ver);
            });
        }

        const compareVersions = (v1: string, v2: string): number => {
            const parts1 = v1.split('.').map(Number);
            const parts2 = v2.split('.').map(Number);

            for (let i = 0; i < 3; i++) {
                if (parts1[i] > parts2[i]) return 1;
                if (parts1[i] < parts2[i]) return -1;
            }
            return 0;
        };

        const checkVersion = async () => {
            try {
                // Check version from Supabase
                const { data, error } = await supabase
                    .from('app_version')
                    .select('version, release_notes, force_update')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error) {
                    console.error('Version check error:', error);
                    return;
                }

                if (data && compareVersions(data.version, currentVersion) > 0) {
                    setLatestVersion(data.version);
                    setReleaseNotes(data.release_notes || 'Доступна новая версия');
                    // setUpdateAvailable(true);
                    setShowModal(true);

                    // If running in Electron, trigger auto-update check
                    if (typeof window !== 'undefined' && window.electron && window.electron.checkForUpdates) {
                        window.electron.checkForUpdates();
                    }
                }
            } catch (error) {
                console.error('Failed to check version:', error);
            }
        };

        // Check version on mount and periodically
        checkVersion();
        const interval = setInterval(checkVersion, 5 * 60 * 1000); // Check every 5 minutes

        // Listen for Electron updater events
        if (inElectron && window.electron?.onUpdateStatus) {
            window.electron.onUpdateStatus(({ type, data }: UpdateStatusData) => {
                switch (type) {
                    case 'update-available':
                        if (data?.version) {
                            setLatestVersion(data.version);
                            setReleaseNotes(data.releaseNotes || 'Доступна новая версия приложения');
                            // setUpdateAvailable(true);
                            setShowModal(true);
                        }
                        break;
                    case 'download-progress':
                        if (data?.percent !== undefined) {
                            setUpdateProgress(data.percent);
                        }
                        break;
                    case 'update-downloaded':
                        setUpdateProgress(100);
                        break;
                    case 'error':
                        break;
                }
            });
        }

        return () => clearInterval(interval);
    }, [currentVersion]);

    const handleUpdate = () => {
        if (isElectron && window.electron?.downloadUpdate) {
            window.electron.downloadUpdate();
        } else {
            window.open('https://pool-estimator.ru/download', '_blank');
        }
    };

    const handleInstallUpdate = () => {
        if (isElectron && window.electron?.quitAndInstall) {
            window.electron.quitAndInstall();
        }
    };

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[#00b4d8]/10 rounded-xl">
                                        <RefreshCw className="text-[#00b4d8]" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Доступно обновление
                                        </h3>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            Версия {latestVersion}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Что нового:
                                </h4>
                                <div className="text-sm text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                                    {releaseNotes}
                                </div>
                            </div>

                            {updateProgress !== null ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">Загрузка...</span>
                                        <span className="font-medium text-[#00b4d8]">{Math.round(updateProgress)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-[#00b4d8]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${updateProgress}%` }}
                                        />
                                    </div>
                                    {updateProgress >= 100 && (
                                        <p className="text-sm text-center text-green-600 dark:text-green-400 mt-2">
                                            Загрузка завершена
                                        </p>
                                    )}
                                </div>
                            ) : null}

                            <div className="mt-6 flex gap-3">
                                <AppleButton
                                    variant="secondary"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 justify-center"
                                >
                                    Позже
                                </AppleButton>
                                {updateProgress === null ? (
                                    <AppleButton
                                        variant="primary"
                                        onClick={handleUpdate}
                                        className="flex-1 justify-center"
                                    >
                                        <Download size={18} className="mr-2" />
                                        Обновить
                                    </AppleButton>
                                ) : updateProgress >= 100 ? (
                                    <AppleButton
                                        variant="primary"
                                        onClick={handleInstallUpdate}
                                        className="flex-1 justify-center"
                                    >
                                        <RefreshCw size={18} className="mr-2" />
                                        Установить
                                    </AppleButton>
                                ) : (
                                    <AppleButton
                                        variant="primary"
                                        disabled
                                        className="flex-1 justify-center opacity-50 cursor-not-allowed"
                                    >
                                        <Download size={18} className="mr-2" />
                                        Загрузка...
                                    </AppleButton>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
