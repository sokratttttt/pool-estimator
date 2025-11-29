'use client';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const FeatureFlagsContext = createContext();

// Default feature flags
const DEFAULT_FLAGS = {
    // UI Features
    enableDarkMode: true,
    enableNotifications: true,
    enableAnimations: true,

    // Business Features
    enableTemplates: true,
    enableExport: true,
    enableWhatsApp: true,
    enablePDFGeneration: true,

    // Advanced Features
    enableOfflineMode: false,
    enableAnalytics: true,
    enableAutoSave: true,

    // Beta Features
    enableAIAssistant: false,
    enableVoiceInput: false,
    enableCollaboration: false
};

export function FeatureFlagsProvider({ children, initialFlags = {} }) {
    const [flags, setFlags] = useState({
        ...DEFAULT_FLAGS,
        ...initialFlags
    });

    // Check if feature is enabled
    const isEnabled = useCallback((flagName) => {
        return flags[flagName] === true;
    }, [flags]);

    // Enable feature
    const enableFeature = useCallback((flagName) => {
        setFlags(prev => ({ ...prev, [flagName]: true }));
    }, []);

    // Disable feature
    const disableFeature = useCallback((flagName) => {
        setFlags(prev => ({ ...prev, [flagName]: false }));
    }, []);

    // Toggle feature
    const toggleFeature = useCallback((flagName) => {
        setFlags(prev => ({ ...prev, [flagName]: !prev[flagName] }));
    }, []);

    // Set multiple flags
    const setFeatures = useCallback((newFlags) => {
        setFlags(prev => ({ ...prev, ...newFlags }));
    }, []);

    // Reset to defaults
    const resetFlags = useCallback(() => {
        setFlags(DEFAULT_FLAGS);
    }, []);

    const value = useMemo(() => ({
        flags,
        isEnabled,
        enableFeature,
        disableFeature,
        toggleFeature,
        setFeatures,
        resetFlags
    }), [flags, isEnabled, enableFeature, disableFeature, toggleFeature, setFeatures, resetFlags]);

    return (
        <FeatureFlagsContext.Provider value={value}>
            {children}
        </FeatureFlagsContext.Provider>
    );
}

export function useFeatureFlags() {
    const context = useContext(FeatureFlagsContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
    }
    return context;
}

// Convenience hook to check single feature
export function useFeature(flagName) {
    const { isEnabled } = useFeatureFlags();
    return isEnabled(flagName);
}
