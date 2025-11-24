import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

// Generate unique sequential document number
const getNextDocumentNumber = () => {
    const currentYear = new Date().getFullYear();
    const storageKey = `estimate_counter_${currentYear}`;
    let counter = parseInt(localStorage.getItem(storageKey) || '0');
    counter++;
    localStorage.setItem(storageKey, counter.toString());
    return `КП-${counter.toString().padStart(3, '0')}/${currentYear}`;
};

// Helper to load PDF settings
const getPDFSettings = () => {
    try {
        const saved = localStorage.getItem('pdf-settings');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load PDF settings:', e);
    }
    return {
        companyName: 'MOS-POOL',
        primaryColor: '#00b4d8',
        secondaryColor: '#003366',
        footerText: 'Спасибо за сотрудничество!',
        phone: '+7 (919) 296-16-47',
        email: 'info@mos-pool.ru'
    };
};

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Excel Export
export const exportToExcel = async (items, totalSum, clientInfo) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Коммерческое предложение');
    const settings = getPDFSettings();

    // Convert hex colors to Excel ARGB format
    const hexToARGB = (hex) => {
        const normalized = hex.replace('#', '');
        return 'FF' + normalized.toUpperCase();
    };

    const colors = {
        primary: hexToARGB(settings.primaryColor),
        secondary: hexToARGB(settings.secondaryColor),
        lightGray: 'FFF8F9FA',
        mediumGray: 'FFE9ECEF',
        darkGray: 'FF6C757D',
        white: 'FFFFFFFF'
    };

    worksheet.columns = [
        { width: 50 },
        { width: 10 },
        { width: 10 },
        { width: 15 },
        { width: 15 }
    ];

    let currentRow = 1;

    // Title
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = settings.companyName;
    titleCell.font = { name: 'Arial', size: 24, bold: true, color: { argb: colors.primary } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    currentRow++;

    // Subtitle
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const subtitleCell = worksheet.getCell(`A${currentRow}`);
    subtitleCell.value = 'ПРОФЕССИОНАЛЬНОЕ СТРОИТЕЛЬСТВО БАССЕЙНОВ';
    subtitleCell.font = { name: 'Arial', size: 10, color: { argb: colors.darkGray } };
    currentRow += 2;

    // Document title
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const docTitleCell = worksheet.getCell(`A${currentRow}`);
    docTitleCell.value = 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ';
    docTitleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: colors.secondary } };
    currentRow += 2;

    // Table header
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = ['Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'];
    headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: colors.white } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primary } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow++;

    // Items
    items.forEach((item) => {
        const itemRow = worksheet.getRow(currentRow);
        itemRow.values = [
            item.name,
            item.unit || 'шт',
            item.quantity,
            item.price,
            item.total || (item.price * item.quantity)
        ];
        itemRow.getCell(4).numFmt = '#,##0 ₽';
        itemRow.getCell(5).numFmt = '#,##0 ₽';
        currentRow++;
    });

    // Total
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const totalLabelCell = worksheet.getCell(`A${currentRow}`);
    totalLabelCell.value = 'ИТОГО:';
    totalLabelCell.font = { name: 'Arial', size: 12, bold: true };
    totalLabelCell.alignment = { horizontal: 'right' };

    const totalValueCell = worksheet.getCell(`E${currentRow}`);
    totalValueCell.value = totalSum;
    totalValueCell.font = { name: 'Arial', size: 12, bold: true };
    totalValueCell.numFmt = '#,##0 ₽';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Смета_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`);
};

// PDF Export with jspdf-autotable
export const exportToPDF = async (items, totalSum, clientInfo) => {
    try {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const documentNumber = getNextDocumentNumber();
        const doc = new jsPDF();
        const settings = getPDFSettings();

        // Try to load Russian font with fallback
        let fontLoaded = false;
        try {
            const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
            const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
            const fontBase64 = arrayBufferToBase64(fontBytes);

            doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
            fontLoaded = true;
        } catch (fontError) {
            console.warn('Failed to load Russian font, using default:', fontError);
        }

        // Header
        doc.setFontSize(24);
        doc.setTextColor(0, 113, 227);
        doc.text(settings.companyName || 'MOS-POOL', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('ПРОФЕССИОНАЛЬНОЕ СТРОИТЕЛЬСТВО БАССЕЙНОВ', 14, 26);

        // Document Info
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`ДОКУМЕНТ № ${documentNumber}`, 140, 20);
        doc.text(`ДАТА: ${new Date().toLocaleDateString('ru-RU')}`, 140, 26);

        // Title
        doc.setFontSize(18);
        doc.setTextColor(0, 113, 227);
        doc.text('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', 14, 40);

        // Client Info
        doc.setFontSize(10);
        doc.setTextColor(0);
        if (clientInfo?.name) {
            doc.text(`Заказчик: ${clientInfo.name}`, 14, 50);
        }
        if (clientInfo?.phone) {
            doc.text(`Телефон: ${clientInfo.phone}`, 14, 55);
        }

        doc.text(`Менеджер: ${clientInfo?.managerName || 'Платон'}`, 140, 50);
        doc.text(`Телефон: ${settings.phone || '+7 (919) 296-16-47'}`, 140, 55);

        // Prepare table data
        const tableBody = [];
        const grouped = items.reduce((acc, item) => {
            const category = item.section || item.category || 'Прочее';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        Object.keys(grouped).forEach(category => {
            tableBody.push([{
                content: category,
                colSpan: 5,
                styles: { fillColor: [227, 242, 253], fontStyle: 'bold', textColor: [13, 71, 161] }
            }]);

            let categoryTotal = 0;
            grouped[category].forEach(item => {
                const total = (item.price || 0) * (item.quantity || 1);
                categoryTotal += total;

                tableBody.push([
                    item.name,
                    item.unit || 'шт',
                    item.quantity,
                    (item.price || 0).toLocaleString('ru-RU'),
                    total.toLocaleString('ru-RU')
                ]);
            });

            tableBody.push([{
                content: `Итого по разделу: ${categoryTotal.toLocaleString('ru-RU')} ₽`,
                colSpan: 5,
                styles: { fontStyle: 'bold', halign: 'right', fillColor: [245, 245, 245] }
            }]);
        });

        tableBody.push([{
            content: `ИТОГО: ${totalSum.toLocaleString('ru-RU')} ₽`,
            colSpan: 5,
            styles: { fontStyle: 'bold', halign: 'right', fillColor: [0, 113, 227], textColor: 255, fontSize: 12 }
        }]);

        // Generate Table
        autoTable(doc, {
            startY: 65,
            head: [['Наименование', 'Ед.', 'Кол-во', 'Цена', 'Сумма']],
            body: tableBody,
            styles: fontLoaded ? { font: 'Roboto', fontSize: 9 } : { fontSize: 9 },
            headStyles: { fillColor: [0, 113, 227], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 15, halign: 'center' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' }
            }
        });

        // Footer
        const finalY = doc.lastAutoTable.finalY || 200;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(settings.footerText || 'Спасибо за сотрудничество!', 14, finalY + 15);

        if (settings.email) {
            doc.text(`Email: ${settings.email}`, 14, finalY + 20);
        }

        // Save
        const fileName = `Смета_${documentNumber}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error('PDF Export Error:', error);
        throw new Error(`Ошибка экспорта PDF: ${error.message}`);
    }
};
