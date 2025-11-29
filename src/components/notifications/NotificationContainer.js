'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext';
import Alert from '../common/Alert';

/**
 * Global notification container
 * Displays notifications from NotificationsContext
 */
export default function NotificationContainer() {
    const { notifications, removeNotification } = useNotifications();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="pointer-events-auto"
                    >
                        <Alert
                            variant={notification.type}
                            message={notification.message}
                            onClose={() => removeNotification(notification.id)}
                            action={notification.action}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
