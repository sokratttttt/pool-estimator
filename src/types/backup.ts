export type BackupType = 'full' | 'incremental' | 'differential';
export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'validating';
export type BackupLocation = 'local' | 'cloud' | 'both';

export interface BackupData {
    id: string;
    name: string;
    description?: string;
    type: BackupType;
    status: BackupStatus;
    location: BackupLocation;

    // Metadata
    createdAt: Date;
    completedAt?: Date;
    size: number; // in bytes
    checksum: string;
    version: string; // app version

    // Included data
    includes: {
        estimates: boolean;
        clients: boolean;
        projects: boolean;
        templates: boolean;
        settings: boolean;
        media: boolean;
    };

    // Statistics
    stats?: {
        estimateCount: number;
        clientCount: number;
        projectCount: number;
        totalSize: number;
    };

    // Paths/Links
    localPath?: string;
    cloudUrl?: string;
    encryptionKey?: string; // encrypted key
}

export interface RestoreOptions {
    mode: 'full' | 'selective';
    include?: {
        estimates?: boolean;
        clients?: boolean;
        projects?: boolean;
        templates?: boolean;
        settings?: boolean;
        media?: boolean;
    };
    conflictResolution: 'overwrite' | 'skip' | 'rename';
    createRestorePoint?: boolean;
    onProgress?: (progress: number, message: string) => void;
}

export interface RestoreResult {
    success: boolean;
    restored: {
        estimates: number;
        clients: number;
        projects: number;
        templates: number;
    };
    errors: string[];
    warnings: string[];
    totalTime: number; // in seconds
}

export interface BackupSchedule {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // "HH:MM" in UTC
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    keepLast: number; // how many backups to keep
    autoCleanup: boolean;
    notifyOnSuccess: boolean;
    notifyOnFailure: boolean;
}

export interface ExportResult {
    success: boolean;
    url?: string;
    error?: string;
}

export interface ImportOptions {
    validate?: boolean;
    restoreImmediately?: boolean;
}

export interface IntegrityCheckResult {
    valid: boolean;
    issues: string[];
}

export interface BackupContextType {
    // State
    backups: BackupData[];
    isBackingUp: boolean;
    isRestoring: boolean;
    lastBackup: BackupData | null;
    lastRestore: RestoreResult | null;
    schedule: BackupSchedule;
    error: string | null;
    warning: string | null;
    supabaseConfigured: boolean; // Added this from existing context

    // Statistics
    stats: {
        totalBackups: number;
        totalSize: number;
        lastSuccessful: Date | null;
        successRate: number; // 0-100
        nextScheduled: Date | null;
    };

    // Main operations
    createBackup: (
        type?: BackupType,
        options?: {
            name?: string;
            description?: string;
            location?: BackupLocation;
            include?: Partial<BackupData['includes']>;
        }
    ) => Promise<BackupData | null>; // Changed return type to match implementation possibility

    restoreBackup: (
        backupId: string,
        options?: RestoreOptions
    ) => Promise<RestoreResult>;

    deleteBackup: (backupId: string, deleteFromCloud?: boolean) => Promise<boolean>;

    validateBackup: (backupId: string) => Promise<{
        valid: boolean;
        issues: string[];
        canRestore: boolean;
    }>;

    // Schedule management
    updateSchedule: (schedule: Partial<BackupSchedule>) => Promise<void>;
    runScheduledBackup: () => Promise<BackupData | null>;
    cancelCurrentBackup: () => boolean;

    // Restore points
    createRestorePoint: (description?: string) => Promise<string>; // returns ID
    restoreToPoint: (pointId: string) => Promise<RestoreResult>;

    // Cleanup
    cleanupOldBackups: (keepLast?: number) => Promise<{
        deleted: number;
        freedSpace: number;
    }>;

    // Import/Export
    exportBackupInfo: (backupId: string) => Promise<ExportResult>;
    importBackup: (file: File, options?: ImportOptions) => Promise<BackupData | null>;

    // Utils
    getBackupSize: (includeCloud?: boolean) => Promise<number>;
    estimateBackupTime: (type: BackupType) => number; // in seconds
    checkIntegrity: (backupId: string) => Promise<IntegrityCheckResult>;

    toggleBackup: (enabled: boolean) => void; // Added from existing context
    downloadLocalBackup: () => void; // Added from existing context
    uploadLocalBackup: (file: File) => Promise<boolean>; // Added from existing context
    listBackups: () => Promise<any[]>; // Added from existing context

    // Events (optional)
    onBackupStart?: (backup: BackupData) => void;
    onBackupProgress?: (backupId: string, progress: number) => void;
    onBackupComplete?: (backup: BackupData) => void;
    onRestoreComplete?: (result: RestoreResult) => void;
}
