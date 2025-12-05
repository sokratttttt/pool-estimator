export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
    label: string;
    onClick: () => void;
}

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration: number;
    action?: NotificationAction;
    createdAt: Date;
}

export interface NotificationOptions {
    duration?: number;
    action?: NotificationAction;
}

export interface NotificationsContextType {
    notifications: Notification[];
    addNotification: (options: {
        message: string;
        type?: NotificationType;
        duration?: number;
        action?: NotificationAction;
    }) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    success: (message: string, options?: NotificationOptions) => string;
    error: (message: string, options?: NotificationOptions) => string;
    warning: (message: string, options?: NotificationOptions) => string;
    info: (message: string, options?: NotificationOptions) => string;
}
