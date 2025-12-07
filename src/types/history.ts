export type HistoryActionType =
    | 'estimate_created'
    | 'estimate_updated'
    | 'estimate_deleted'
    | 'client_added'
    | 'client_updated'
    | 'project_created'
    | 'calculation_performed'
    | 'export_generated'
    | 'import_performed'
    | 'settings_changed'
    | 'backup_created'
    | 'restore_performed';

import { ClientInfo, ProjectData } from './index';

export interface HistoryEstimate {
    id: string;
    created_at: string;
    updated_at?: string;
    createdAt?: string; // legacy
    updatedAt?: string; // legacy
    name: string;
    description?: string;
    status: 'draft' | 'in_progress' | 'completed' | 'archived' | string;
    total: number;
    user_id?: string;
    author?: string;
    selection?: Record<string, unknown>;
    items?: unknown[];
    client_info?: ClientInfo;
    clientInfo?: ClientInfo; // legacy compatibility
    project_data?: ProjectData;
    [key: string]: unknown;
}

export interface HistoryAction<T = unknown> {
    type: HistoryActionType;
    entityId: string;
    entityType: string;
    before?: T;
    after?: T;
    changes?: string[]; // list of changed fields
    timestamp: Date;
    userId: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface HistoryEntry {
    id: string;
    action: HistoryAction;
    description?: string;
    tags: string[];
    isUndone: boolean;
    canRedo: boolean;
    metadata: Record<string, unknown>;
}

export interface HistorySnapshot {
    id: string;
    name: string;
    description?: string;
    timestamp: Date;
    data: {
        estimates: Record<string, unknown>;
        clients: Record<string, unknown>;
        projects: Record<string, unknown>;
        settings: Record<string, unknown>;
    };
    size: number;
    isAuto: boolean; // automatic snapshot
}

export interface HistoryFilters {
    types?: HistoryActionType[];
    userIds?: string[];
    entityIds?: string[];
    dateRange?: { from: Date; to: Date };
    searchText?: string;
    tags?: string[];
    excludeUndone?: boolean;
}

export interface TimelineData {
    // Define structure based on usage or mock it for now
    events: HistoryEntry[];
    groups: Record<string, HistoryEntry[]>;
}

export interface DiffItem {
    path: string[];
    lhs: unknown;
    rhs: unknown;
    kind: 'N' | 'D' | 'E' | 'A';
}

export interface DifferenceReport {
    // Define structure based on usage or mock it for now
    diffs: DiffItem[];
    summary: string;
}

export interface ExportResult {
    success: boolean;
    url?: string;
    error?: string;
}

export interface ImportResult {
    success: boolean;
    count: number;
    errors?: string[];
}

export interface CompressionResult {
    originalSize: number;
    compressedSize: number;
    ratio: number;
}

export interface RestoreResult {
    success: boolean;
    error?: string;
}

export interface HistoryContextType {
    // State
    entries: HistoryEntry[];
    snapshots: HistorySnapshot[];
    currentIndex: number; // for undo/redo
    maxEntries: number;
    maxSnapshots: number;
    isRecording: boolean;

    // Undo/Redo
    canUndo: boolean;
    canRedo: boolean;
    undoStack: HistoryEntry[];
    redoStack: HistoryEntry[];

    // Main operations
    recordAction: <T>(
        action: Omit<HistoryAction<T>, 'timestamp' | 'userId'>,
        description?: string
    ) => string; // returns entryId

    undo: () => HistoryEntry | null;
    redo: () => HistoryEntry | null;
    clearHistory: (filters?: HistoryFilters) => Promise<number>;

    // Snapshots
    createSnapshot: (
        name: string,
        options?: {
            description?: string;
            isAuto?: boolean;
            includeData?: boolean;
        }
    ) => Promise<string>;

    restoreSnapshot: (snapshotId: string) => Promise<RestoreResult>;
    deleteSnapshot: (snapshotId: string) => Promise<boolean>;

    // Search and Filter
    search: (query: string, filters?: HistoryFilters) => HistoryEntry[];
    filter: (filters: HistoryFilters) => HistoryEntry[];
    getTimeline: (startDate: Date, endDate: Date) => TimelineData;

    // Analytics
    getStats: () => {
        totalActions: number;
        byType: Record<HistoryActionType, number>;
        byUser: Record<string, number>;
        byEntity: Record<string, number>;
        undoRate: number; // percentage of undone actions
    };

    // Comparison
    compareEntries: (entryId1: string, entryId2: string) => DifferenceReport;
    compareSnapshots: (snapshotId1: string, snapshotId2: string) => DifferenceReport;

    // Export
    exportHistory: (
        format: 'json' | 'csv' | 'html',
        filters?: HistoryFilters
    ) => Promise<ExportResult>;

    importHistory: (data: unknown) => Promise<ImportResult>;

    // Automation
    startAutoRecording: () => void;
    stopAutoRecording: () => void;
    createAutoSnapshot: (interval: number) => void; // interval in minutes

    // Utils
    getLastAction: (entityId?: string) => HistoryEntry | null;
    getActionChain: (entryId: string) => HistoryEntry[]; // chain of related actions
    compressHistory: () => Promise<CompressionResult>;

    // Legacy support methods (from original JS file)
    estimates: HistoryEstimate[];
    saveEstimate: (name: string, selection: unknown, items: unknown, total: number) => string;
    updateEstimate: (id: string, updates: Partial<HistoryEstimate>) => void;
    deleteEstimate: (id: string) => Promise<void>;
    getEstimate: (id: string) => HistoryEstimate | undefined;
    duplicateEstimate: (id: string) => string | null;

    // Events (optional)
    onActionRecorded?: (entry: HistoryEntry) => void;
    onUndo?: (entry: HistoryEntry) => void;
    onRedo?: (entry: HistoryEntry) => void;
    onSnapshotCreated?: (snapshot: HistorySnapshot) => void;
}
