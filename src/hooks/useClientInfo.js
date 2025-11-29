import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useClientInfo = (initialData = {}) => {
    const [clientInfo, setClientInfo] = useState({
        name: '',
        phone: '',
        email: '',
        managerName: 'Платон',
        managerPhone: '+7 (919) 296-16-47',
        ...initialData
    });

    const updateClientInfo = useCallback((field, value) => {
        setClientInfo(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const selectClient = useCallback((client) => {
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
