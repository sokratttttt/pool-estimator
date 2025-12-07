
export interface ContractSection {
    type: 'paragraph' | 'heading' | 'header' | 'signatures_table';
    text?: string;
    alignment?: 'left' | 'center' | 'right' | 'justified';
    level?: 1 | 2 | 3;
}

export interface ContractContent {
    sections: ContractSection[];
}

export interface ContractTemplate {
    id: string;
    name: string;
    description?: string;
    content: ContractContent;
    created_at: string;
    updated_at?: string;
    is_default?: boolean;
}
