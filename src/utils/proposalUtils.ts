import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Функция для загрузки шрифта
const loadFonts = async (doc: any) => {
    try {
        const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
        if (!response.ok) throw new Error('Failed to load font');

        const blob = await response.blob();
        const reader = new FileReader();

        return new Promise((resolve: any, reject: any) => {
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64data = result ? result.split(',')[1] : null;
                if (base64data) {
                    doc.addFileToVFS('Roboto-Regular.ttf', base64data);
                    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
                    doc.setFont('Roboto');
                    resolve(true);
                } else {
                    reject(new Error('Failed to convert font to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading font:', error);
        // Fallback to standard font if loading fails (will show garbage for Cyrillic but better than crash)
        doc.setFont('helvetica');
        return false;
    }
};

export const generateProposal = async (items: any, totalSum: any, clientInfo: any, estimateId: string) => {
    const doc: any = new jsPDF();

    // Загружаем шрифт перед генерацией
    await loadFonts(doc);

    let currentY = 20;

    // =============== ОБЛОЖКА ===============
    doc.setFontSize(32);
    doc.setTextColor(0, 180, 216);
    doc.text('MOSPOOL', 105, 40, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Проектирование и строительство бассейнов и SPA', 105, 48, { align: 'center' });

    doc.setDrawColor(0, 180, 216);
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);

    doc.setFontSize(24);
    doc.setTextColor(0, 51, 102);
    doc.text('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', 105, 80, { align: 'center' });

    const date = new Date();
    const dateStr = date.toLocaleDateString('ru-RU');
    const proposalNumber = `КП-${estimateId ? estimateId.slice(-4) : Math.floor(Math.random() * 10000)}`;

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(`№ ${proposalNumber} от ${dateStr}`, 105, 95, { align: 'center' });

    if (clientInfo && clientInfo.name) {
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text('Для:', 105, 120, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(clientInfo.name, 105, 130, { align: 'center' });

        if (clientInfo.phone) {
            doc.setFontSize(11);
            doc.setTextColor(80);
            doc.text(`тел: ${clientInfo.phone}`, 105, 140, { align: 'center' });
        }
    }

    doc.setFontSize(18);
    doc.setTextColor(0, 180, 216);
    doc.text('Стоимость проекта:', 105, 180, { align: 'center' });

    doc.setFontSize(28);
    doc.text(`${totalSum.toLocaleString('ru-RU')} ₽`, 105, 195, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Москва и Московская область', 105, 260, { align: 'center' });
    doc.text('+7 985 200-00-41 | mospool@mail.ru', 105, 267, { align: 'center' });
    doc.text('www.mos-pool.ru', 105, 274, { align: 'center' });

    // =============== СТРАНИЦА 2: О КОМПАНИИ ===============
    doc.addPage();
    currentY = 20;

    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('О КОМПАНИИ MOSPOOL', 20, currentY);
    currentY += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const aboutText = [
        'Компания MOSPOOL специализируется на строительстве бассейнов, хаммамов,',
        'бань, саун, джакузи, купелей и SPA-комплексов под ключ.',
        '',
        'Мы предлагаем:',
        '• Понятные сметы с фиксированной стоимостью',
        '• Четкие сроки выполнения работ',
        '• Официальную гарантию на все работы',
        '• Использование качественного европейского оборудования',
        '• Профессиональную команду специалистов с опытом более 10 лет'
    ];

    aboutText.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 7;
    });

    currentY += 10;

    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('НАШИ ПРЕИМУЩЕСТВА', 20, currentY);
    currentY += 12;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const advantages = [
        { title: 'Опыт', text: 'Более 100 реализованных проектов различной сложности' },
        { title: 'Качество', text: 'Используем проверенное европейское оборудование топ-брендов' },
        { title: 'Гарантия', text: 'Предоставляем официальную гарантию на работы и оборудование' },
        { title: 'Сервис', text: 'Полное сопровождение проекта от проектирования до сдачи' }
    ];

    advantages.forEach(adv => {
        doc.text(`◆ ${adv.title}:`, 20, currentY);
        const textLines = doc.splitTextToSize(adv.text, 160);
        doc.text(textLines, 28, currentY + 5);
        currentY += 15;
    });

    // =============== СТРАНИЦА 3+: СОСТАВ ПРЕДЛОЖЕНИЯ ===============
    doc.addPage();
    currentY = 20;

    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('СОСТАВ КОММЕРЧЕСКОГО ПРЕДЛОЖЕНИЯ', 20, currentY);
    currentY += 15;

    const grouped: any = {};
    items.forEach((item: any) => {
        const category = item.category || item.section || 'Прочее';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(item);
    });

    Object.keys(grouped).forEach(category => {
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 180, 216);
        doc.text(category, 20, currentY);
        currentY += 10;

        const tableData = grouped[category].map((item: any) => [
            item.name,
            item.quantity || 1,
            item.unit || 'шт',
            item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : '',
            item.total ? `${item.total.toLocaleString('ru-RU')} ₽` : ''
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Наименование', 'Кол-во', 'Ед.', 'Цена', 'Сумма']],
            body: tableData,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                font: 'Roboto', // Важно: используем загруженный шрифт
                fontStyle: 'normal'
            },
            headStyles: { fillColor: [0, 180, 216], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 20, right: 20 }
        });

        currentY = doc.lastAutoTable.finalY + 15;
    });

    // =============== ИТОГОВАЯ СТРАНИЦА ===============
    doc.addPage();
    currentY = 20;

    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('ИТОГО', 20, currentY);
    currentY += 20;

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('ОБЩАЯ СТОИМОСТЬ:', 20, currentY);

    doc.setFontSize(24);
    doc.setTextColor(0, 180, 216);
    doc.text(`${totalSum.toLocaleString('ru-RU')} ₽`, 120, currentY);
    currentY += 30;

    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('УСЛОВИЯ СОТРУДНИЧЕСТВА', 20, currentY);
    currentY += 12;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const terms = [
        '• Оплата: 30% предоплата, 70% по факту выполнения работ',
        '• Срок выполнения: рассчитывается индивидуально',
        '• Гарантия: 2 года на выполненные работы',
        '• Гарантия на оборудование: согласно гарантии производителя'
    ];

    terms.forEach(term => {
        doc.text(term, 20, currentY);
        currentY += 8;
    });

    currentY += 15;

    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('ВАШ МЕНЕДЖЕР', 20, currentY);
    currentY += 12;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    if (clientInfo?.managerName) {
        doc.text(`Менеджер: ${clientInfo.managerName}`, 20, currentY);
        currentY += 8;
    }
    if (clientInfo?.managerPhone) {
        doc.text(`Телефон: ${clientInfo.managerPhone}`, 20, currentY);
        currentY += 8;
    }

    currentY += 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Данное коммерческое предложение не является публичной офертой.', 20, currentY);
    currentY += 6;
    doc.text('Окончательная стоимость определяется после осмотра объекта.', 20, currentY);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`MOSPOOL | ${proposalNumber}`, 20, 287);
        doc.text(`Страница ${i} из ${pageCount}`, 180, 287);
    }

    const fileName = `КП_${proposalNumber}_${clientInfo?.name || 'Клиент'}.pdf`;
    doc.save(fileName);

    return fileName;
};