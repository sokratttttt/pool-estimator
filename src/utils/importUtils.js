import ExcelJS from 'exceljs';

export const parseExcelCatalog = async (file, source) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);

    const worksheet = workbook.getWorksheet(1); // Assume first sheet
    const items = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        // Default mapping (can be adjusted based on actual file structure)
        // Assuming: A=Name, B=Price, C=Article/ID, D=Category/Description
        // We will refine this when we see the actual files.

        const rowValues = row.values;
        // row.values is 1-based array, so index 1 is column A

        let item = {};

        if (source === 'aquapolis') {
            // Placeholder logic for Aquapolis
            item = {
                name: rowValues[1], // Col A
                price: parseFloat(rowValues[2]) || 0, // Col B
                id: rowValues[3] || `aqua-${Date.now()}-${rowNumber}`, // Col C or generate
                description: rowValues[4] || '',
                source: 'aquapolis'
            };
        } else if (source === 'xenozone') {
            // Placeholder logic for Xenozone
            item = {
                name: rowValues[1],
                price: parseFloat(rowValues[2]) || 0,
                id: rowValues[3] || `xeno-${Date.now()}-${rowNumber}`,
                description: rowValues[4] || '',
                source: 'xenozone'
            };
        } else {
            // Generic fallback
            item = {
                name: rowValues[1],
                price: parseFloat(rowValues[2]) || 0,
                id: `import-${Date.now()}-${rowNumber}`,
                source: 'unknown'
            };
        }

        if (item.name && item.price) {
            items.push(item);
        }
    });

    return items;
};
