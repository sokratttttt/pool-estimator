'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface ProTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    selectable?: boolean;
    selectedRows?: Set<string | number>;
    onSelectionChange?: (selected: Set<string | number>) => void;
    onRowClick?: (row: T, index: number) => void;
    onRowDoubleClick?: (row: T, index: number) => void;
    actions?: (row: T) => React.ReactNode;
    emptyMessage?: string;
    loading?: boolean;
    stickyHeader?: boolean;
    compact?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function ProTable<T extends Record<string, unknown>>({
    columns,
    data,
    keyField,
    selectable = false,
    selectedRows = new Set(),
    onSelectionChange,
    onRowClick,
    onRowDoubleClick,
    actions,
    emptyMessage = 'Нет данных',
    loading = false,
    stickyHeader = true,
    compact = false
}: ProTableProps<T>) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortColumn as keyof T];
            const bVal = b[sortColumn as keyof T];

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortColumn, sortDirection]);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
            if (sortDirection === 'desc') setSortColumn(null);
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const toggleRowSelection = (rowKey: string | number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowKey)) {
            newSelected.delete(rowKey);
        } else {
            newSelected.add(rowKey);
        }
        onSelectionChange?.(newSelected);
    };

    const toggleAllSelection = () => {
        if (selectedRows.size === data.length) {
            onSelectionChange?.(new Set());
        } else {
            onSelectionChange?.(new Set(data.map(row => row[keyField] as string | number)));
        }
    };

    if (loading) {
        return (
            <div className="pro-table-loading">
                <div className="pro-table-skeleton" />
            </div>
        );
    }

    return (
        <div className={`pro-table-container ${compact ? 'compact' : ''}`}>
            <table className="pro-table">
                <thead className={stickyHeader ? 'sticky' : ''}>
                    <tr>
                        {selectable && (
                            <th style={{ width: '40px', textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={data.length > 0 && selectedRows.size === data.length}
                                    onChange={toggleAllSelection}
                                    className="pro-checkbox"
                                />
                            </th>
                        )}

                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                style={{
                                    width: col.width,
                                    textAlign: col.align || 'left',
                                    cursor: col.sortable ? 'pointer' : 'default'
                                }}
                                onClick={() => col.sortable && handleSort(String(col.key))}
                            >
                                <div className="pro-table-header-cell">
                                    <span>{col.header}</span>
                                    {col.sortable && sortColumn === col.key && (
                                        <span className="pro-table-sort-icon">
                                            {sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}

                        {actions && <th style={{ width: '80px', textAlign: 'center' }}>Действия</th>}
                    </tr>
                </thead>

                <tbody>
                    {sortedData.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                className="pro-table-empty"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((row, index) => {
                            const rowKey = row[keyField] as string | number;
                            const isSelected = selectedRows.has(rowKey);

                            return (
                                <tr
                                    key={rowKey}
                                    className={isSelected ? 'selected' : ''}
                                    onClick={() => onRowClick?.(row, index)}
                                    onDoubleClick={() => onRowDoubleClick?.(row, index)}
                                >
                                    {selectable && (
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleRowSelection(rowKey)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="pro-checkbox"
                                            />
                                        </td>
                                    )}

                                    {columns.map((col) => {
                                        const value = row[col.key as keyof T];
                                        return (
                                            <td
                                                key={String(col.key)}
                                                style={{ textAlign: col.align || 'left' }}
                                                className={col.align === 'right' ? 'pro-table-numeric' : ''}
                                            >
                                                {col.render ? col.render(value, row, index) : String(value ?? '')}
                                            </td>
                                        );
                                    })}

                                    {actions && (
                                        <td className="pro-table-actions">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProTable;
