'use client';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'mos-pool-theme';

// Color themes
const THEMES = {
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

export function ThemeProvider({ children }) {
    const [currentTheme, setCurrentTheme] = useState('navy');
    const [customColors, setCustomColors] = useState({});

    // Load theme from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
            try {
                const { theme, colors } = JSON.parse(saved);
                setCurrentTheme(theme);
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
    const colors = useMemo(() => ({
        ...THEMES[currentTheme],
        ...customColors
    }), [currentTheme, customColors]);

    // Change theme
    const setTheme = useCallback((themeName) => {
        if (THEMES[themeName]) {
            setCurrentTheme(themeName);
        }
    }, []);

    // Set custom color
    const setColor = useCallback((colorName, colorValue) => {
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

    const value = useMemo(() => ({
        currentTheme,
        colors,
        themes: THEMES,
        setTheme,
        setColor,
        resetTheme
    }), [currentTheme, colors, setTheme, setColor, resetTheme]);

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
