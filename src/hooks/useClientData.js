import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook для управления данными клиента
 * @param {Object} initialData - Начальные данные клиента
 * @returns {Object} Состояние клиента и методы
 */
export function useClientData(initialData = {
    name: '',
    phone: '',
    email: '',
    managerName: 'Платон',
    managerPhone: '+7 (919) 296-16-47'
}) {
    const [clientInfo, setClientInfo] = useState(initialData);

    const handleClientSelect = (client) => {
        setClientInfo(prev => ({
            ...prev,
            name: client.name,
            phone: client.phone || prev.phone,
            email: client.email || prev.email,
            clientId: client.id
        }));
        toast.success('Данные клиента загружены');
    };

    const updateClientInfo = (field, value) => {
        setClientInfo(prev => ({ ...prev, [field]: value }));
    };

    const updateClient = (updates) => {
        setClientInfo(prev => ({ ...prev, ...updates }));
    };

    return {
        clientInfo,
        setClientInfo,
        handleClientSelect,
        updateClientInfo,
        updateClient
    };
}
