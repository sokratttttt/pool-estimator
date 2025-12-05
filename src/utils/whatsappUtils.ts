/**
 * Утилиты для интеграции с WhatsApp
 */

/**
 * Форматирование номера телефона для WhatsApp API
 * Убирает все символы кроме цифр
 * @param {string} phone - номер телефона в любом формате
 * @returns {string} - номер в формате 79852000041
 */
export const formatPhoneForWhatsApp = (phone: any) => {
    if (!phone) return '';

    // Убираем все символы кроме цифр
    let cleaned = phone.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 7
    if (cleaned.startsWith('8')) {
        cleaned = '7' + cleaned.slice(1);
    }

    // Если не начинается с 7, добавляем 7
    if (!cleaned.startsWith('7')) {
        cleaned = '7' + cleaned;
    }

    return cleaned;
};

/**
 * Генерация текста сообщения для WhatsApp
 * @param {Object} clientInfo - информация о клиенте
 * @param {Number} totalSum - итоговая сумма
 * @param {Array} items - позиции сметы (для краткого описания)
 * @returns {string} - текст сообщения
 */
export const generateWhatsAppMessage = (clientInfo: any, totalSum: any, items: any) => {
    const clientName = clientInfo?.name || 'Уважаемый клиент';
    const managerName = clientInfo?.managerName || 'Менеджер MOSPOOL';
    const managerPhone = clientInfo?.managerPhone || '+7 (985) 200-00-41';

    // Подсчитываем количество основных категорий
    const categories = new Set(items.map(item => item.category || item.section || 'Прочее'));
    const categoriesCount = categories.size;

    // Формируем текст
    const message = `Здравствуйте, ${clientName}!

Подготовил для вас коммерческое предложение на строительство бассейна.

📊 *Общая стоимость: ${totalSum.toLocaleString('ru-RU')} ₽*

Смета включает ${items.length} позиций в ${categoriesCount} категориях:
${Array.from(categories).slice(0, 5).map(cat => `• ${cat}`).join('\n')}

PDF-файл с подробной сметой отправлю следующим сообщением.

Свяжитесь со мной для уточнения деталей и согласования сроков выполнения.

С уважением,
${managerName}
${managerPhone}

---
MOSPOOL - Проектирование и строительство бассейнов
www.mos-pool.ru`;

    // Кодируем для URL
    return encodeURIComponent(message);
};

/**
 * Открыть WhatsApp с готовым сообщением
 * @param {string} phone - телефон клиента
 * @param {Object} clientInfo - информация о клиенте
 * @param {Number} totalSum - итоговая сумма
 * @param {Array} items - позиции сметы
 */
export const sendToWhatsApp = (phone: any, clientInfo: any, totalSum: any, items: any) => {
    // Форматируем телефон
    const formattedPhone = formatPhoneForWhatsApp(phone);

    if (!formattedPhone || formattedPhone.length < 11) {
        throw new Error('Некорректный номер телефона');
    }

    // Генерируем текст
    const message = generateWhatsAppMessage(clientInfo, totalSum, items);

    // Создаем URL для WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${message}`;

    // Открываем в новом окне
    window.open(whatsappUrl, '_blank');
};
