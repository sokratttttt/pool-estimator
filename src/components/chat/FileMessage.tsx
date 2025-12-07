'use client';
import Image from 'next/image';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FileMessage - Component to display file/image attachments in chat
 */
import type { ChatMessage } from '@/types/chat';

interface FileMessageProps {
    message: ChatMessage;
}

export default function FileMessage({ message }: FileMessageProps) {
    const { content, file_url, type } = message;

    const getFileName = (): string => {
        if (!file_url) return 'Файл';
        const parts = file_url.split('/');
        return parts[parts.length - 1] || 'Файл';
    };

    const handleDownload = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const link = document.createElement('a');
        link.href = file_url || '';
        link.download = getFileName();
        link.target = '_blank';
        link.click();
    };

    // Image message - show inline preview
    if (type === 'image') {
        const altText = content || 'Изображение в чате';
        const fileName = getFileName();

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm relative group"
            >
                <div className="relative rounded-lg shadow-md overflow-hidden">
                    <Image
                        src={file_url || ''}
                        alt={altText}
                        width={400}
                        height={300}
                        className="w-full h-auto cursor-pointer transition-transform group-hover:scale-105"
                        onClick={handleDownload}
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                    {/* Download overlay on hover */}
                    <div
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={handleDownload}
                        aria-label={`Скачать ${fileName}`}
                    >
                        <Download size={24} className="text-white" />
                    </div>
                </div>
                {content && (
                    <p className="text-sm text-gray-600 mt-1">{content}</p>
                )}
            </motion.div>
        );
    }

    // File message - show file card
    const fileName = content || getFileName();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-sm hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={handleDownload}
            role="button"
            tabIndex={0}
            aria-label={`Скачать файл: ${fileName}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDownload();
                }
            }}
        >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                    {fileName}
                </p>
                <p className="text-xs text-gray-500">Нажмите для скачивания</p>
            </div>
            <Download size={16} className="text-gray-400 flex-shrink-0" />
        </motion.div>
    );
}