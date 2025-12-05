'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TemplateContextType, Template } from '@/types/template';

const TemplateContext = createContext<TemplateContextType | null>(null);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Mark as mounted on client side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Load templates from localStorage on mount (client-side only)
    useEffect(() => {
        if (!isMounted) return;

        try {
            const saved = localStorage.getItem('pool_templates');
            if (saved) {
                setTemplates(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }, [isMounted]);

    // Save templates to localStorage whenever they change (client-side only)
    useEffect(() => {
        if (!isMounted || templates.length === 0) return;

        try {
            localStorage.setItem('pool_templates', JSON.stringify(templates));
        } catch (error) {
            console.error('Error saving templates:', error);
        }
    }, [templates, isMounted]);

    const saveTemplate = useCallback((name: string, description: string, config: Record<string, any>): Template => {
        const newTemplate: Template = {
            id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            description,
            config,
            createdAt: new Date().toISOString()
        };
        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    }, []);

    const deleteTemplate = useCallback((id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
        setTemplates(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ));
    }, []);

    const value: TemplateContextType = {
        templates,
        saveTemplate,
        deleteTemplate,
        updateTemplate
    };

    return (
        <TemplateContext.Provider value={value}>
            {children}
        </TemplateContext.Provider>
    );
}

export function useTemplates() {
    const context = useContext(TemplateContext);
    if (!context) {
        throw new Error('useTemplates must be used within TemplateProvider');
    }
    return context;
}
