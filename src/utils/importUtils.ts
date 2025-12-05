import ExcelJS from 'exceljs';

interface ImportedItem {
    name: string;
    price: number;
    id: string;
    description?: string;
    source: string;
    [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseExcelCatalog = async (file: any, source: string) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);

    const worksheet = workbook.getWorksheet(1); // Assume first sheet
    const items: ImportedItem[] = [];

    if (!worksheet) {
        return items;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    worksheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber === 1) return; // Skip header

        // Default mapping (can be adjusted based on actual file structure)
        // Assuming: A=Name, B=Price, C=Article/ID, D=Category/Description
        // We will refine this when we see the actual files.

        const rowValues = row.values;
        // row.values is 1-based array, so index 1 is column A

        let item: Partial<ImportedItem> = {};

        if (source === 'aquapolis') {
            // Placeholder logic for Aquapolis
            item = {
                name: rowValues[1] as string, // Col A
                price: (parseFloat(rowValues[2] as string) || 0), // Col B
                id: (rowValues[3] as string) || `aqua-${Date.now()}-${rowNumber}`, // Col C or generate
                description: (rowValues[4] as string) || '',
                source: 'aquapolis'
            };
        } else if (source === 'xenozone') {
            // Placeholder logic for Xenozone
            item = {
                name: rowValues[1] as string,
                price: (parseFloat(rowValues[2] as string) || 0),
                id: (rowValues[3] as string) || `xeno-${Date.now()}-${rowNumber}`,
                description: (rowValues[4] as string) || '',
                source: 'xenozone'
            };
        } else {
            // Generic fallback
            item = {
                name: rowValues[1] as string,
                price: (parseFloat(rowValues[2] as string) || 0),
                id: `import-${Date.now()}-${rowNumber}`,
                source: 'unknown'
            };
        }

        if (item.name && item.price) {
            items.push(item as ImportedItem);
        }
    });

    return items;
};
