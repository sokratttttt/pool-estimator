'use client';
import { motion } from 'framer-motion';
import { FileSpreadsheet, FileText, MessageCircle } from 'lucide-react';
import AppleCard from '../../apple/AppleCard';
import AppleInput from '../../apple/AppleInput';
import AppleButton from '../../apple/AppleButton';
import ClientSelector from '../../ClientSelector';
import { ClientInfo } from '@/types';

interface SummaryClientInfoProps {
    clientInfo?: ClientInfo;
    setClientInfo?: (info: ClientInfo) => void;
    onClientSelect?: () => void;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
    onWhatsApp?: () => void;
    isExporting?: boolean;
}

export default function SummaryClientInfo({
    clientInfo,
    setClientInfo,
    onClientSelect,
    onExportExcel,
    onExportPDF,
    onWhatsApp,
    isExporting
}: SummaryClientInfoProps) {
    if (!clientInfo) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <AppleCard variant="premium">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Информация о клиенте</h3>
                    <ClientSelector onSelect={onClientSelect} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AppleInput
                        label="Имя клиента"
                        value={clientInfo.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientInfo?.({ ...clientInfo, name: e.target.value })}
                        placeholder="Введите имя клиента"
                    />
                    <AppleInput
                        label="Телефон"
                        value={clientInfo.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientInfo?.({ ...clientInfo, phone: e.target.value })}
                        placeholder="+7 (XXX) XXX-XX-XX"
                    />
                    <AppleInput
                        label="Email"
                        value={clientInfo.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientInfo?.({ ...clientInfo, email: e.target.value })}
                        placeholder="email@example.com"
                    />
                    <div className="flex gap-2 items-end">
                        <AppleButton
                            variant="secondary"
                            onClick={onExportExcel}
                            icon={<FileSpreadsheet size={18} />}
                            loading={isExporting}
                            className="flex-1"
                        >
                            Excel
                        </AppleButton>
                        <AppleButton
                            variant="secondary"
                            onClick={onExportPDF}
                            icon={<FileText size={18} />}
                            loading={isExporting}
                            className="flex-1"
                        >
                            PDF
                        </AppleButton>
                        <AppleButton
                            variant="secondary"
                            onClick={onWhatsApp}
                            icon={<MessageCircle size={18} />}
                            className="flex-1"
                        >
                            WhatsApp
                        </AppleButton>
                    </div>
                </div>
            </AppleCard>
        </motion.div>
    );
}
