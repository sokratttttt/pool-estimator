import type { EstimateItem } from './estimate-utils';

// Data types for saving
export interface EstimateSaveData {
    id?: string; // for updating existing
    clientId: string;
    projectId?: string;
    title: string;
    description?: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
    version: number;

    // Estimate data
    items: EstimateItem[];
    calculations: {
        subtotal: number;
        discount?: number;
        tax: number;
        total: number;
        deposit?: number;
    };

    // Metadata
    metadata: {
        createdBy: string;
        createdAt: Date;
        updatedBy: string;
        updatedAt: Date;
        tags: string[];
        notes?: string;
        attachments?: string[]; // Attachment IDs
    };

    // Settings
    settings: {
        currency: 'RUB' | 'USD' | 'EUR';
        language: 'ru' | 'en';
        vatIncluded: boolean;
        vatRate: number;
        showPrices: boolean; // show prices to client
        validUntil?: Date; // estimate validity
    };
}

// Save options
export interface SaveOptions {
    mode: 'create' | 'update' | 'auto-save' | 'publish';
    notify?: boolean; // notify client
    createBackup?: boolean; // create backup
    versionComment?: string; // version comment
    force?: boolean; // ignore conflicts
}

// Save result
export interface SaveResult {
    success: boolean;
    data?: {
        estimateId: string;
        version: number;
        savedAt: Date;
        url?: string; // view URL
        shareToken?: string; // share token
    };
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    warnings?: string[];
}

// Draft
export interface DraftData {
    id: string;
    estimateId?: string; // if draft of existing estimate
    data: Partial<EstimateSaveData>;
    name: string;
    lastModified: Date;
    autoSaved: boolean;
}

// Version conflict
export interface VersionConflict {
    localVersion: number;
    serverVersion: number;
    changes: string[]; // what changed
    resolved?: boolean;
}

// Published estimate
export interface PublishedEstimate {
    id: string;
    url: string;
    publishedAt: Date;
    expiresAt?: Date;
}

export interface PublishOptions {
    expiresInDays?: number;
    password?: string;
    allowDownload?: boolean;
}

export interface EstimateVersion {
    version: number;
    createdAt: Date;
    createdBy: string;
    comment?: string;
    data: EstimateSaveData;
}

export interface DifferenceReport {
    additions: string[];
    deletions: string[];
    modifications: string[];
}

// Hook return type
export interface UseEstimateSaveReturn {
    // State
    isSaving: boolean;
    isAutoSaving: boolean;
    lastSave: Date | null;
    lastError: string | null;
    saveCount: number;
    drafts: DraftData[];

    // Conflicts
    conflicts: VersionConflict[];
    hasUnresolvedConflicts: boolean;

    // Main methods
    saveEstimate: (
        data: EstimateSaveData,
        options?: SaveOptions
    ) => Promise<SaveResult>;

    saveDraft: (
        data: Partial<EstimateSaveData>,
        draftName?: string
    ) => Promise<{ draftId: string; savedAt: Date }>;

    loadDraft: (draftId: string) => DraftData | null;
    deleteDraft: (draftId: string) => Promise<boolean>;

    autoSave: (data: EstimateSaveData) => Promise<void>;
    stopAutoSave: () => void;

    publishEstimate: (
        estimateId: string,
        options?: PublishOptions
    ) => Promise<PublishedEstimate>;

    // Versioning
    getVersions: (estimateId: string) => Promise<EstimateVersion[]>;
    restoreVersion: (estimateId: string, version: number) => Promise<EstimateSaveData>;
    compareVersions: (estimateId: string, version1: number, version2: number) => DifferenceReport;

    // Conflicts
    resolveConflict: (conflictId: string, resolution: 'keep_local' | 'use_server' | 'merge') => Promise<void>;
    ignoreConflict: (conflictId: string) => void;

    // Utils
    getSaveStats: () => {
        totalSaves: number;
        successfulSaves: number;
        failedSaves: number;
        averageSaveTime: number;
        lastSaveSize: number; // in bytes
    };

    // Legacy / Template support
    saveTemplate: (name: string, description: string, data: any) => Promise<void>;

    // Events (optional in interface, implemented as callbacks or effects)
    onSaveStart?: () => void;
    onSaveComplete?: (result: SaveResult) => void;
    onSaveError?: (error: Error) => void;
    onConflictDetected?: (conflict: VersionConflict) => void;
}
