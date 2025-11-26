'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw } from 'lucide-react';
import AppleButton from './apple/AppleButton';
import { supabase } from '@/lib/supabase';

export default function VersionChecker() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [latestVersion, setLatestVersion] = useState(null);
    const [releaseNotes, setReleaseNotes] = useState('');
    const [isElectron, setIsElectron] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [updateProgress, setUpdateProgress] = useState(null);
    const [currentVersion, setCurrentVersion] = useState('1.0.0');

    useEffect(() => {
        const compareVersions = (v1, v2) => {
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
                    setUpdateAvailable(true);
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

        // Check if running in Electron
        const inElectron = typeof window !== 'undefined' && window.electron;
        setIsElectron(inElectron);

        // Get current version from Electron
        if (inElectron && window.electron.getAppVersion) {
            window.electron.getAppVersion().then(version => {
                setCurrentVersion(version);
            });
        }

        // Check version on mount and periodically
        checkVersion();
        const interval = setInterval(checkVersion, 5 * 60 * 1000); // Check every 5 minutes

        // Listen for Electron updater events
        if (inElectron && window.electron.onUpdateStatus) {
            window.electron.onUpdateStatus(({ type, data }) => {
                console.log('Update status:', type, data);

                switch (type) {
                    case 'update-available':
                        setLatestVersion(data.version);
                        setReleaseNotes(data.releaseNotes || 'Доступна новая версия приложения');
                        setUpdateAvailable(true);
                        setShowModal(true);
                        break;
                    case 'download-progress':
                        setUpdateProgress(data.percent);
                        break;
                    case 'update-downloaded':
                        setUpdateProgress(100);
                        break;
                    case 'error':
                        console.error('Update error:', data);
                        break;
                }
            });
        }

        return () => clearInterval(interval);
    }, [currentVersion]);

    const handleUpdate = () => {
        if (isElectron && window.electron.downloadUpdate) {
            window.electron.downloadUpdate();
        } else {
            // Fallback for web version - reload page
            window.location.reload();
        }
    };

    const handleInstallUpdate = () => {
        if (isElectron && window.electron.quitAndInstall) {
            window.electron.quitAndInstall();
        }
    };

    if (!updateAvailable || !showModal) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-apple-surface border border-apple-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                                <Download size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Новая версия доступна</h3>
                                <p className="text-sm text-apple-text-secondary">
                                    Версия {latestVersion}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-apple-text-tertiary hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-apple-text-secondary mb-2">Что нового:</p>
                        <div className="bg-apple-bg-secondary rounded-lg p-3 text-sm text-apple-text-primary">
                            {releaseNotes}
                        </div>
                    </div>

                    {updateProgress !== null && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-apple-text-secondary">Загрузка обновления</span>
                                <span className="text-sm font-medium text-cyan-bright">
                                    {Math.round(updateProgress)}%
                                </span>
                            </div>
                            <div className="h-2 bg-apple-bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${updateProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {updateProgress === 100 ? (
                            <AppleButton
                                variant="primary"
                                onClick={handleInstallUpdate}
                                icon={<RefreshCw size={18} />}
                                className="flex-1"
                            >
                                Установить и перезапустить
                            </AppleButton>
                        ) : (
                            <>
                                <AppleButton
                                    variant="primary"
                                    onClick={handleUpdate}
                                    icon={<Download size={18} />}
                                    className="flex-1"
                                    disabled={updateProgress !== null}
                                >
                                    {updateProgress !== null ? 'Загрузка...' : 'Обновить сейчас'}
                                </AppleButton>
                                <AppleButton
                                    variant="secondary"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                >
                                    Позже
                                </AppleButton>
                            </>
                        )}
                    </div>

                    <p className="text-xs text-apple-text-tertiary text-center mt-4">
                        Текущая версия: {currentVersion}
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
