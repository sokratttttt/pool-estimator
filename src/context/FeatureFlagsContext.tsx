'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { FeatureFlagsContextType, FeatureFlags } from '@/types/featureFlags';

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

// Default feature flags
const DEFAULT_FLAGS: FeatureFlags = {
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

interface FeatureFlagsProviderProps {
    children: React.ReactNode;
    initialFlags?: Partial<FeatureFlags>;
}

export function FeatureFlagsProvider({ children, initialFlags = {} }: FeatureFlagsProviderProps) {
    const [flags, setFlags] = useState<FeatureFlags>(() => ({
        ...DEFAULT_FLAGS,
        ...initialFlags
    } as FeatureFlags));

    // Check if feature is enabled
    const isEnabled = useCallback((flagName: keyof FeatureFlags): boolean => {
        return flags[flagName] === true;
    }, [flags]);

    // Enable feature
    const enableFeature = useCallback((flagName: keyof FeatureFlags) => {
        setFlags(prev => ({ ...prev, [flagName]: true }));
    }, []);

    // Disable feature
    const disableFeature = useCallback((flagName: keyof FeatureFlags) => {
        setFlags(prev => ({ ...prev, [flagName]: false }));
    }, []);

    // Toggle feature
    const toggleFeature = useCallback((flagName: keyof FeatureFlags) => {
        setFlags(prev => ({ ...prev, [flagName]: !prev[flagName] }));
    }, []);

    // Set multiple flags
    const setFeatures = useCallback((newFlags: Partial<FeatureFlags>) => {
        setFlags(prev => ({ ...prev, ...newFlags } as FeatureFlags));
    }, []);

    // Reset to defaults
    const resetFlags = useCallback(() => {
        setFlags(DEFAULT_FLAGS);
    }, []);

    const value: FeatureFlagsContextType = useMemo(() => ({
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
export function useFeature(flagName: keyof FeatureFlags): boolean {
    const { isEnabled } = useFeatureFlags();
    return isEnabled(flagName);
}
