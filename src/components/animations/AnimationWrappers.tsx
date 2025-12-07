import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimationProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition'> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
}

interface SlideInProps extends AnimationProps {
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
}

interface ScaleInProps extends AnimationProps {
    initialScale?: number;
}

interface StaggerProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'variants'> {
    children: React.ReactNode;
    staggerDelay?: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const directionOffsets: Record<Direction, { x?: number; y?: number }> = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
};

/**
 * Fade in animation component
 */
export function FadeIn({ children, delay = 0, duration = 0.3, ...props }: AnimationProps) {
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
export function SlideIn({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.3,
    distance = 20,
    ...props
}: SlideInProps) {
    const getOffset = (dir: Direction): { x?: number; y?: number } => {
        const base = directionOffsets[dir];
        const multiplier = distance / 20;
        return {
            x: base.x ? base.x * multiplier : undefined,
            y: base.y ? base.y * multiplier : undefined
        };
    };

    const offset = getOffset(direction);

    return (
        <motion.div
            initial={{ opacity: 0, ...offset }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...offset }}
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
export function ScaleIn({ children, delay = 0, duration = 0.3, initialScale = 0.9, ...props }: ScaleInProps) {
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
export function Stagger({ children, staggerDelay = 0.05, ...props }: StaggerProps) {
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
export function StaggerItem({ children, ...props }: { children: React.ReactNode } & HTMLMotionProps<'div'>) {
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
export function PageTransition({ children, ...props }: { children: React.ReactNode } & HTMLMotionProps<'div'>) {
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
