export interface AppSettings {
    // Display
    compactMode: boolean;
    showPrices: boolean;
    showImages: boolean;

    // Behavior
    autoSave: boolean;
    autoSaveInterval: number;
    confirmBeforeDelete: boolean;

    // Notifications
    enableNotifications: boolean;
    enableSounds: boolean;

    // Export
    defaultExportFormat: 'xlsx' | 'pdf' | 'csv';
    includeLogoInExport: boolean;

    // Advanced
    enableAnimations: boolean;
    enableDebugMode: boolean;
    maxHistorySize: number;
}

export interface SettingsContextType {
    settings: AppSettings;
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    resetSettings: () => void;
    getSetting: <K extends keyof AppSettings>(key: K) => AppSettings[K];
}
