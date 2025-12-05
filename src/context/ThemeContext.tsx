'use client';
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ThemeContextType, ThemeColors, ThemeName } from '@/types/theme';

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = 'mos-pool-theme';

// Color themes
const THEMES: Record<ThemeName, ThemeColors> = {
    navy: {
        name: 'Navy Deep',
        primary: '#0a1628',
        secondary: '#1e293b',
        accent: '#06b6d4',
        text: '#ffffff'
    },
    dark: {
        name: 'Dark',
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#3b82f6',
        text: '#ffffff'
    },
    blue: {
        name: 'Ocean Blue',
        primary: '#0c4a6e',
        secondary: '#075985',
        accent: '#0ea5e9',
        text: '#ffffff'
    }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ThemeName>('navy');
    const [customColors, setCustomColors] = useState<Record<string, string>>({});

    // Load theme from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
            try {
                const { theme, colors } = JSON.parse(saved);
                if (theme && THEMES[theme as ThemeName]) {
                    setCurrentTheme(theme);
                }
                setCustomColors(colors || {});
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        }
    }, []);

    // Save theme to localStorage
    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
            theme: currentTheme,
            colors: customColors
        }));
    }, [currentTheme, customColors]);

    // Get current theme colors
    const colors = useMemo<ThemeColors>(() => ({
        ...THEMES[currentTheme],
        ...customColors
    }), [currentTheme, customColors]);

    // Change theme
    const setTheme = useCallback((themeName: ThemeName) => {
        if (THEMES[themeName]) {
            setCurrentTheme(themeName);
        }
    }, []);

    // Set custom color
    const setColor = useCallback((colorName: string, colorValue: string) => {
        setCustomColors(prev => ({
            ...prev,
            [colorName]: colorValue
        }));
    }, []);

    // Reset to default theme
    const resetTheme = useCallback(() => {
        setCurrentTheme('navy');
        setCustomColors({});
    }, []);

    // Toggle between themes
    const toggleTheme = useCallback(() => {
        const themeNames: ThemeName[] = ['navy', 'dark', 'blue'];
        const currentIndex = themeNames.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        setCurrentTheme(themeNames[nextIndex]);
    }, [currentTheme]);

    const value: ThemeContextType = useMemo(() => ({
        currentTheme,
        theme: currentTheme, // alias
        colors,
        themes: THEMES,
        setTheme,
        setColor,
        resetTheme,
        toggleTheme
    }), [currentTheme, colors, setTheme, setColor, resetTheme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
