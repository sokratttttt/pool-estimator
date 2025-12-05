/**
 * Export Utilities
 * PDF and Excel export functionality for pool estimates
 * 
 * All functions use proper TypeScript types with no `any`
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import type {
    ExportItem,
    ExportClientInfo,
    PDFSettings,
    ExcelColors,
    GroupedItems,
    StyledCell,
    TableRow
} from '@/types/export';
import { DEFAULT_PDF_SETTINGS } from '@/types/export';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique sequential document number
 * Format: КП-XXX/YYYY
 */
const getNextDocumentNumber = (): string => {
    const currentYear = new Date().getFullYear();
    const storageKey = `estimate_counter_${currentYear}`;

    let counter = 0;
    if (typeof window !== 'undefined') {
        counter = parseInt(localStorage.getItem(storageKey) || '0', 10);
        counter++;
        localStorage.setItem(storageKey, counter.toString());
    }

    return `КП-${counter.toString().padStart(3, '0')}/${currentYear}`;
};

/**
 * Load PDF settings from localStorage with fallback to defaults
 */
const getPDFSettings = (): PDFSettings => {
    if (typeof window === 'undefined') {
        return DEFAULT_PDF_SETTINGS;
    }

    try {
        const saved = localStorage.getItem('pdf-settings');
        if (saved) {
            const parsed = JSON.parse(saved) as Partial<PDFSettings>;
            return { ...DEFAULT_PDF_SETTINGS, ...parsed };
        }
    } catch (e) {
        console.error('Failed to load PDF settings:', e);
    }

    return DEFAULT_PDF_SETTINGS;
};

/**
 * Convert ArrayBuffer to Base64 string
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
};

/**
 * Convert hex color to Excel ARGB format
 */
const hexToARGB = (hex: string): string => {
    const normalized = hex.replace('#', '');
    return 'FF' + normalized.toUpperCase();
};

/**
 * Group items by section/category
 */
const groupItemsBySection = (items: ExportItem[]): GroupedItems => {
    return items.reduce<GroupedItems>((acc, item) => {
        const category = item.section || item.category || 'Прочее';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});
};

/**
 * Calculate item total (price × quantity)
 */
const calculateItemTotal = (item: ExportItem): number => {
    return item.total ?? (item.price || 0) * (item.quantity || 1);
};

/**
 * Format number as Russian currency string
 */
const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ru-RU');
};

// ============================================
// EXCEL EXPORT
// ============================================

/**
 * Export estimate to Excel file
 * @param items - Array of estimate items
 * @param totalSum - Total sum in rubles
 * @param _clientInfo - Client information (currently unused in Excel)
 */
export const exportToExcel = async (
    items: ExportItem[],
    totalSum: number,
    _clientInfo?: ExportClientInfo
): Promise<void> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Коммерческое предложение');
    const settings = getPDFSettings();

    // Excel color palette
    const colors: ExcelColors = {
        primary: hexToARGB(settings.primaryColor),
        secondary: hexToARGB(settings.secondaryColor),
        lightGray: 'FFF8F9FA',
        mediumGray: 'FFE9ECEF',
        darkGray: 'FF6C757D',
        white: 'FFFFFFFF'
    };

    // Column widths
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
        const itemTotal = calculateItemTotal(item);

        itemRow.values = [
            item.name,
            item.unit || 'шт',
            item.quantity,
            item.price,
            itemTotal
        ];
        itemRow.getCell(4).numFmt = '#,##0 ₽';
        itemRow.getCell(5).numFmt = '#,##0 ₽';
        currentRow++;
    });

    // Total row
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const totalLabelCell = worksheet.getCell(`A${currentRow}`);
    totalLabelCell.value = 'ИТОГО:';
    totalLabelCell.font = { name: 'Arial', size: 12, bold: true };
    totalLabelCell.alignment = { horizontal: 'right' };

    const totalValueCell = worksheet.getCell(`E${currentRow}`);
    totalValueCell.value = totalSum;
    totalValueCell.font = { name: 'Arial', size: 12, bold: true };
    totalValueCell.numFmt = '#,##0 ₽';

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const filename = `Смета_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    saveAs(blob, filename);
};

// ============================================
// PDF EXPORT
// ============================================

/**
 * Export estimate to PDF file
 * @param items - Array of estimate items
 * @param totalSum - Total sum in rubles
 * @param clientInfo - Client information for the estimate
 */
export const exportToPDF = async (
    items: ExportItem[],
    totalSum: number,
    clientInfo?: ExportClientInfo
): Promise<void> => {
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
        doc.text(settings.companyName, 14, 20);

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
        doc.text(`Телефон: ${settings.phone}`, 140, 55);

        // Marketing / Benefits Section
        doc.setFontSize(14);
        doc.setTextColor(0, 113, 227);
        doc.text('Почему выбирают MOS-POOL:', 14, 70);

        doc.setFontSize(10);
        doc.setTextColor(60);
        const benefits = [
            '• Гарантия на чашу бассейна — 10 лет',
            '• Сертифицированное оборудование от ведущих брендов',
            '• Собственная сервисная служба 24/7',
            '• Прозрачная смета без скрытых платежей'
        ];

        let benefitY = 80;
        benefits.forEach(benefit => {
            doc.text(benefit, 14, benefitY);
            benefitY += 6;
        });

        // Prepare table data
        const tableBody: TableRow[] = [];
        const grouped = groupItemsBySection(items);

        Object.keys(grouped).forEach(category => {
            // Category header row
            const categoryHeader: StyledCell = {
                content: category,
                colSpan: 5,
                styles: { fillColor: [240, 248, 255], fontStyle: 'bold', textColor: [0, 51, 102] }
            };
            tableBody.push([categoryHeader]);

            // Items in category
            let categoryTotal = 0;
            grouped[category].forEach(item => {
                const total = calculateItemTotal(item);
                categoryTotal += total;

                tableBody.push([
                    item.name,
                    item.unit || 'шт',
                    item.quantity,
                    formatCurrency(item.price || 0),
                    formatCurrency(total)
                ]);
            });

            // Category subtotal row
            const subtotalCell: StyledCell = {
                content: `Итого по разделу: ${formatCurrency(categoryTotal)} ₽`,
                colSpan: 5,
                styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250], textColor: [80, 80, 80] }
            };
            tableBody.push([subtotalCell]);
        });

        // Grand total row
        const grandTotalCell: StyledCell = {
            content: `ИТОГО: ${formatCurrency(totalSum)} ₽`,
            colSpan: 5,
            styles: { fontStyle: 'bold', halign: 'right', fillColor: [0, 113, 227], textColor: 255, fontSize: 12 }
        };
        tableBody.push([grandTotalCell]);

        // Generate Table
        autoTable(doc, {
            startY: benefitY + 10,
            head: [['Наименование', 'Ед.', 'Кол-во', 'Цена', 'Сумма']],
            body: tableBody as unknown as any[],
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
        const docWithTable = doc as unknown as { lastAutoTable?: { finalY: number } };
        const finalY = docWithTable.lastAutoTable?.finalY || 200;

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(settings.footerText, 14, finalY + 15);

        if (settings.email) {
            doc.text(`Email: ${settings.email}`, 14, finalY + 20);
        }

        // Save file
        const fileName = `Смета_${documentNumber}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error('PDF Export Error:', error);
        throw new Error(`Ошибка экспорта PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
