import { Document, Packer, Paragraph, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { supabase } from '@/lib/supabase';

const replacePlaceholders = (text: string | undefined, data: Record<string, string>) => {
    if (!text) return '';
    return text
        .replace(/{{CONTRACT_NUMBER}}/g, data.contractNumber)
        .replace(/{{DATE}}/g, data.dateStr)
        .replace(/{{CLIENT_NAME}}/g, data.clientName)
        .replace(/{{TOTAL_SUM}}/g, data.totalSum)
        .replace(/{{CLIENT_PHONE}}/g, data.clientPhone)
        .replace(/{{CLIENT_EMAIL}}/g, data.clientEmail);
};

const getAlignment = (align: string) => {
    switch (align) {
        case 'center': return AlignmentType.CENTER;
        case 'right': return AlignmentType.RIGHT;
        case 'justified': return AlignmentType.JUSTIFIED;
        default: return AlignmentType.LEFT;
    }
};

const getHeadingLevel = (level: number) => {
    switch (level) {
        case 1: return HeadingLevel.HEADING_1;
        case 2: return HeadingLevel.HEADING_2;
        case 3: return HeadingLevel.HEADING_3;
        default: return HeadingLevel.HEADING_1;
    }
};

interface ContractClientInfo {
    name?: string;
    phone?: string;
    email?: string;
}

export const generateContract = async (clientInfo: ContractClientInfo, totalSum: number, estimateId: string) => {
    try {
        // 1. Fetch default template
        const { data: templates, error } = await supabase
            .from('contract_templates')
            .select('*')
            .eq('is_default', true)
            .limit(1);

        if (error) throw error;

        const template = templates?.[0];

        // Fallback if no template found (or use hardcoded fallback)
        if (!template) {
            console.warn('No default template found, using fallback.');
            // ... fallback logic or error
            alert('Шаблон договора не найден. Пожалуйста, создайте шаблон в настройках.');
            return;
        }

        const date = new Date();
        const dateStr = date.toLocaleDateString('ru-RU');
        const contractNumber = `Д-${estimateId ? estimateId.slice(-4) : Math.floor(Math.random() * 10000)}`;

        const templateData = {
            contractNumber,
            dateStr,
            clientName: clientInfo?.name || "_______________________",
            clientPhone: clientInfo?.phone || "_______________________",
            clientEmail: clientInfo?.email || "_______________________",
            totalSum: totalSum.toLocaleString('ru-RU')
        };
        // ...

        const docChildren: (Paragraph | Table)[] = [];

        interface TemplateSection {
            type: string;
            text?: string;
            level?: number;
            alignment?: string;
        }

        // 2. Parse template sections
        template.content.sections.forEach((section: TemplateSection) => {
            if (section.type === 'signatures_table') {
                docChildren.push(
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
                                            new Paragraph({ text: "ПОДРЯДЧИК:" }),
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
                                            new Paragraph({ text: "ЗАКАЗЧИК:" }),
                                            new Paragraph({ text: replacePlaceholders("{{CLIENT_NAME}}", templateData) }),
                                            new Paragraph({ text: replacePlaceholders("Тел: {{CLIENT_PHONE}}", templateData) }),
                                            new Paragraph({ text: replacePlaceholders("Email: {{CLIENT_EMAIL}}", templateData) }),
                                            new Paragraph({ text: "Паспорт: ________________" }),
                                            new Paragraph({ text: "" }),
                                            new Paragraph({ text: "________________ / ___________" })
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    })
                );
            } else {
                const text = replacePlaceholders(section.text, templateData);

                docChildren.push(
                    new Paragraph({
                        text: text,
                        heading: section.type === 'heading' ? getHeadingLevel(section.level || 1) : undefined,
                        alignment: getAlignment(section.alignment || 'left'),
                        spacing: { after: 200 }
                    })
                );
            }
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: docChildren,
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Договор_${contractNumber}_${clientInfo?.name || 'Клиент'}.docx`);

    } catch (error) {
        console.error('Error generating contract:', error);
        alert('Ошибка при генерации договора: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
};
