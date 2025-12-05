'use client';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FileMessage - Component to display file/image attachments in chat
 * @param {Object} message - Message object with file_url
 */
interface FileMessageProps {
    message?: any;

}

export default function FileMessage({ message }: FileMessageProps) {
    const { content, file_url, type } = message;

    const getFileName = () => {
        if (!file_url) return 'Файл';
        const parts = file_url.split('/');
        return parts[parts.length - 1] || 'Файл';
    };

    const handleDownload = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const link = document.createElement('a');
        link.href = file_url;
        link.download = getFileName();
        link.target = '_blank';
        link.click();
    };

    // Image message - show inline preview
    if (type === 'image') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm"
            >
                <img
                    src={file_url}
                    alt={content || 'Изображение'}
                    className="rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity w-full"
                    onClick={handleDownload}
                />
                {content && (
                    <p className="text-sm text-gray-600 mt-1">{content}</p>
                )}
            </motion.div>
        );
    }

    // File message - show file card
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-sm hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={handleDownload}
        >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                    {content || getFileName()}
                </p>
                <p className="text-xs text-gray-500">Нажмите для скачивания</p>
            </div>
            <Download size={16} className="text-gray-400 flex-shrink-0" />
        </motion.div>
    );
}
