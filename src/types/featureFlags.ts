export interface FeatureFlags {
    // UI Features
    enableDarkMode: boolean;
    enableNotifications: boolean;
    enableAnimations: boolean;

    // Business Features
    enableTemplates: boolean;
    enableExport: boolean;
    enableWhatsApp: boolean;
    enablePDFGeneration: boolean;

    // Advanced Features
    enableOfflineMode: boolean;
    enableAnalytics: boolean;
    enableAutoSave: boolean;

    // Beta Features
    enableAIAssistant: boolean;
    enableVoiceInput: boolean;
    enableCollaboration: boolean;
}

export interface FeatureFlagsContextType {
    flags: FeatureFlags;
    isEnabled: (flagName: keyof FeatureFlags) => boolean;
    enableFeature: (flagName: keyof FeatureFlags) => void;
    disableFeature: (flagName: keyof FeatureFlags) => void;
    toggleFeature: (flagName: keyof FeatureFlags) => void;
    setFeatures: (newFlags: Partial<FeatureFlags>) => void;
    resetFlags: () => void;
}
