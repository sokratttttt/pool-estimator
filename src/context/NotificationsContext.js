'use client';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NotificationsContext = createContext();

const MAX_NOTIFICATIONS = 5;

export function NotificationsProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    // Add notification
    const addNotification = useCallback(({
        message,
        type = 'info', // info, success, warning, error
        duration = 5000,
        action
    }) => {
        const id = Date.now().toString() + Math.random();

        const notification = {
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
    }, []);

    // Remove notification
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const success = useCallback((message, options = {}) => {
        return addNotification({ message, type: 'success', ...options });
    }, [addNotification]);

    const error = useCallback((message, options = {}) => {
        return addNotification({ message, type: 'error', duration: 7000, ...options });
    }, [addNotification]);

    const warning = useCallback((message, options = {}) => {
        return addNotification({ message, type: 'warning', ...options });
    }, [addNotification]);

    const info = useCallback((message, options = {}) => {
        return addNotification({ message, type: 'info', ...options });
    }, [addNotification]);

    const value = useMemo(() => ({
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
