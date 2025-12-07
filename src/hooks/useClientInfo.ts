// TODO: Add proper TypeScript types for state
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ClientInfo {
    name: string;
    phone: string;
    email: string;
    managerName: string;
    managerPhone: string;
    clientId?: string;
    [key: string]: string | undefined;
}

interface ClientData {
    id: string;
    name: string;
    phone?: string;
    email?: string;
}

export const useClientInfo = (initialData: Partial<ClientInfo> = {}) => {
    const [clientInfo, setClientInfo] = useState<ClientInfo>({
        name: '',
        phone: '',
        email: '',
        managerName: 'Платон',
        managerPhone: '+7 (919) 296-16-47',
        ...initialData
    });

    const updateClientInfo = useCallback((field: keyof ClientInfo, value: string) => {
        setClientInfo(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const selectClient = useCallback((client: ClientData) => {
        setClientInfo(prev => ({
            ...prev,
            name: client.name,
            phone: client.phone || prev.phone,
            email: client.email || prev.email,
            clientId: client.id
        }));
        toast.success('Данные клиента загружены');
    }, []);

    return {
        clientInfo,
        setClientInfo, // Expose setter for full updates if needed
        updateClientInfo,
        selectClient
    };
};
