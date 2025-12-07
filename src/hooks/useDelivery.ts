import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface DeliveryData {
    cost: number;
    distance: number;
    address: string;
}

interface DeliveryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
    category: string;
    metadata: {
        distance: number;
        address: string;
    };
}

interface UseDeliveryResult {
    deliveryItem: DeliveryItem | null;
    calculateDelivery: (data: DeliveryData) => DeliveryItem;
    removeDelivery: () => void;
    updateDelivery: (updates: Partial<DeliveryItem>) => void;
    setDeliveryItem: React.Dispatch<React.SetStateAction<DeliveryItem | null>>;
}

export const useDelivery = (): UseDeliveryResult => {
    const [deliveryItem, setDeliveryItem] = useState<DeliveryItem | null>(null);

    const calculateDelivery = useCallback(({ cost, distance, address }: DeliveryData): DeliveryItem => {
        const newDeliveryItem: DeliveryItem = {
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

    const updateDelivery = useCallback((updates: Partial<DeliveryItem>) => {
        if (!deliveryItem) return;

        setDeliveryItem(prev => {
            if (!prev) return null;
            return {
                ...prev,
                ...updates,
                total: updates.price ?? prev.price
            };
        });
    }, [deliveryItem]);

    return {
        deliveryItem,
        calculateDelivery,
        removeDelivery,
        updateDelivery,
        setDeliveryItem
    };
};
