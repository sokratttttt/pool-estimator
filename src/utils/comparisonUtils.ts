import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EstimateItem {
    name: string;
    category?: string;
    section?: string;
    unit?: string;
    price?: number;
    quantity?: number;
    total?: number;
}

interface Estimate {
    id?: string;
    name?: string;
    total?: number;
    items?: EstimateItem[];
    selection?: {
        items?: EstimateItem[];
    };
}

interface GroupedItem {
    name: string;
    category: string;
    unit: string;
    prices: number[];
    quantities: number[];
}

export const exportToComparisonPDF = async (estimates: Estimate[]): Promise<void> => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('Сравнение смет', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 28);

    // Prepare data
    const allItemsMap = new Map<string, GroupedItem>();

    // Collect all unique items
    estimates.forEach((est: Estimate, index: number) => {
        const items = est.items || est.selection?.items || [];
        items.forEach((item: EstimateItem) => {
            const key = item.name;
            if (!allItemsMap.has(key)) {
                allItemsMap.set(key, {
                    name: item.name,
                    category: item.category || item.section || 'Прочее',
                    unit: item.unit || 'шт',
                    prices: new Array(estimates.length).fill(0),
                    quantities: new Array(estimates.length).fill(0)
                });
            }
            const entry = allItemsMap.get(key)!;
            entry.prices[index] = item.total || ((item.price || 0) * (item.quantity || 0));
            entry.quantities[index] = item.quantity || 0;
        });
    });

    // Group by category
    const grouped: Record<string, GroupedItem[]> = {};
    allItemsMap.forEach((item: GroupedItem) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    // Build table body
    type TableCell = string | { content: string; colSpan?: number; styles?: Record<string, unknown> };
    const body: TableCell[][] = [];
    const headers: string[] = ['Наименование', 'Ед.'];
    estimates.forEach((est: Estimate) => headers.push(est.name || `Смета ${est.id}`));

    Object.keys(grouped).forEach((category: string) => {
        body.push([{
            content: category,
            colSpan: 2 + estimates.length,
            styles: { fillColor: [240, 248, 255], fontStyle: 'bold', textColor: [0, 51, 102] }
        }]);

        grouped[category].forEach((item: GroupedItem) => {
            const row: TableCell[] = [item.name, item.unit];
            item.prices.forEach((price: number, idx: number) => {
                row.push(`${price.toLocaleString('ru-RU')} ₽ (${item.quantities[idx]})`);
            });
            body.push(row);
        });
    });

    // Totals
    const totals = estimates.map((est: Estimate) => est.total || 0);
    body.push([{
        content: '',
        colSpan: 2 + estimates.length,
        styles: { fillColor: [255, 255, 255] }
    }]);

    body.push([{
        content: 'ИТОГО',
        styles: { fontStyle: 'bold' }
    }, '', ...totals.map((t: number) => ({
        content: `${t.toLocaleString('ru-RU')} ₽`,
        styles: { fontStyle: 'bold', fillColor: [0, 113, 227], textColor: 255 }
    }))]);

    autoTable(doc, {
        startY: 35,
        head: [headers],
        body: body,
        headStyles: { fillColor: [0, 51, 102], textColor: 255 },
        theme: 'grid'
    });

    doc.save(`Сравнение_смет_${new Date().toLocaleDateString('ru-RU')}.pdf`);
};