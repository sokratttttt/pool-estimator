'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContextMenu({ children, items, onClose }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef(null);
    const targetRef = useRef(null);

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const x = e.clientX;
        const y = e.clientY;

        // Adjust position if menu would go off-screen
        const menuWidth = 200;
        const menuHeight = items.length * 40;
        const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
        const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

        setPosition({ x: adjustedX, y: adjustedY });
        setIsOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
                if (onClose) onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                if (onClose) onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleItemClick = (action) => {
        if (action) action();
        setIsOpen(false);
        if (onClose) onClose();
    };

    return (
        <>
            <div ref={targetRef} onContextMenu={handleContextMenu}>
                {children}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="fixed z-[9999] bg-apple-surface border border-apple-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
                        style={{
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            minWidth: '200px'
                        }}
                    >
                        <div className="py-2">
                            {items.map((item, index) => (
                                item.separator ? (
                                    <div key={index} className="h-px bg-apple-border my-2" />
                                ) : (
                                    <button
                                        key={index}
                                        onClick={() => handleItemClick(item.action)}
                                        disabled={item.disabled}
                                        className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${item.disabled
                                                ? 'opacity-50 cursor-not-allowed'
                                                : item.danger
                                                    ? 'hover:bg-red-500/10 text-red-400'
                                                    : 'hover:bg-apple-bg-secondary text-apple-text-primary'
                                            }`}
                                    >
                                        {item.icon && (
                                            <span className={item.danger ? 'text-red-400' : 'text-apple-text-secondary'}>
                                                {item.icon}
                                            </span>
                                        )}
                                        <span className="flex-1">{item.label}</span>
                                        {item.shortcut && (
                                            <span className="text-xs text-apple-text-tertiary">
                                                {item.shortcut}
                                            </span>
                                        )}
                                    </button>
                                )
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
