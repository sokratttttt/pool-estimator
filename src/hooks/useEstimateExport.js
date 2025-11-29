import { useState, useCallback } from 'react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { generateContract } from '@/utils/contractUtils';
import { generateProposal } from '@/utils/proposalUtils';
import { sendToWhatsApp } from '@/utils/whatsappUtils';
import { toast } from 'sonner';

export const useEstimateExport = (allItems, totalSum, clientInfo) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportExcel = useCallback(async () => {
        try {
            setIsExporting(true);
            await exportToExcel(allItems, totalSum, clientInfo);
            toast.success('Excel экспортирован');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Ошибка при экспорте в Excel');
        } finally {
            setIsExporting(false);
        }
    }, [allItems, totalSum, clientInfo]);

    const handleExportPDF = useCallback(async () => {
        try {
            setIsExporting(true);
            await exportToPDF(allItems, totalSum, clientInfo);
            toast.success('PDF экспортирован');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            toast.error('Ошибка при экспорте в PDF');
        } finally {
            setIsExporting(false);
        }
    }, [allItems, totalSum, clientInfo]);

    const handleExportContract = useCallback(async () => {
        try {
            setIsExporting(true);
            await generateContract(clientInfo, totalSum);
            toast.success('Договор скачан');
        } catch (error) {
            console.error('Error exporting contract:', error);
            toast.error('Ошибка при скачивании договора');
        } finally {
            setIsExporting(false);
        }
    }, [clientInfo, totalSum]);

    const handleExportProposal = useCallback(async () => {
        try {
            setIsExporting(true);
            const currentEstimate = JSON.parse(localStorage.getItem('mos-pool-current-estimate') || '{}');
            const estimateId = currentEstimate.id;
            await generateProposal(allItems, totalSum, clientInfo, estimateId);
            toast.success('Коммерческое предложение скачано');
        } catch (error) {
            console.error('Error exporting proposal:', error);
            toast.error('Ошибка при скачивании КП');
        } finally {
            setIsExporting(false);
        }
    }, [allItems, totalSum, clientInfo]);

    const handleSendWhatsApp = useCallback(() => {
        try {
            if (!clientInfo.phone) {
                toast.error('Укажите номер телефона клиента');
                return;
            }
            sendToWhatsApp(clientInfo.phone, clientInfo, totalSum, allItems);
            toast.success('WhatsApp открыт');
        } catch (error) {
            console.error('Error sending to WhatsApp:', error);
            toast.error(error.message || 'Ошибка при открытии WhatsApp');
        }
    }, [clientInfo, totalSum, allItems]);

    return {
        isExporting,
        handleExportExcel,
        handleExportPDF,
        handleExportContract,
        handleExportProposal,
        handleSendWhatsApp
    };
};
