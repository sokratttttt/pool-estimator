'use client';
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { SettingsContextType, AppSettings } from '@/types/settings';

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_STORAGE_KEY = 'mos-pool-settings';

const DEFAULT_SETTINGS: AppSettings = {
    // Display
    compactMode: false,
    showPrices: true,
    showImages: true,

    // Behavior
    autoSave: true,
    autoSaveInterval: 30000,
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

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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

    // Apply settings to document root for CSS selectors
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const html = document.documentElement;

        // Apply compact mode
        if (settings.compactMode) {
            html.setAttribute('data-compact', 'true');
        } else {
            html.removeAttribute('data-compact');
        }

        // Apply reduced motion preference
        if (settings.enableAnimations === false) {
            html.setAttribute('data-reduced-motion', 'true');
        } else {
            html.removeAttribute('data-reduced-motion');
        }
    }, [settings.compactMode, settings.enableAnimations]);

    // Update single setting
    const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Update multiple settings
    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
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
    const getSetting = useCallback(<K extends keyof AppSettings>(key: K): AppSettings[K] => {
        return settings[key];
    }, [settings]);

    const value: SettingsContextType = useMemo(() => ({
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
