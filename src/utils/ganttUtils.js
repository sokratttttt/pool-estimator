/**
 * Утилиты для расчета графика работ (диаграмма Ганта)
 */

/**
 * Стандартные этапы строительства бассейна с длительностью
 */
const STANDARD_STAGES = [
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
const addWorkingDays = (date, days) => {
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
export const calculateSchedule = (stages = STANDARD_STAGES, startDate = new Date()) => {
    const tasks = [];
    const stageEndDates = {};
    
    stages.forEach((stage) => {
        // Определяем дату начала этапа
        let taskStart = new Date(startDate);
        
        // Если есть зависимости, берем максимальную дату окончания
        if (stage.dependencies && stage.dependencies.length > 0) {
            const dependencyDates = stage.dependencies.map(depId => stageEndDates[depId]);
            const maxDependencyDate = new Date(Math.max(...dependencyDates));
            taskStart = new Date(maxDependencyDate);
            taskStart.setDate(taskStart.getDate() + 1); // Начинаем на следующий день
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

/**
 * Получить цвет для категории этапа
 * @param {string} category - категория этапа
 * @returns {object} - стили для задачи
 */
const getStageColor = (category) => {
    const colorMap = {
        'Земляные работы': { backgroundColor: '#8B4513', backgroundSelectedColor: '#A0522D' },
        'Работы': { backgroundColor: '#0071E3', backgroundSelectedColor: '#0077ED' },
        'Оборудование': { backgroundColor: '#00B4D8', backgroundSelectedColor: '#00C4E8' },
        'Сервис': { backgroundColor: '#34C759', backgroundSelectedColor: '#3ED368' }
    };
    
    return colorMap[category] || { backgroundColor: '#666', backgroundSelectedColor: '#777' };
};

/**
 * Рассчитать общую длительность проекта
 * @param {Array} tasks - массив задач
 * @returns {object} - информация о сроках
 */
export const getProjectDuration = (tasks) => {
    if (!tasks || tasks.length === 0) {
        return { days: 0, start: null, end: null };
    }
    
    const start = new Date(Math.min(...tasks.map(t => t.start)));
    const end = new Date(Math.max(...tasks.map(t => t.end)));
    
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
        calendarDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
        start,
        end
    };
};

/**
 * Автоматически определить этапы на основе выбранных работ в смете
 * @param {Array} items - позиции сметы
 * @returns {Array} - адаптированные этапы
 */
export const detectStagesFromItems = (items) => {
    // Базовые этапы всегда присутствуют
    const stages = [...STANDARD_STAGES];
    
    // Можно добавить логику для адаптации этапов на основе конкретных работ
    // Например, если в смете есть "SPA" - добавить этап "Монтаж SPA"
    
    const hasHammam = items.some(item => 
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

/**
 * Экспортировать график в текстовый формат для PDF
 * @param {Array} tasks - массив задач
 * @returns {string} - текстовое представление
 */
export const exportScheduleToText = (tasks) => {
    const duration = getProjectDuration(tasks);
    
    let text = `ГРАФИК ВЫПОЛНЕНИЯ РАБОТ\n\n`;
    text += `Начало проекта: ${duration.start.toLocaleDateString('ru-RU')}\n`;
    text += `Окончание проекта: ${duration.end.toLocaleDateString('ru-RU')}\n`;
    text += `Длительность: ${duration.days} рабочих дней (${duration.calendarDays} календарных)\n\n`;
    text += `ЭТАПЫ:\n\n`;
    
    tasks.forEach((task, index) => {
        const days = Math.ceil((task.end - task.start) / (1000 * 60 * 60 * 24));
        text += `${index + 1}. ${task.name}\n`;
        text += `   Период: ${task.start.toLocaleDateString('ru-RU')} - ${task.end.toLocaleDateString('ru-RU')}\n`;
        text += `   Длительность: ${days} дней\n\n`;
    });
    
    return text;
};
