'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [autoSwitch, setAutoSwitch] = useState(true);

    useEffect(() => {
        // Load saved preferences
        const savedTheme = localStorage.getItem('theme');
        const savedAutoSwitch = localStorage.getItem('theme-auto-switch');

        if (savedAutoSwitch !== null) {
            setAutoSwitch(savedAutoSwitch === 'true');
        }

        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else if (savedAutoSwitch !== 'false') {
            // Auto-switch based on time
            updateThemeByTime();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (autoSwitch) {
            updateThemeByTime();

            // Update every hour
            const interval = setInterval(updateThemeByTime, 60 * 60 * 1000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSwitch]);

    const updateThemeByTime = () => {
        const hour = new Date().getHours();
        // Dark theme from 20:00 to 7:00
        const newTheme = (hour >= 20 || hour < 7) ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    const applyTheme = (newTheme) => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // Disable auto-switch when manually toggled
        setAutoSwitch(false);
        localStorage.setItem('theme-auto-switch', 'false');
    };

    const toggleAutoSwitch = () => {
        const newAutoSwitch = !autoSwitch;
        setAutoSwitch(newAutoSwitch);
        localStorage.setItem('theme-auto-switch', String(newAutoSwitch));

        if (newAutoSwitch) {
            updateThemeByTime();
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, autoSwitch, toggleAutoSwitch }}>
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
