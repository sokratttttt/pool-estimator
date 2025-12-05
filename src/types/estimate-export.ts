export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html' | 'print';

export interface ExportOptions {
    format: ExportFormat;
    template?: string; // template ID
    include?: {
        items: boolean;
        calculations: boolean;
        clientInfo: boolean;
        companyInfo: boolean;
        notes: boolean;
        signatures: boolean;
    };
    styling?: {
        theme: 'light' | 'dark' | 'corporate';
        colors: {
            primary: string;
            secondary: string;
            accent: string;
        };
        logo?: boolean;
    };
    compression?: boolean;
    password?: string; // for protected PDF
}

export interface ExportProgress {
    estimateId: string;
    format: ExportFormat;
    progress: number; // 0-100
    status: 'preparing' | 'generating' | 'compressing' | 'finished' | 'error';
    message?: string;
    startedAt: Date;
}

export interface ExportResult {
    success: boolean;
    data?: {
        filename: string;
        size: number;
        mimeType: string;
        downloadUrl?: string;
        expiresAt?: Date; // for temporary links
    };
    error?: string;
    warnings?: string[];
}

export interface ExportTemplate {
    id: string;
    name: string;
    description: string;
    format: ExportFormat;
    previewUrl?: string;
    defaultOptions: ExportOptions;
}

export interface BatchExportResult {
    successful: string[];
    failed: string[];
    results: Record<string, ExportResult>;
}

export interface ExportHistoryFilters {
    format?: ExportFormat;
    startDate?: Date;
    endDate?: Date;
    status?: 'success' | 'error';
}

export interface ExportHistoryEntry {
    id: string;
    estimateId: string;
    format: ExportFormat;
    status: 'success' | 'error';
    timestamp: Date;
    result?: ExportResult;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface UseEstimateExportReturn {
    // State
    isExporting: boolean;
    exportQueue: ExportProgress[];
    recentExports: ExportResult[];
    templates: ExportTemplate[];

    // Main methods
    exportEstimate: (
        estimateId: string | string[],
        options: ExportOptions
    ) => Promise<ExportResult | ExportResult[]>;

    exportToAllFormats: (
        estimateId: string,
        baseOptions?: Omit<ExportOptions, 'format'>
    ) => Promise<Record<ExportFormat, ExportResult>>;

    batchExport: (
        estimateIds: string[],
        options: ExportOptions
    ) => Promise<BatchExportResult>;

    // Templates
    createTemplate: (
        name: string,
        options: ExportOptions
    ) => Promise<ExportTemplate>;

    updateTemplate: (
        templateId: string,
        updates: Partial<ExportTemplate>
    ) => Promise<ExportTemplate>;

    deleteTemplate: (templateId: string) => Promise<boolean>;

    // History
    getExportHistory: (filters?: ExportHistoryFilters) => ExportHistoryEntry[];
    clearHistory: (olderThan?: Date) => Promise<number>;

    // Queue management
    cancelExport: (estimateId: string) => boolean;
    pauseExports: () => void;
    resumeExports: () => void;

    // Utils
    estimateSize: (estimateId: string, format: ExportFormat) => Promise<number>;
    validateExport: (estimateId: string, options: ExportOptions) => ValidationResult;

    // Specific exports (Legacy support)
    exportContract: (clientInfo: any, total: number, items: any[]) => Promise<void>;
    exportProposal: (items: any[], total: number, clientInfo: any, estimateId?: string) => Promise<void>;
    shareViaWhatsApp: (clientInfo: any, total: number, items: any[]) => Promise<void>;

    // Events
    onExportStart?: (progress: ExportProgress) => void;
    onExportProgress?: (progress: ExportProgress) => void;
    onExportComplete?: (result: ExportResult) => void;
    onExportError?: (error: Error) => void;
}
