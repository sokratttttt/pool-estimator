// TODO: Add proper TypeScript types for state
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface CustomItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
    category: string;
}

export const useCustomItems = () => {
    const [customItems, setCustomItems] = useState<CustomItem[]>([]);

    const addCustomItem = useCallback((product: Partial<CustomItem> & { name: string; price: number }) => {
        const newItem: CustomItem = {
            id: `custom-${Date.now()}`,
            name: product.name,
            quantity: product.quantity || 1,
            unit: product.unit || 'шт',
            price: product.price,
            total: (product.quantity || 1) * product.price,
            category: product.category || 'Дополнительное оборудование',
        };
        setCustomItems(prev => [...prev, newItem]);
        toast.success(`Добавлено: ${product.name}`);
        return newItem;
    }, []);

    const removeCustomItem = useCallback((itemId: string) => {
        setCustomItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Позиция удалена');
    }, []);

    const updateCustomItem = useCallback((itemId: string, updates: Partial<CustomItem>) => {
        setCustomItems(prev => prev.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    ...updates,
                    total: (updates.quantity || item.quantity) * (updates.price || item.price)
                }
                : item
        ));
    }, []);

    const clearCustomItems = useCallback(() => {
        setCustomItems([]);
        toast.success('Кастомные позиции очищены');
    }, []);

    return {
        customItems,
        addCustomItem,
        removeCustomItem,
        updateCustomItem,
        clearCustomItems,
        setCustomItems
    };
};
