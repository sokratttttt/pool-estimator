import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export const generateContract = async (clientInfo, totalSum, estimateId) => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('ru-RU');
    const contractNumber = `Д-${estimateId ? estimateId.slice(-4) : Math.floor(Math.random() * 10000)}`;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Header
                new Paragraph({
                    text: "ДОГОВОР ПОДРЯДА",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `№ ${contractNumber}`, bold: true }),
                        new TextRun({ text: `                                                                            ${dateStr} г.` })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                // City
                new Paragraph({
                    text: "г. Москва",
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 400 }
                }),

                // Parties
                new Paragraph({
                    children: [
                        new TextRun({ text: "Компания «MOS-POOL»", bold: true }),
                        new TextRun({ text: ", именуемая в дальнейшем «Подрядчик», с одной стороны, и " }),
                        new TextRun({ text: clientInfo?.name || "_______________________", bold: true }),
                        new TextRun({ text: ", именуемый(ая) в дальнейшем «Заказчик», с другой стороны, заключили настоящий Договор о нижеследующем:" })
                    ],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 300 }
                }),

                // 1. Subject
                new Paragraph({
                    text: "1. ПРЕДМЕТ ДОГОВОРА",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                }),
                new Paragraph({
                    text: "1.1. Подрядчик обязуется выполнить работы по строительству плавательного бассейна и монтажу оборудования, а Заказчик обязуется принять результаты работ и оплатить их.",
                    alignment: AlignmentType.JUSTIFIED
                }),
                new Paragraph({
                    text: "1.2. Объем и стоимость работ определяются Сметой (Приложение №1), являющейся неотъемлемой частью настоящего Договора.",
                    alignment: AlignmentType.JUSTIFIED
                }),

                // 2. Cost
                new Paragraph({
                    text: "2. СТОИМОСТЬ РАБОТ И ПОРЯДОК РАСЧЕТОВ",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "2.1. Общая стоимость работ и оборудования по настоящему Договору составляет: " }),
                        new TextRun({ text: `${totalSum.toLocaleString('ru-RU')} (__________________________) рублей.`, bold: true, highlight: "yellow" })
                    ],
                    alignment: AlignmentType.JUSTIFIED
                }),
                new Paragraph({
                    text: "2.2. Оплата производится поэтапно согласно Графику платежей (Приложение №2).",
                    alignment: AlignmentType.JUSTIFIED
                }),

                // 3. Terms
                new Paragraph({
                    text: "3. СРОКИ ВЫПОЛНЕНИЯ РАБОТ",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                }),
                new Paragraph({
                    text: "3.1. Начало работ: в течение 5 рабочих дней с момента получения аванса.",
                    alignment: AlignmentType.JUSTIFIED
                }),
                new Paragraph({
                    text: "3.2. Срок выполнения работ: 45 рабочих дней (ориентировочно).",
                    alignment: AlignmentType.JUSTIFIED
                }),

                // Signatures Table
                new Paragraph({
                    text: "4. АДРЕСА И РЕКВИЗИТЫ СТОРОН",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({ text: "ПОДРЯДЧИК:", bold: true }),
                                        new Paragraph({ text: "MOS-POOL" }),
                                        new Paragraph({ text: "ИНН: ____________" }),
                                        new Paragraph({ text: "Тел: +7 (919) 296-16-47" }),
                                        new Paragraph({ text: "Email: info@mos-pool.ru" }),
                                        new Paragraph({ text: "" }),
                                        new Paragraph({ text: "________________ / ___________" })
                                    ],
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({ text: "ЗАКАЗЧИК:", bold: true }),
                                        new Paragraph({ text: clientInfo?.name || "ФИО: ____________________" }),
                                        new Paragraph({ text: `Тел: ${clientInfo?.phone || "____________________"}` }),
                                        new Paragraph({ text: `Email: ${clientInfo?.email || "____________________"}` }),
                                        new Paragraph({ text: "Паспорт: ________________" }),
                                        new Paragraph({ text: "" }),
                                        new Paragraph({ text: "________________ / ___________" })
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Договор_${contractNumber}_${clientInfo?.name || 'Клиент'}.docx`);
};
