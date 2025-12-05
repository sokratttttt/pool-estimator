'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import {
    BackupContextType,
    BackupData,
    BackupSchedule,
    RestoreResult,
    BackupType,
    BackupLocation,
    RestoreOptions,
    ImportOptions
} from '@/types/backup';

const BackupContext = createContext<BackupContextType | null>(null);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase: SupabaseClient | null = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function BackupProvider({ children }: { children: React.ReactNode }) {
    const [backups, setBackups] = useState<BackupData[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [lastBackup, setLastBackup] = useState<BackupData | null>(null);
    const [lastRestore, setLastRestore] = useState<RestoreResult | null>(null);
    const [schedule, setSchedule] = useState<BackupSchedule>({
        enabled: false,
        frequency: 'daily',
        time: '00:00',
        keepLast: 5,
        autoCleanup: true,
        notifyOnSuccess: true,
        notifyOnFailure: true
    });
    const [error, setError] = useState<string | null>(null);
    const [warning, _setWarning] = useState<string | null>(null);
    const [stats, setStats] = useState<BackupContextType['stats']>({
        totalBackups: 0,
        totalSize: 0,
        lastSuccessful: null,
        successRate: 100,
        nextScheduled: null
    });

    const getAllData = () => {
        if (typeof window === 'undefined') return {};
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

    const createBackup = async (
        type: BackupType = 'full',
        options?: {
            name?: string;
            description?: string;
            location?: BackupLocation;
            include?: Partial<BackupData['includes']>;
        }
    ): Promise<BackupData | null> => {
        if (!supabase) {
            toast.error('Supabase не настроен');
            return null;
        }

        setIsBackingUp(true);
        setError(null);
        try {
            const data = getAllData();
            const timestamp = Date.now();
            const fileName = `backup-${timestamp}.json`;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('backups')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const now = new Date();
            const newBackup: BackupData = {
                id: fileName,
                name: options?.name || `Backup ${now.toLocaleString()}`,
                description: options?.description,
                type,
                status: 'completed',
                location: options?.location || 'cloud',
                createdAt: now,
                completedAt: now,
                size: blob.size,
                checksum: 'mock-checksum', // In real app, calculate hash
                version: '3.0',
                includes: {
                    estimates: true,
                    clients: true,
                    projects: true,
                    templates: true,
                    settings: true,
                    media: false,
                    ...options?.include
                },
                cloudUrl: uploadData?.path
            };

            setLastBackup(newBackup);
            setBackups(prev => [newBackup, ...prev]);
            localStorage.setItem('last-backup', now.toISOString());

            // Update stats
            setStats(prev => ({
                ...prev,
                totalBackups: prev.totalBackups + 1,
                totalSize: prev.totalSize + blob.size,
                lastSuccessful: now
            }));

            toast.success('Backup создан успешно');
            return newBackup;
        } catch (err: any) {
            console.error('Backup error:', err);
            const errorMessage = err.message || 'Ошибка создания backup';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsBackingUp(false);
        }
    };

    const restoreBackup = async (backupId: string, _options?: RestoreOptions): Promise<RestoreResult> => {
        if (!supabase) {
            toast.error('Supabase не настроен');
            return { success: false, restored: { estimates: 0, clients: 0, projects: 0, templates: 0 }, errors: ['Supabase not configured'], warnings: [], totalTime: 0 };
        }

        setIsRestoring(true);
        const startTime = Date.now();
        try {
            // Download backup file
            const { data, error: downloadError } = await supabase.storage
                .from('backups')
                .download(backupId);

            if (downloadError) throw downloadError;

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

            const result: RestoreResult = {
                success: true,
                restored: {
                    estimates: backup.estimates?.length || 0,
                    clients: 0, // Mock
                    projects: 0, // Mock
                    templates: backup.templates?.length || 0
                },
                errors: [],
                warnings: [],
                totalTime: (Date.now() - startTime) / 1000
            };

            setLastRestore(result);
            toast.success('Данные восстановлены из backup');

            // Reload page to apply changes
            setTimeout(() => {
                window.location.reload();
            }, 1000);

            return result;
        } catch (err: any) {
            console.error('Restore error:', err);
            toast.error('Ошибка восстановления backup');
            return {
                success: false,
                restored: { estimates: 0, clients: 0, projects: 0, templates: 0 },
                errors: [err.message || 'Unknown error'],
                warnings: [],
                totalTime: (Date.now() - startTime) / 1000
            };
        } finally {
            setIsRestoring(false);
        }
    };

    const deleteBackup = async (backupId: string, deleteFromCloud: boolean = true): Promise<boolean> => {
        if (!supabase) return false;

        try {
            if (deleteFromCloud) {
                const { error: deleteError } = await supabase.storage
                    .from('backups')
                    .remove([backupId]);

                if (deleteError) throw deleteError;
            }

            setBackups(prev => prev.filter(b => b.id !== backupId));
            toast.success('Backup удален');
            return true;
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error('Ошибка удаления backup');
            return false;
        }
    };

    const listBackups = async () => {
        if (!supabase) return [];

        try {
            const { data, error: listError } = await supabase.storage
                .from('backups')
                .list('', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (listError) throw listError;

            // Map Supabase file objects to BackupData
            const mappedBackups: BackupData[] = (data || []).map(file => ({
                id: file.name,
                name: file.name,
                type: 'full',
                status: 'completed',
                location: 'cloud',
                createdAt: new Date(file.created_at),
                size: file.metadata?.size || 0,
                checksum: '',
                version: '3.0',
                includes: {
                    estimates: true,
                    clients: true,
                    projects: true,
                    templates: true,
                    settings: true,
                    media: false
                }
            }));

            setBackups(mappedBackups);
            return mappedBackups;
        } catch (err: any) {
            console.error('List backups error:', err);
            toast.error('Ошибка загрузки списка backup');
            return [];
        }
    };

    const toggleBackup = (enabled: boolean) => {
        setSchedule(prev => ({ ...prev, enabled }));
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

    const uploadLocalBackup = async (file: File): Promise<boolean> => {
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
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error('Ошибка загрузки backup');
            return false;
        }
    };

    // Auto-backup effect
    useEffect(() => {
        const enabled = localStorage.getItem('backup-enabled') === 'true';
        const lastBackupTime = localStorage.getItem('last-backup');

        setSchedule(prev => ({ ...prev, enabled: enabled && !!supabase }));

        if (lastBackupTime) {
            // Mocking a BackupData object for initial state if we only have time
            // Ideally we should fetch the latest backup details
            setLastBackup({
                id: 'unknown',
                name: 'Last Backup',
                type: 'full',
                status: 'completed',
                location: 'cloud',
                createdAt: new Date(lastBackupTime),
                size: 0,
                checksum: '',
                version: '3.0',
                includes: { estimates: true, clients: true, projects: true, templates: true, settings: true, media: false }
            });
        }

        if (enabled && supabase) {
            const interval = setInterval(() => {
                if (!isBackingUp) {
                    createBackup();
                }
            }, 5 * 60 * 1000); // 5 minutes

            return () => clearInterval(interval);
        }
        return undefined;
    }, [isBackingUp]); // Added isBackingUp dependency to avoid closure staleness if needed, though mostly safe

    // Placeholder implementations for new interface methods
    const validateBackup = async (_backupId: string) => ({ valid: true, issues: [], canRestore: true });
    const updateSchedule = async (newSchedule: Partial<BackupSchedule>) => setSchedule(prev => ({ ...prev, ...newSchedule }));
    const runScheduledBackup = async () => createBackup();
    const cancelCurrentBackup = () => false; // Not implemented
    const createRestorePoint = async (_description?: string) => 'mock-point-id';
    const restoreToPoint = async (_pointId: string) => ({ success: true, restored: { estimates: 0, clients: 0, projects: 0, templates: 0 }, errors: [], warnings: [], totalTime: 0 });
    const cleanupOldBackups = async (_keepLast?: number) => ({ deleted: 0, freedSpace: 0 });
    const exportBackupInfo = async (_backupId: string) => ({ success: true });
    const importBackup = async (file: File, _options?: ImportOptions) => {
        const success = await uploadLocalBackup(file);
        return success ? lastBackup : null;
    };
    const getBackupSize = async (_includeCloud?: boolean) => 0;
    const estimateBackupTime = (_type: BackupType) => 0;
    const checkIntegrity = async (_backupId: string) => ({ valid: true, issues: [] });

    return (
        <BackupContext.Provider value={{
            backups,
            isBackingUp,
            isRestoring,
            lastBackup,
            lastRestore,
            schedule,
            error,
            warning,
            supabaseConfigured: !!supabase,
            stats,
            createBackup,
            restoreBackup,
            deleteBackup,
            validateBackup,
            updateSchedule,
            runScheduledBackup,
            cancelCurrentBackup,
            createRestorePoint,
            restoreToPoint,
            cleanupOldBackups,
            exportBackupInfo,
            importBackup,
            getBackupSize,
            estimateBackupTime,
            checkIntegrity,
            toggleBackup,
            downloadLocalBackup,
            uploadLocalBackup,
            listBackups
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
