import { motion } from 'framer-motion';

/**
 * Fade in animation component
 */
export function FadeIn({ children, delay = 0, duration = 0.3, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, delay }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Slide in from direction
 */
export function SlideIn({ children, direction = 'up', delay = 0, duration = 0.3, distance = 20, ...props }) {
    const directions = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance }
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...directions[direction] }}
            transition={{ duration, delay }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Scale in animation
 */
export function ScaleIn({ children, delay = 0, duration = 0.3, initialScale = 0.9, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: initialScale }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: initialScale }}
            transition={{ duration, delay }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Stagger children animation wrapper
 */
export function Stagger({ children, staggerDelay = 0.05, ...props }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Individual stagger item
 */
export function StaggerItem({ children, ...props }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Slide and fade wrapper for page transitions
 */
export function PageTransition({ children, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
