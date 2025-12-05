'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Popover component
 */
interface PopoverProps {
    trigger?: React.ReactNode;
    content?: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    offset?: number;
    className?: string;
}

export default function Popover({
    trigger,
    content,
    placement = 'bottom',
    offset = 8,
    className = ''
}: PopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !triggerRef.current) return;

        const updatePosition = () => {
            if (!triggerRef.current) return;

            const triggerRect = triggerRef.current.getBoundingClientRect();
            const popoverRect = popoverRef.current?.getBoundingClientRect() || { width: 0, height: 0 };

            let top = 0;
            let left = 0;

            switch (placement) {
                case 'top':
                    top = triggerRect.top - popoverRect.height - offset;
                    left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
                    break;
                case 'bottom':
                    top = triggerRect.bottom + offset;
                    left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
                    break;
                case 'left':
                    top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
                    left = triggerRect.left - popoverRect.width - offset;
                    break;
                case 'right':
                    top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
                    left = triggerRect.right + offset;
                    break;
            }

            setPosition({ top, left });
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, placement, offset]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="inline-block"
            >
                {trigger}
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Popover */}
                            <motion.div
                                ref={popoverRef}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className={`
                                    fixed z-50
                                    bg-gradient-to-br from-navy-deep/95 to-slate-900/95
                                    backdrop-blur-xl
                                    border border-white/10
                                    rounded-lg shadow-xl
                                    ${className}
                                `}
                                style={{
                                    top: `${position.top}px`,
                                    left: `${position.left}px`
                                }}
                            >
                                {content}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
