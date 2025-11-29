'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/**
 * Tooltip component with positioning
 */
export default function Tooltip({
    children,
    content,
    position = 'top', // top, bottom, left, right
    delay = 200
}) {
    const [isVisible, setIsVisible] = useState(false);
    let timeout;

    const showTooltip = () => {
        timeout = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}

            <AnimatePresence>
                {isVisible && content && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className={`
                            absolute ${positions[position]}
                            z-50 px-3 py-2
                            bg-slate-900 text-white text-sm
                            rounded-lg shadow-lg
                            border border-white/10
                            whitespace-nowrap
                            pointer-events-none
                        `}
                        role="tooltip"
                    >
                        {content}
                        {/* Arrow */}
                        <div className={`
                            absolute w-2 h-2 bg-slate-900 border-white/10
                            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r' : ''}
                            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l' : ''}
                            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t' : ''}
                            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b' : ''}
                            rotate-45
                        `} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
