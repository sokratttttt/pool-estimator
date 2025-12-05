export interface ThemeColors {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    [key: string]: string;
}

export type ThemeName = 'navy' | 'dark' | 'blue';

export interface ThemeContextType {
    currentTheme: ThemeName;
    theme: ThemeName; // alias for currentTheme
    colors: ThemeColors;
    themes: Record<ThemeName, ThemeColors>;
    setTheme: (themeName: ThemeName) => void;
    setColor: (colorName: string, colorValue: string) => void;
    resetTheme: () => void;
    toggleTheme: () => void;
}
