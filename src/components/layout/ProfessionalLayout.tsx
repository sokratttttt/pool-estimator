'use client';

import React, { ReactNode, useState } from 'react';
import { MenuBar } from './MenuBar';
import { ActivityBar } from './ActivityBar';
import { StatusBar } from './StatusBar';
import { DocumentTabs } from './DocumentTabs';

interface ProfessionalLayoutProps {
    children: ReactNode;
    sidebar?: ReactNode;
    properties?: ReactNode;
    showSidebar?: boolean;
    showProperties?: boolean;
}

export const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({
    children,
    sidebar,
    properties,
    showSidebar = true,
    showProperties = false
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(!showSidebar);
    const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(!showProperties);
    const [activeTab, setActiveTab] = useState('current');

    const tabs = [
        { id: 'current', label: 'Текущая смета', icon: '📄' },
    ];

    return (
        <div className="pro-app" data-theme="dark">
            {/* Menu Bar */}
            <MenuBar />

            {/* Main Container */}
            <div className="pro-app-container">
                {/* Activity Bar (icon rail) */}
                <ActivityBar
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    isSidebarVisible={!isSidebarCollapsed}
                />

                {/* Sidebar */}
                <div className={`pro-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    {sidebar ? (
                        sidebar
                    ) : (
                        <>
                            <div className="pro-sidebar-header">
                                <span>Навигация</span>
                            </div>
                            <div className="pro-sidebar-content">
                                {/* Default navigation content */}
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content */}
                <div className="pro-main">
                    {/* Document Tabs */}
                    <DocumentTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onTabClose={() => { }}
                    />

                    {/* Workspace */}
                    <div className="pro-workspace">
                        {children}
                    </div>
                </div>

                {/* Properties Panel */}
                <div className={`pro-properties ${isPropertiesCollapsed ? 'collapsed' : ''}`}>
                    {properties ? (
                        properties
                    ) : (
                        <>
                            <div className="pro-properties-header">
                                <span className="pro-properties-title">Свойства</span>
                                <button
                                    onClick={() => setIsPropertiesCollapsed(true)}
                                    className="pro-toolbar-btn"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="pro-properties-content">
                                <div className="pro-properties-section">
                                    <div className="pro-properties-section-title">Детали</div>
                                    <p className="pro-text-tertiary pro-text-sm">
                                        Выберите элемент для просмотра свойств
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <StatusBar
                onToggleProperties={() => setIsPropertiesCollapsed(!isPropertiesCollapsed)}
                isPropertiesVisible={!isPropertiesCollapsed}
            />
        </div>
    );
};

export default ProfessionalLayout;
