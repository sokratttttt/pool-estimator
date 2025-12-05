import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToComparisonPDF = async (estimates: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('Сравнение смет', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 28);

    // Prepare data
    const allItemsMap = new Map();

    // Collect all unique items
    estimates.forEach((est: any, index: number) => {
        const items = est.items || est.selection?.items || [];
        items.forEach(item => {
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
            const entry = allItemsMap.get(key);
            entry.prices[index] = item.total || (item.price * item.quantity);
            entry.quantities[index] = item.quantity;
        });
    });

    // Group by category
    const grouped = {};
    allItemsMap.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    // Build table body
    const body: any[] = [];
    const headers = ['Наименование', 'Ед.'];
    estimates.forEach(est => headers.push(est.name || `Смета ${est.id}`));

    Object.keys(grouped).forEach(category => {
        body.push([{
            content: category,
            colSpan: 2 + estimates.length,
            styles: { fillColor: [240, 248, 255], fontStyle: 'bold', textColor: [0, 51, 102] }
        }]);

        grouped[category].forEach(item => {
            const row = [item.name, item.unit];
            item.prices.forEach((price: any, idx: number) => {
                row.push(`${price.toLocaleString('ru-RU')} ₽ (${item.quantities[idx]})`);
            });
            body.push(row);
        });
    });

    // Totals
    const totals = estimates.map(est => est.total || 0);
    body.push([{
        content: '',
        colSpan: 2 + estimates.length,
        styles: { fillColor: [255, 255, 255], minCellHeight: 5 }
    }]);

    body.push([{
        content: 'ИТОГО',
        styles: { fontStyle: 'bold' }
    }, '', ...totals.map(t => ({
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