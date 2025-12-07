// TODO: Add proper TypeScript types for state
import { useState } from 'react';
import { toast } from 'sonner';

export interface ClientData {
    name: string;
    phone: string;
    email: string;
    managerName?: string;
    managerPhone?: string;
    clientId?: string;
    [key: string]: string | undefined;
}

/**
 * Hook для управления данными клиента
 * @param {ClientData} initialData - Начальные данные клиента
 * @returns {Object} Состояние клиента и методы
 */
export function useClientData(initialData: ClientData = {
    name: '',
    phone: '',
    email: '',
    managerName: 'Платон',
    managerPhone: '+7 (919) 296-16-47'
}) {
    const [clientInfo, setClientInfo] = useState<ClientData>(initialData);

    const handleClientSelect = (client: { name: string; phone?: string; email?: string; id?: string }) => {
        setClientInfo(prev => ({
            ...prev,
            name: client.name,
            phone: client.phone || prev.phone,
            email: client.email || prev.email,
            clientId: client.id
        }));
        toast.success('Данные клиента загружены');
    };

    const updateClientInfo = (field: keyof ClientData, value: string) => {
        setClientInfo(prev => ({ ...prev, [field]: value }));
    };

    const updateClient = (updates: Partial<ClientData>) => {
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
