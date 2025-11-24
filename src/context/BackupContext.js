'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const BackupContext = createContext();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function BackupProvider({ children }) {
    const [isBackupEnabled, setIsBackupEnabled] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const getAllData = () => {
        return {
            estimates: JSON.parse(localStorage.getItem('mos-pool-history') || '[]'),
            templates: JSON.parse(localStorage.getItem('mos-pool-templates') || '[]'),
            catalog: JSON.parse(localStorage.getItem('mos-pool-catalog') || '[]'),
            settings: {
                theme: localStorage.getItem('theme'),
                themeAutoSwitch: localStorage.getItem('theme-auto-switch'),
            },
            timestamp: new Date().toISOString(),
            version: '3.0'
        };
    };

    const createBackup = async () => {
        if (!supabase) {
            toast.error('Supabase не настроен');
            return false;
        }

        setIsBackingUp(true);
        try {
            const data = getAllData();
            const fileName = `backup-${Date.now()}.json`;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

            // Upload to Supabase Storage
            const { data: uploadData, error } = await supabase.storage
                .from('backups')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const now = new Date();
            setLastBackup(now);
            localStorage.setItem('last-backup', now.toISOString());
            toast.success('Backup создан успешно');
            return true;
        } catch (error) {
            console.error('Backup error:', error);
            toast.error('Ошибка создания backup');
            return false;
        } finally {
            setIsBackingUp(false);
        }
    };

    const autoBackup = async () => {
        if (!isBackupEnabled || isBackingUp) return;
        await createBackup();
    };

    useEffect(() => {
        // Load backup settings
        const enabled = localStorage.getItem('backup-enabled') === 'true';
        const lastBackupTime = localStorage.getItem('last-backup');

        setIsBackupEnabled(enabled && !!supabase);
        if (lastBackupTime) {
            setLastBackup(new Date(lastBackupTime));
        }

        // Auto-backup every 5 minutes if enabled
        if (enabled && supabase) {
            const interval = setInterval(() => {
                autoBackup();
            }, 5 * 60 * 1000); // 5 minutes

            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const listBackups = async () => {
        if (!supabase) return [];

        try {
            const { data, error } = await supabase.storage
                .from('backups')
                .list('', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('List backups error:', error);
            toast.error('Ошибка загрузки списка backup');
            return [];
        }
    };

    const restoreBackup = async (fileName) => {
        if (!supabase) {
            toast.error('Supabase не настроен');
            return false;
        }

        try {
            // Download backup file
            const { data, error } = await supabase.storage
                .from('backups')
                .download(fileName);

            if (error) throw error;

            const text = await data.text();
            const backup = JSON.parse(text);

            // Restore data
            if (backup.estimates) {
                localStorage.setItem('mos-pool-history', JSON.stringify(backup.estimates));
            }
            if (backup.templates) {
                localStorage.setItem('mos-pool-templates', JSON.stringify(backup.templates));
            }
            if (backup.catalog) {
                localStorage.setItem('mos-pool-catalog', JSON.stringify(backup.catalog));
            }
            if (backup.settings) {
                if (backup.settings.theme) {
                    localStorage.setItem('theme', backup.settings.theme);
                }
                if (backup.settings.themeAutoSwitch) {
                    localStorage.setItem('theme-auto-switch', backup.settings.themeAutoSwitch);
                }
            }

            toast.success('Данные восстановлены из backup');

            // Reload page to apply changes
            setTimeout(() => {
                window.location.reload();
            }, 1000);

            return true;
        } catch (error) {
            console.error('Restore error:', error);
            toast.error('Ошибка восстановления backup');
            return false;
        }
    };

    const deleteBackup = async (fileName) => {
        if (!supabase) return false;

        try {
            const { error } = await supabase.storage
                .from('backups')
                .remove([fileName]);

            if (error) throw error;
            toast.success('Backup удален');
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Ошибка удаления backup');
            return false;
        }
    };

    const toggleBackup = (enabled) => {
        setIsBackupEnabled(enabled && !!supabase);
        localStorage.setItem('backup-enabled', String(enabled));

        if (enabled && supabase) {
            toast.success('Автобэкап включен');
            createBackup(); // Create initial backup
        } else {
            toast.info('Автобэкап выключен');
        }
    };

    const downloadLocalBackup = () => {
        const data = getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mos-pool-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup скачан');
    };

    const uploadLocalBackup = async (file) => {
        try {
            const text = await file.text();
            const backup = JSON.parse(text);

            // Validate backup structure
            if (!backup.version || !backup.timestamp) {
                throw new Error('Неверный формат backup файла');
            }

            // Restore data
            if (backup.estimates) {
                localStorage.setItem('mos-pool-history', JSON.stringify(backup.estimates));
            }
            if (backup.templates) {
                localStorage.setItem('mos-pool-templates', JSON.stringify(backup.templates));
            }
            if (backup.catalog) {
                localStorage.setItem('mos-pool-catalog', JSON.stringify(backup.catalog));
            }

            toast.success('Backup загружен успешно');
            setTimeout(() => window.location.reload(), 1000);
            return true;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Ошибка загрузки backup');
            return false;
        }
    };

    return (
        <BackupContext.Provider value={{
            isBackupEnabled,
            lastBackup,
            isBackingUp,
            supabaseConfigured: !!supabase,
            createBackup,
            listBackups,
            restoreBackup,
            deleteBackup,
            toggleBackup,
            downloadLocalBackup,
            uploadLocalBackup
        }}>
            {children}
        </BackupContext.Provider>
    );
}

export function useBackup() {
    const context = useContext(BackupContext);
    if (!context) {
        throw new Error('useBackup must be used within BackupProvider');
    }
    return context;
}
