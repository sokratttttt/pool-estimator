'use client';
import { motion } from 'framer-motion';
import {
    Edit2, Save, FileSpreadsheet, FileText, Bookmark,
    Calendar, Sparkles, Camera, Cube, MoreHorizontal,
    Download, Share2
} from 'lucide-react';
import AppleButton from '../../apple/AppleButton';
import { useState } from 'react';

export default function SummaryHeader({
    onEdit,
    isEditing,
    onSave,
    onTemplate,
    onDescription,
    onContract,
    onProposal,
    onGantt,
    onPhotos,
    on3D,
    isExporting
}) {
    const [showExportMenu, setShowExportMenu] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        >
            <div>
                <h2 className="text-2xl font-bold mb-1">Детальная смета</h2>
                <p className="text-gray-400">Итоговый расчет стоимости бассейна</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Primary Actions */}
                <AppleButton
                    variant={isEditing ? "primary" : "secondary"}
                    onClick={onEdit}
                    icon={isEditing ? <Save size={18} /> : <Edit2 size={18} />}
                    size="sm"
                >
                    {isEditing ? 'Готово' : 'Редактировать'}
                </AppleButton>

                <AppleButton
                    variant="secondary"
                    onClick={onSave}
                    icon={<Save size={18} />}
                    size="sm"
                >
                    Сохранить
                </AppleButton>

                {/* Visual Tools Group */}
                <div className="flex bg-gray-800/50 rounded-lg p-1 gap-1">
                    <button
                        onClick={on3D}
                        className="p-2 hover:bg-gray-700 rounded-md text-cyan-400 transition-colors"
                        title="3D Вид"
                    >
                        <Cube size={20} />
                    </button>
                    <button
                        onClick={onPhotos}
                        className="p-2 hover:bg-gray-700 rounded-md text-purple-400 transition-colors"
                        title="Фото"
                    >
                        <Camera size={20} />
                    </button>
                    <button
                        onClick={onGantt}
                        className="p-2 hover:bg-gray-700 rounded-md text-green-400 transition-colors"
                        title="График"
                    >
                        <Calendar size={20} />
                    </button>
                </div>

                {/* Export Dropdown */}
                <div className="relative">
                    <AppleButton
                        variant="secondary"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        icon={<Download size={18} />}
                        size="sm"
                        loading={isExporting}
                    >
                        Экспорт
                    </AppleButton>

                    {showExportMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowExportMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                <div className="p-1">
                                    <button
                                        onClick={() => { onContract(); setShowExportMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg text-left text-sm"
                                    >
                                        <FileText size={16} className="text-blue-400" />
                                        Скачать договор
                                    </button>
                                    <button
                                        onClick={() => { onProposal(); setShowExportMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg text-left text-sm"
                                    >
                                        <FileText size={16} className="text-green-400" />
                                        Скачать КП
                                    </button>
                                    <div className="h-px bg-gray-700 my-1" />
                                    <button
                                        onClick={() => { onTemplate(); setShowExportMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg text-left text-sm"
                                    >
                                        <Bookmark size={16} className="text-yellow-400" />
                                        Сохранить как шаблон
                                    </button>
                                    <button
                                        onClick={() => { onDescription(); setShowExportMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg text-left text-sm"
                                    >
                                        <Sparkles size={16} className="text-purple-400" />
                                        Создать описание
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
