'use client';

import React from 'react';
import { X, Plus, FileText } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon?: string | React.ReactNode;
    unsaved?: boolean;
}

interface DocumentTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onNewTab?: () => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    onTabClose,
    onNewTab
}) => {
    return (
        <div className="pro-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`pro-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className="pro-tab-icon">
                        {tab.icon || <FileText size={14} />}
                    </span>
                    <span className="pro-tab-label">
                        {tab.label}
                        {tab.unsaved && <span style={{ color: 'var(--pro-warning)' }}>●</span>}
                    </span>
                    <span
                        className="pro-tab-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTabClose(tab.id);
                        }}
                    >
                        <X size={12} />
                    </span>
                </button>
            ))}

            {onNewTab && (
                <button
                    className="pro-tab"
                    onClick={onNewTab}
                    style={{ width: '32px', padding: 0 }}
                    title="Новая вкладка"
                >
                    <Plus size={14} />
                </button>
            )}
        </div>
    );
};

export default DocumentTabs;
