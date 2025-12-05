/**
 * Export Types
 * Type definitions for PDF and Excel export functionality
 */

// ============================================
// EXPORT ITEM TYPES
// ============================================

/**
 * Single item in an estimate for export
 */
export interface ExportItem {
    id?: string;
    name: string;
    description?: string;
    quantity: number;
    unit: string;        // 'шт', 'м²', 'м³', 'час', 'компл'
    price: number;       // price per unit
    total?: number;      // quantity × price (calculated if not provided)
    category?: string;   // category name
    section?: string;    // section name for grouping
}

/**
 * Client information for estimate
 */
export interface ExportClientInfo {
    id?: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;          // ИНН
    managerName?: string;    // assigned manager
}

// ============================================
// PDF SETTINGS
// ============================================

/**
 * PDF generation settings (from localStorage)
 */
export interface PDFSettings {
    companyName: string;
    primaryColor: string;    // hex color
    secondaryColor: string;  // hex color
    footerText: string;
    phone: string;
    email: string;
    logoUrl?: string;
}

/**
 * Default PDF settings
 */
export const DEFAULT_PDF_SETTINGS: PDFSettings = {
    companyName: 'MOS-POOL',
    primaryColor: '#00b4d8',
    secondaryColor: '#003366',
    footerText: 'Спасибо за сотрудничество!',
    phone: '+7 (919) 296-16-47',
    email: 'info@mos-pool.ru'
};

// ============================================
// EXCEL TYPES
// ============================================

/**
 * Excel color palette (ARGB format)
 */
export interface ExcelColors {
    primary: string;
    secondary: string;
    lightGray: string;
    mediumGray: string;
    darkGray: string;
    white: string;
}

// ============================================
// GROUPED DATA TYPES
// ============================================

/**
 * Items grouped by category/section
 */
export type GroupedItems = Record<string, ExportItem[]>;

/**
 * Table row for PDF generation (can be string[] or styled cell)
 */
export type TableRow = (string | number | StyledCell)[];

/**
 * Styled cell for PDF tables
 */
export interface StyledCell {
    content: string;
    colSpan?: number;
    styles?: CellStyles;
}

/**
 * Cell styling options (compatible with jspdf-autotable)
 */
export interface CellStyles {
    fillColor?: [number, number, number];
    textColor?: number | [number, number, number];
    fontStyle?: 'normal' | 'bold' | 'italic';
    halign?: 'left' | 'center' | 'right';
    fontSize?: number;
}

// ============================================
// EXPORT RESULT TYPES
// ============================================

/**
 * Result of export operation
 */
export interface ExportResult {
    success: boolean;
    filename: string;
    error?: string;
}

// ============================================
// FUNCTION PARAMETER TYPES
// ============================================

/**
 * Parameters for exportToExcel function
 */
export interface ExcelExportParams {
    items: ExportItem[];
    totalSum: number;
    clientInfo?: ExportClientInfo;
}

/**
 * Parameters for exportToPDF function
 */
export interface PDFExportParams {
    items: ExportItem[];
    totalSum: number;
    clientInfo?: ExportClientInfo;
}
