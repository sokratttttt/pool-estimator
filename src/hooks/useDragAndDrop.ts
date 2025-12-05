// TODO: Add proper TypeScript types for state
import { useState, useRef, useCallback } from 'react';

/**
 * useDragAndDrop hook
 * Handle drag and drop functionality
 */
export function useDragAndDrop({
    onDrop,
    onDragOver,
    acceptedTypes = []
}: {
    onDrop?: (files: File[], e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    acceptedTypes?: string[];
}): any {
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current++;

        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current--;

        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onDragOver) {
            onDragOver(e);
        }
    }, [onDragOver]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(false);
        dragCounter.current = 0;

        const files = Array.from(e.dataTransfer.files);

        // Filter by accepted types if specified
        const validFiles = acceptedTypes.length > 0
            ? files.filter(file => acceptedTypes.some(type => file.type.match(type)))
            : files;

        if (onDrop) {
            onDrop(validFiles, e);
        }
    }, [acceptedTypes, onDrop]);

    return {
        isDragging,
        dragProps: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop
        }
    };
}

/**
 * useSortable hook
 * Handle sortable lists with drag and drop
 */
export function useSortable(initialItems: any[]): any {
    const [items, setItems] = useState<any[]>(initialItems);
    const [draggedItem, setDraggedItem] = useState<{ item: any; index: number } | null>(null);
    const [draggedOverItem, setDraggedOverItem] = useState<number | null>(null);

    const handleDragStart = useCallback((item: any, index: number) => {
        setDraggedItem({ item, index });
    }, []);

    const handleDragEnter = useCallback((index: number) => {
        setDraggedOverItem(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        if (draggedItem === null || draggedOverItem === null) {
            setDraggedItem(null);
            setDraggedOverItem(null);
            return;
        }

        const newItems = [...items];
        const draggedItemContent = newItems[draggedItem.index];

        // Remove from old position
        newItems.splice(draggedItem.index, 1);

        // Insert at new position
        newItems.splice(draggedOverItem, 0, draggedItemContent);

        setItems(newItems);
        setDraggedItem(null);
        setDraggedOverItem(null);
    }, [items, draggedItem, draggedOverItem]);

    const getSortableProps = useCallback((item: any, index: number) => ({
        draggable: true,
        onDragStart: () => handleDragStart(item, index),
        onDragEnter: () => handleDragEnter(index),
        onDragEnd: handleDragEnd,
        onDragOver: (e: React.DragEvent) => e.preventDefault()
    }), [handleDragStart, handleDragEnter, handleDragEnd]);

    return {
        items,
        setItems,
        draggedItem,
        draggedOverItem,
        getSortableProps
    };
}
