'use client';
import { useState } from 'react';

export function useDimensionsLogic(selection, updateSelection) {
    const [dimensions, setDimensions] = useState({
        length: selection.dimensions?.length || 8,
        width: selection.dimensions?.width || 4,
        depth: selection.dimensions?.depth || 1.5,
    });
    const [errors, setErrors] = useState({});

    const validate = (field, value) => {
        const num = parseFloat(value);
        const newErrors = { ...errors };

        if (isNaN(num) || num <= 0) {
            newErrors[field] = 'Введите положительное число';
        } else if (field === 'length' && (num < 3 || num > 25)) {
            newErrors[field] = 'Длина должна быть от 3 до 25 метров';
        } else if (field === 'width' && (num < 2 || num > 15)) {
            newErrors[field] = 'Ширина должна быть от 2 до 15 метров';
        } else if (field === 'depth' && (num < 0.8 || num > 3)) {
            newErrors[field] = 'Глубина должна быть от 0.8 до 3 метров';
        } else {
            delete newErrors[field];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        const newDimensions = { ...dimensions, [field]: value };
        setDimensions(newDimensions);

        if (validate(field, value)) {
            updateSelection('dimensions', newDimensions);
        }
    };

    const volume = dimensions.length * dimensions.width * dimensions.depth;
    const surfaceArea = dimensions.length * dimensions.width;

    const presets = [
        { label: '6×3м', length: 6, width: 3, depth: 1.5 },
        { label: '8×4м', length: 8, width: 4, depth: 1.5 },
        { label: '10×5м', length: 10, width: 5, depth: 1.8 },
        { label: '12×6м', length: 12, width: 6, depth: 2 },
    ];

    const applyPreset = (preset) => {
        setDimensions(preset);
        updateSelection('dimensions', preset);
    };

    return {
        dimensions,
        errors,
        handleChange,
        volume,
        surfaceArea,
        presets,
        applyPreset
    };
}
