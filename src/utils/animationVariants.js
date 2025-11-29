/**
 * Common animation variants for Framer Motion
 */

// Fade animations
export const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

// Scale animations
export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
};

export const scaleInBounce = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.8 }
};

// Slide animations
export const slideInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
};

export const slideInRight = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
};

// Stagger container
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Stagger item
export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Modal animations
export const modalBackdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export const modalContent = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, scale: 0.95, y: 20 }
};

// Drawer animations (mobile)
export const drawerFromBottom = {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { y: '100%' }
};

export const drawerFromRight = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: '100%' }
};

// List animations
export const listContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const listItem = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

// Hover and tap animations
export const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2 }
};

export const tapScale = {
    scale: 0.98
};

// Button press animation
export const buttonPress = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
};

// Card hover animation
export const cardHover = {
    whileHover: {
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.2 }
    }
};

// Transition presets
export const transitions = {
    fast: { duration: 0.15 },
    normal: { duration: 0.3 },
    slow: { duration: 0.5 },
    spring: { type: 'spring', stiffness: 300, damping: 30 },
    springBouncy: { type: 'spring', stiffness: 500, damping: 25 }
};
