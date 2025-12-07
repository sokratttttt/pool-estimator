import { Selection } from './estimate-utils';

export interface Template {
    id: string;
    name: string;
    description: string;
    config: Selection;
    createdAt: string;
    updatedAt?: string;
}

export interface TemplateContextType {
    templates: Template[];
    saveTemplate: (name: string, description: string, config: Selection) => Template;
    deleteTemplate: (id: string) => void;
    updateTemplate: (id: string, updates: Partial<Template>) => void;
}
