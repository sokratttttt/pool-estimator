'use client';
import { useState, useEffect } from 'react';
import { Gantt, ViewMode, type Task } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { calculateSchedule, getProjectDuration, detectStagesFromItems } from '@/utils/ganttUtils';
import { Calendar, Download } from 'lucide-react';
import AppleButton from './apple/AppleButton';
import AppleCard from './apple/AppleCard';
import { motion } from 'framer-motion';

/**
 * Компонент для отображения графика работ (диаграмма Ганта)
 * @param {Array} items - позиции сметы (для определения этапов)
 * @param {Date} startDate - дата начала проекта
 */
interface GanttChartProps {
    items?: any[];
    startDate?: Date | null;
}

export default function GanttChart({ items = [], startDate }: GanttChartProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [viewMode, setViewMode] = useState(ViewMode.Day);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Определяем этапы на основе позиций сметы
        const stages = detectStagesFromItems(items);

        // Рассчитываем график
        const projectStart = startDate || new Date();
        const scheduledTasks = calculateSchedule(stages, projectStart);

        setTasks(scheduledTasks);
    }, [items, startDate]);

    const duration = getProjectDuration(tasks);

    const handleExportPDF = () => {
        // TODO: экспорт графика в PDF через html2canvas
    };

    if (!isClient) {
        return null; // Предотвращаем SSR проблемы
    }

    if (tasks.length === 0) {
        return (
            <AppleCard variant="glass" className="p-8 text-center">
                <Calendar size={48} className="mx-auto mb-4 text-apple-text-tertiary" />
                <p className="apple-body-secondary">Загрузка графика работ...</p>
            </AppleCard>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Заголовок и информация */}
            <AppleCard variant="glass" className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="apple-heading-2 mb-2">График выполнения работ</h2>
                        <div className="space-y-1 text-sm text-apple-text-secondary">
                            <p>
                                <strong>Начало:</strong> {duration.start?.toLocaleDateString('ru-RU')}
                            </p>
                            <p>
                                <strong>Окончание:</strong> {duration.end?.toLocaleDateString('ru-RU')}
                            </p>
                            <p>
                                <strong>Длительность:</strong> {duration.days} рабочих дней ({duration.calendarDays} календарных)
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <AppleButton
                            variant="secondary"
                            size="sm"
                            onClick={handleExportPDF}
                            icon={<Download size={16} />}
                        >
                            Скачать PDF
                        </AppleButton>
                    </div>
                </div>

                {/* Переключатель режима отображения */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setViewMode(ViewMode.Day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === ViewMode.Day
                            ? 'bg-apple-primary text-white'
                            : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                            }`}
                    >
                        По дням
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Week)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === ViewMode.Week
                            ? 'bg-apple-primary text-white'
                            : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                            }`}
                    >
                        По неделям
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Month)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === ViewMode.Month
                            ? 'bg-apple-primary text-white'
                            : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                            }`}
                    >
                        По месяцам
                    </button>
                </div>
            </AppleCard>

            {/* Диаграмма Ганта */}
            <AppleCard variant="glass" className="p-6 overflow-x-auto">
                <Gantt
                    tasks={tasks}
                    viewMode={viewMode}
                    locale="ru"
                    listCellWidth="200px"
                    columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 65}
                    barBackgroundColor="#0071E3"
                    barBackgroundSelectedColor="#0077ED"
                    barProgressColor="#00B4D8"
                    barProgressSelectedColor="#00C4E8"
                    todayColor="rgba(0, 180, 216, 0.2)"
                    arrowColor="#666"
                    fontSize="14px"
                    fontFamily="system-ui, -apple-system, sans-serif"
                />
            </AppleCard>

            {/* Легенда */}
            <AppleCard variant="glass" className="p-4">
                <h3 className="text-sm font-medium mb-3">Категории этапов:</h3>
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B4513' }}></div>
                        <span>Земляные работы</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0071E3' }}></div>
                        <span>Работы</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00B4D8' }}></div>
                        <span>Оборудование</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#34C759' }}></div>
                        <span>Сервис</span>
                    </div>
                </div>
            </AppleCard>
        </motion.div>
    );
}
