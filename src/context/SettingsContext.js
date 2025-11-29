'use client';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const SettingsContext = createContext();

const SETTINGS_STORAGE_KEY = 'mos-pool-settings';

const DEFAULT_SETTINGS = {
    // Display
    compactMode: false,
    showPrices: true,
    showImages: true,

    // Behavior
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    confirmBeforeDelete: true,

    // Notifications
    enableNotifications: true,
    enableSounds: false,

    // Export
    defaultExportFormat: 'xlsx',
    includeLogoInExport: true,

    // Advanced
    enableAnimations: true,
    enableDebugMode: false,
    maxHistorySize: 1000
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
            try {
                setSettings(prev => ({
                    ...prev,
                    ...JSON.parse(saved)
                }));
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    // Update single setting
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Update multiple settings
    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings
        }));
    }, []);

    // Reset to defaults
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    // Get setting value
    const getSetting = useCallback((key) => {
        return settings[key];
    }, [settings]);

    const value = useMemo(() => ({
        settings,
        updateSetting,
        updateSettings,
        resetSettings,
        getSetting
    }), [settings, updateSetting, updateSettings, resetSettings, getSetting]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
