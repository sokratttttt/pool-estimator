'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const TemplateContext = createContext();

export function TemplateProvider({ children }) {
    const [templates, setTemplates] = useState([]);
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

    const saveTemplate = (name, description, config) => {
        const newTemplate = {
            id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            description,
            config,
            createdAt: new Date().toISOString()
        };
        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    };

    const deleteTemplate = (id) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    const updateTemplate = (id, updates) => {
        setTemplates(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ));
    };

    return (
        <TemplateContext.Provider value={{
            templates,
            saveTemplate,
            deleteTemplate,
            updateTemplate
        }}>
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
