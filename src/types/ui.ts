export type UITheme = 'dark' | 'light';

export interface UIContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    theme: UITheme;
    setTheme: (theme: UITheme) => void;
    toggleTheme: () => void;
    compactMode: boolean;
    setCompactMode: (compact: boolean) => void;
    toggleCompactMode: () => void;
}
