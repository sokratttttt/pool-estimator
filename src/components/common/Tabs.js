'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Tabs component for organizing content
 */
export default function Tabs({
    tabs,
    defaultTab = 0,
    onChange,
    variant = 'default', // default, pills
    className = ''
}) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabChange = (index) => {
        setActiveTab(index);
        onChange?.(index);
    };

    return (
        <div className={className}>
            {/* Tab headers */}
            <div className={`
                flex gap-1
                ${variant === 'pills' ? 'bg-white/5 p-1 rounded-lg' : 'border-b border-white/10'}
            `}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => handleTabChange(index)}
                        className={`
                            relative px-4 py-2 rounded-md
                            font-medium text-sm
                            transition-all duration-200
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                            ${activeTab === index
                                ? 'text-cyan-400'
                                : 'text-white/60 hover:text-white'
                            }
                            ${variant === 'pills' && activeTab === index
                                ? 'bg-cyan-500/20'
                                : ''
                            }
                        `}
                        role="tab"
                        aria-selected={activeTab === index}
                        aria-controls={`tabpanel-${index}`}
                    >
                        {tab.label}

                        {/* Active indicator for default variant */}
                        {variant === 'default' && activeTab === index && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="mt-4">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        id={`tabpanel-${index}`}
                        role="tabpanel"
                        hidden={activeTab !== index}
                        aria-labelledby={`tab-${index}`}
                    >
                        {activeTab === index && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {tab.content}
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
