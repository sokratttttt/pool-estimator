// TODO: Add proper TypeScript types for state
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useDelivery = () => {
    const [deliveryItem, setDeliveryItem] = useState<any | null>(null);

    const calculateDelivery = useCallback(({ cost, distance, address }) => {
        const newDeliveryItem = {
            id: 'delivery',
            name: `Доставка (${distance} км)`,
            quantity: 1,
            unit: 'услуга',
            price: cost,
            total: cost,
            category: 'Дополнительное оборудование',
            metadata: {
                distance,
                address
            }
        };

        setDeliveryItem(newDeliveryItem);
        toast.success(`Доставка рассчитана: ${cost} ₽ (${distance} км)`);
        return newDeliveryItem;
    }, []);

    const removeDelivery = useCallback(() => {
        setDeliveryItem(null);
        toast.success('Доставка удалена');
    }, []);

    const updateDelivery = useCallback((updates: any) => {
        if (!deliveryItem) return;

        setDeliveryItem(prev => ({
            ...prev,
            ...updates,
            total: updates.price || prev.price
        }));
    }, [deliveryItem]);

    return {
        deliveryItem,
        calculateDelivery,
        removeDelivery,
        updateDelivery,
        setDeliveryItem
    };
};
