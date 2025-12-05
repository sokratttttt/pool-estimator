'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { NotificationsContextType, Notification, NotificationType, NotificationAction, NotificationOptions } from '@/types/notifications';

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const MAX_NOTIFICATIONS = 5;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Remove notification
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Add notification
    const addNotification = useCallback(({
        message,
        type = 'info',
        duration = 5000,
        action
    }: {
        message: string;
        type?: NotificationType;
        duration?: number;
        action?: NotificationAction;
    }): string => {
        const id = Date.now().toString() + Math.random();

        const notification: Notification = {
            id,
            message,
            type,
            duration,
            action,
            createdAt: new Date()
        };

        setNotifications(prev => {
            const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
            return updated;
        });

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, [removeNotification]);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const success = useCallback((message: string, options: NotificationOptions = {}): string => {
        return addNotification({ message, type: 'success', ...options });
    }, [addNotification]);

    const error = useCallback((message: string, options: NotificationOptions = {}): string => {
        return addNotification({ message, type: 'error', duration: 7000, ...options });
    }, [addNotification]);

    const warning = useCallback((message: string, options: NotificationOptions = {}): string => {
        return addNotification({ message, type: 'warning', ...options });
    }, [addNotification]);

    const info = useCallback((message: string, options: NotificationOptions = {}): string => {
        return addNotification({ message, type: 'info', ...options });
    }, [addNotification]);

    const value: NotificationsContextType = useMemo(() => ({
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        success,
        error,
        warning,
        info
    }), [notifications, addNotification, removeNotification, clearNotifications, success, error, warning, info]);

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationsProvider');
    }
    return context;
}
