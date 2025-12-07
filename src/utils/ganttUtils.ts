/**
 * Утилиты для расчета графика работ (диаграмма Ганта)
 */

/**
 * Стандартные этапы строительства бассейна с длительностью
 */
// Define types
export interface Stage {
    id: string;
    name: string;
    duration: number;
    dependencies: string[];
    category: string;
}

const STANDARD_STAGES: Stage[] = [
    {
        id: 'preparation',
        name: 'Подготовка участка',
        duration: 3, // дней
        dependencies: [],
        category: 'Земляные работы'
    },
    {
        id: 'excavation',
        name: 'Рытье котлована',
        duration: 5,
        dependencies: ['preparation'],
        category: 'Земляные работы'
    },
    {
        id: 'concrete',
        name: 'Бетонные работы',
        duration: 10,
        dependencies: ['excavation'],
        category: 'Работы'
    },
    {
        id: 'waterproofing',
        name: 'Гидроизоляция',
        duration: 3,
        dependencies: ['concrete'],
        category: 'Работы'
    },
    {
        id: 'finishing',
        name: 'Отделка (плитка/мозаика)',
        duration: 7,
        dependencies: ['waterproofing'],
        category: 'Работы'
    },
    {
        id: 'equipment',
        name: 'Установка оборудования',
        duration: 4,
        dependencies: ['finishing'],
        category: 'Оборудование'
    },
    {
        id: 'commissioning',
        name: 'Пусконаладка',
        duration: 2,
        dependencies: ['equipment'],
        category: 'Сервис'
    }
];

/**
 * Добавить рабочие дни к дате (пропуская выходные)
 * @param {Date} date - начальная дата
 * @param {number} days - количество рабочих дней
 * @returns {Date} - конечная дата
 */
const addWorkingDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        // Пропускаем выходные (суббота = 6, воскресенье = 0)
        if (result.getDay() !== 0 && result.getDay() !== 6) {
            addedDays++;
        }
    }

    return result;
};

/**
 * Рассчитать график работ на основе этапов
 * @param {Array} stages - массив этапов с зависимостями
 * @param {Date} startDate - дата начала проекта
 * @returns {Array} - массив задач для gantt-chart
 */
export const calculateSchedule = (stages: Stage[] = STANDARD_STAGES, startDate = new Date()) => {
    const tasks: GanttTask[] = [];
    const stageEndDates: Record<string, Date> = {};

    stages.forEach((stage: Stage) => {
        // Определяем дату начала этапа
        let taskStart = new Date(startDate);

        // Если есть зависимости, берем максимальную дату окончания
        if (stage.dependencies && stage.dependencies.length > 0) {
            const dependencyDates = stage.dependencies.map((depId: string) => stageEndDates[depId]);
            // Filter out undefined dates if any dependency is missing
            const validDates = dependencyDates.filter((d): d is Date => !!d);

            if (validDates.length > 0) {
                const maxDependencyDate = new Date(Math.max(...validDates.map((d: Date) => d.getTime())));
                taskStart = new Date(maxDependencyDate);
                taskStart.setDate(taskStart.getDate() + 1); // Начинаем на следующий день
            }
        }

        // Рассчитываем дату окончания
        const taskEnd = addWorkingDays(taskStart, stage.duration);

        // Сохраняем дату окончания для зависимых задач
        stageEndDates[stage.id] = taskEnd;

        // Создаем задачу для gantt-chart
        tasks.push({
            id: stage.id,
            name: stage.name,
            start: taskStart,
            end: taskEnd,
            progress: 0,
            type: 'task',
            styles: getStageColor(stage.category),
            dependencies: stage.dependencies || []
        });
    });

    return tasks;
};

type StageCategory = 'Земляные работы' | 'Работы' | 'Оборудование' | 'Сервис';

interface StageColor {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
}

const getStageColor = (category: string): StageColor => {
    const colorMap: Record<StageCategory, StageColor> = {
        'Земляные работы': { backgroundColor: '#8B4513', backgroundSelectedColor: '#A0522D' },
        'Работы': { backgroundColor: '#0071E3', backgroundSelectedColor: '#0077ED' },
        'Оборудование': { backgroundColor: '#00B4D8', backgroundSelectedColor: '#00C4E8' },
        'Сервис': { backgroundColor: '#34C759', backgroundSelectedColor: '#3ED368' }
    };

    return colorMap[category as StageCategory] || { backgroundColor: '#666', backgroundSelectedColor: '#777' };
};

interface GanttTask {
    id: string;
    name: string;
    start: Date;
    end: Date;
    progress?: number;
    type?: string;
    styles?: StageColor;
    dependencies?: string[];
}

export const getProjectDuration = (tasks: GanttTask[]) => {
    if (!tasks || tasks.length === 0) {
        return { days: 0, start: null, end: null };
    }

    const start = new Date(Math.min(...tasks.map((t: GanttTask) => t.start.getTime())));
    const end = new Date(Math.max(...tasks.map((t: GanttTask) => t.end.getTime())));

    // Считаем рабочие дни между датами
    let workingDays = 0;
    const current = new Date(start);

    while (current <= end) {
        if (current.getDay() !== 0 && current.getDay() !== 6) {
            workingDays++;
        }
        current.setDate(current.getDate() + 1);
    }

    return {
        days: workingDays,
        calendarDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
        start,
        end
    };
};

export interface EstimateItem {
    name?: string;
    category?: string;
}

export const detectStagesFromItems = (items: EstimateItem[]) => {
    // Базовые этапы всегда присутствуют
    const stages = [...STANDARD_STAGES];

    // Можно добавить логику для адаптации этапов на основе конкретных работ
    // Например, если в смете есть "SPA" - добавить этап "Монтаж SPA"

    const hasHammam = items.some((item: EstimateItem) =>
        item.name?.toLowerCase().includes('хаммам') ||
        item.category?.toLowerCase().includes('хаммам')
    );

    if (hasHammam) {
        stages.push({
            id: 'hammam',
            name: 'Строительство хаммама',
            duration: 14,
            dependencies: ['waterproofing'],
            category: 'Работы'
        });
    }

    return stages;
};

interface ScheduleTask {
    id: string;
    name: string;
    start: Date;
    end: Date;
}

/**
 * Экспортировать график в текстовый формат для PDF
 * @param {Array} tasks - массив задач
 * @returns {string} - текстовое представление
 */
export const exportScheduleToText = (tasks: ScheduleTask[]) => {
    const duration = getProjectDuration(tasks);

    let text = `ГРАФИК ВЫПОЛНЕНИЯ РАБОТ\n\n`;
    text += `Начало проекта: ${duration.start?.toLocaleDateString('ru-RU') || 'N/A'}\n`;
    text += `Окончание проекта: ${duration.end?.toLocaleDateString('ru-RU') || 'N/A'}\n`;
    text += `Длительность: ${duration.days} рабочих дней (${duration.calendarDays} календарных)\n\n`;
    text += `ЭТАПЫ:\n\n`;

    tasks.forEach((task: ScheduleTask, index: number) => {
        const days = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
        text += `${index + 1}. ${task.name}\n`;
        text += `   Период: ${task.start.toLocaleDateString('ru-RU')} - ${task.end.toLocaleDateString('ru-RU')}\n`;
        text += `   Длительность: ${days} дней\n\n`;
    });

    return text;
};
