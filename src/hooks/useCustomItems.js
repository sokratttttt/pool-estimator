import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useCustomItems = () => {
    const [customItems, setCustomItems] = useState([]);

    const addCustomItem = useCallback((product) => {
        const newItem = {
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

    const removeCustomItem = useCallback((itemId) => {
        setCustomItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Позиция удалена');
    }, []);

    const updateCustomItem = useCallback((itemId, updates) => {
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
