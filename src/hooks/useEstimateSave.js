import { useState, useCallback } from 'react';
import { useHistory } from '@/context/HistoryContext';
import { useTemplates } from '@/context/TemplateContext';
import { toast } from 'sonner';

export const useEstimateSave = (selection, allItems, totalSum, clientInfo) => {
    const { saveEstimate } = useHistory();
    const { saveTemplate } = useTemplates();

    const [estimateName, setEstimateName] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');

    const handleSave = useCallback(() => {
        if (!estimateName.trim()) {
            toast.error('Введите название сметы');
            return;
        }

        const finalSelection = {
            ...selection,
            clientInfo: clientInfo
        };

        saveEstimate(estimateName, finalSelection, allItems, totalSum);
        toast.success('Смета сохранена');
        setEstimateName('');
        return true;
    }, [estimateName, selection, clientInfo, allItems, totalSum, saveEstimate]);

    const handleSaveAsTemplate = useCallback(() => {
        if (!templateName.trim()) {
            toast.error('Введите название шаблона');
            return;
        }

        saveTemplate(templateName, templateDescription, {
            selection,
            items: allItems,
            total: totalSum
        });

        toast.success('Шаблон сохранен');
        setTemplateName('');
        setTemplateDescription('');
        return true;
    }, [templateName, templateDescription, selection, allItems, totalSum, saveTemplate]);

    return {
        estimateName,
        setEstimateName,
        templateName,
        setTemplateName,
        templateDescription,
        setTemplateDescription,
        handleSave,
        handleSaveAsTemplate
    };
};
