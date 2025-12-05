'use client';
import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from 'lucide-react';
import { parseExcelCatalog } from '@/utils/importUtils';
import { useEstimate } from '@/context/EstimateContext';

interface CatalogImporterProps {
    type?: any;
}

export default function CatalogImporter({ type = 'equipment' }: CatalogImporterProps) { // type: 'bowls' | 'equipment'
    const [isOpen, setIsOpen] = useState(false);
    const [source, setSource] = useState('aquapolis');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { updateCatalog } = useEstimate();

    const handleFileChange = async (e: React.ChangeEvent<any>) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setStatus(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const items = await parseExcelCatalog(arrayBuffer, source);

            if (items.length === 0) {
                throw new Error('Не удалось найти товары в файле. Проверьте формат.');
            }

            if (updateCatalog) {
                updateCatalog(type, items);
                setStatus({ type: 'success', message: `Успешно импортировано ${items.length} позиций` });
            } else {
                console.warn('updateCatalog function missing in context');
                setStatus({ type: 'error', message: 'Ошибка интеграции: функция обновления каталога не найдена' });
            }

        } catch (error) {
            console.error('Import error:', error);
            setStatus({ type: 'error', message: (error as any).message || 'Ошибка при чтении файла' });
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <Upload size={16} />
                <span>Импорт</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Импорт каталога</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">×</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Источник</label>
                            <select
                                value={source}
                                onChange={(e: React.ChangeEvent<any>) => setSource(e.target.value)}
                                className="w-full p-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="aquapolis">Aquapolis.ru</option>
                                <option value="xenozone">Xenozone.ru</option>
                            </select>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg p-4 text-center hover:border-[#00b4d8] dark:hover:border-[#00b4d8] transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".xlsx, .xls"
                                className="hidden"
                            />
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Loader2 className="animate-spin" size={24} />
                                    <span className="text-xs">Обработка...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <FileSpreadsheet size={24} />
                                    <span className="text-xs">Нажмите для выбора файла</span>
                                </div>
                            )}
                        </div>

                        {status && (
                            <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                }`}>
                                {status.type === 'success' ? <Check size={14} className="mt-0.5" /> : <AlertCircle size={14} className="mt-0.5" />}
                                {status.message}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
