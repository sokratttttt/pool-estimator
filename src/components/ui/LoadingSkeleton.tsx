'use client';
import {
    Skeleton,
    SkeletonCard,
    SkeletonListItem,
    SkeletonTableRow,
    SkeletonChart,
    SkeletonGrid
} from '../Skeleton';

/**
 * LoadingSkeleton - универсальный wrapper для skeleton states
 * @param {object} props
 * @param {string} props.type - Тип skeleton ('card' | 'list' | 'table' | 'chart' | 'grid' | 'text' | 'image')
 * @param {number} props.count - Количество элементов (для list, table)
 * @param {object} props.gridConfig - Конфигурация для grid (columns, rows)
'use client';
import {
    Skeleton,
    SkeletonCard,
    SkeletonListItem,
    SkeletonTableRow,
    SkeletonChart,
    SkeletonGrid
} from '../Skeleton';

/**
 * LoadingSkeleton - универсальный wrapper для skeleton states
 * @param {object} props
 * @param {string} props.type - Тип skeleton ('card' | 'list' | 'table' | 'chart' | 'grid' | 'text' | 'image')
 * @param {number} props.count - Количество элементов (для list, table)
 * @param {object} props.gridConfig - Конфигурация для grid (columns, rows)
 * @param {string} props.chartType - Тип chart ('bar' | 'donut')
 * @param {string | number} props.height - Высота для text/image
 * @param {string | number} props.width - Ширина для text/image
 * @param {string} props.className - Дополнительные CSS классы
 */
interface LoadingSkeletonProps {
    type?: 'card' | 'list' | 'table' | 'chart' | 'grid' | 'image' | 'text';
    count?: number;
    gridConfig?: { columns: number; rows: number };
    chartType?: 'bar' | 'donut' | 'line' | 'area';
    height?: string | number;
    width?: string | number;
    className?: string;
}

export default function LoadingSkeleton({
    type = 'card',
    count = 3,
    gridConfig = { columns: 3, rows: 1 },
    chartType = 'bar',
    height,
    width,
    className = ''
}: LoadingSkeletonProps) {
    // Grid skeleton
    if (type === 'grid') {
        return (
            <SkeletonGrid
                columns={gridConfig.columns}
                rows={gridConfig.rows}
            />
        );
    }

    // Chart skeleton
    if (type === 'chart') {
        return <SkeletonChart type={chartType} />;
    }

    // Single card
    if (type === 'card' && count === 1) {
        return <SkeletonCard />;
    }

    // Multiple cards
    if (type === 'card') {
        return (
            <div className={`space-y-4 ${className}`}>
                {[...Array(count)].map((_, i: number) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    // List items
    if (type === 'list') {
        return (
            <div className={`space-y-3 ${className}`}>
                {[...Array(count)].map((_, i: number) => (
                    <SkeletonListItem key={i} />
                ))}
            </div>
        );
    }

    // Table rows
    if (type === 'table') {
        return (
            <div className={className}>
                {[...Array(count)].map((_, i: number) => (
                    <SkeletonTableRow key={i} />
                ))}
            </div>
        );
    }

    // Image skeleton
    if (type === 'image') {
        return (
            <Skeleton
                width={width || '100%'}
                height={height || '200px'}
                rounded="rounded-xl"
                className={className}
            />
        );
    }

    // Text skeleton (default)
    return (
        <Skeleton
            width={width || '100%'}
            height={height || '1rem'}
            className={className}
        />
    );
}
