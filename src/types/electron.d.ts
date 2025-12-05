/**
 * Electron API Type Definitions
 * Types for the Electron preload script exposed APIs
 */

export interface UpdateStatusData {
    type: 'checking-for-update' | 'update-available' | 'update-not-available' | 'error' | 'download-progress' | 'update-downloaded';
    data?: {
        version?: string;
        releaseDate?: string;
        releaseNotes?: string;
        percent?: number;
        bytesPerSecond?: number;
        total?: number;
        transferred?: number;
        message?: string;
    };
}

export interface ElectronAPI {
    getAppVersion: () => Promise<string>;
    onUpdateStatus: (callback: (data: UpdateStatusData) => void) => void;
    checkForUpdates: () => Promise<{ available: boolean; version?: string; success?: boolean; error?: string }>;
    installUpdate: () => Promise<void>;
    downloadUpdate: () => Promise<void>;
    quitAndInstall: () => Promise<void>;
}

declare global {
    interface Window {
        electron?: ElectronAPI;
    }
}

