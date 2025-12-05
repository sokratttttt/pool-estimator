export interface Template {
    id: string;
    name: string;
    description: string;
    config: Record<string, any>;
    createdAt: string;
    updatedAt?: string;
}

export interface TemplateContextType {
    templates: Template[];
    saveTemplate: (name: string, description: string, config: Record<string, any>) => Template;
    deleteTemplate: (id: string) => void;
    updateTemplate: (id: string, updates: Partial<Template>) => void;
}
