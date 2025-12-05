'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Accordion component for collapsible content
 */
export function AccordionItem({
    title,
    children,
    isOpen,
    onToggle,
    icon
}: any) {
    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={onToggle}
                className="
                    w-full flex items-center justify-between
                    px-4 py-4
                    text-left
                    hover:bg-white/5
                    transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500
                "
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-cyan-400" aria-hidden="true">{icon}</span>}
                    <span className="font-medium text-white">{title}</span>
                </div>

                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                >
                    <ChevronDown size={20} className="text-white/60" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 text-white/80">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface AccordionProps {
    items: any[];
    allowMultiple?: boolean;
    defaultOpen?: number[];
}

export default function Accordion({
    items,
    allowMultiple = false,
    defaultOpen = []
}: AccordionProps) {
    const [openItems, setOpenItems] = useState<number[]>(defaultOpen);

    const toggleItem = (index: number) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        } else {
            setOpenItems(prev =>
                prev.includes(index) ? [] : [index]
            );
        }
    };

    return (
        <div className="bg-white/5 rounded-lg overflow-hidden">
            {items.map((item: any, index: number) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    icon={item.icon}
                    isOpen={openItems.includes(index)}
                    onToggle={() => toggleItem(index)}
                >
                    {item.content}
                </AccordionItem>
            ))}
        </div>
    );
}
