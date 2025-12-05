// Estimate generation utilities
// Note: Filtration and equipment data moved to separate handling

import type { EstimateItem, Selection, PriceList, EquipmentSelection } from '@/types/estimate-utils';

export const generateEstimateItems = (selection: Selection, _prices: Partial<PriceList> = {}): EstimateItem[] => {
    const items: EstimateItem[] = [];

    // Calculate Dimensions
    let length = 0, width = 0, depth = 1.5, volume = 0;
    if (selection.dimensions) {
        length = selection.dimensions.length;
        width = selection.dimensions.width;
        depth = selection.dimensions.depth;
        volume = selection.dimensions.volume || (length * width * depth);
    } else if (selection.bowl) {
        length = selection.bowl.length || 0;
        width = selection.bowl.width || 0;
        depth = selection.bowl.depth || 0;
        volume = selection.bowl.volume || (length * width * depth);
    }

    // 1. Bowl / Material
    // Check for composite bowl (either explicit material or implied by bowl existence)
    if ((selection.material?.id === 'composite' || !selection.material) && selection.bowl) {
        items.push({
            id: 'bowl_price',
            section: 'Чаша бассейна',
            name: selection.bowl.name,
            price: selection.bowl.price,
            quantity: 1,
            unit: 'шт',
            total: selection.bowl.price
        });

    } else if (selection.dimensions && selection.material) {
        if (selection.material.id === 'polypropylene') {
            const price = selection.material.basePricePerCubicMeter || 15000;
            items.push({
                id: 'bowl_poly_weld',
                section: 'Чаша бассейна',
                name: `Изготовление чаши из полипропилена (${selection.material.name})`,
                price: price,
                quantity: volume,
                unit: 'м³',
                total: Math.round(volume * price * 100) / 100
            });
        }
    }

    // 2. Equipment (Filtration)
    if (selection.filtration) {
        const price = selection.filtration.price || selection.filtration.unitPrice || 0;
        items.push({
            id: 'filtration_main',
            section: 'Оборудование',
            name: selection.filtration.name || selection.filtration.model || 'Фильтрация',
            price: price,
            quantity: 1,
            unit: 'шт',
            total: price
        });
    }

    // 3. Embedded Parts - DYNAMIC LOGIC
    if (selection.parts) {
        if (selection.parts.items && selection.parts.items.length > 0) {
            selection.parts.items.forEach((item: EquipmentSelection, idx: number) => {
                let quantity = item.quantity || 1;

                // Rule: 1 Skimmer per 25 m3
                if (item.type === 'skimmer' && volume > 0) {
                    quantity = Math.ceil(volume / 25);
                }
                // Rule: 1 Nozzle per 7 m3
                if (item.type === 'nozzle' && volume > 0) {
                    quantity = Math.ceil(volume / 7);
                }

                const price = item.price || item.unitPrice || 0;
                items.push({
                    id: `part_${idx}`,
                    section: 'Оборудование',
                    name: item.name || item.model || 'Деталь',
                    price: price,
                    quantity: quantity,
                    unit: 'шт',
                    type: item.type,
                    installationPrice: item.installationPrice,
                    total: Math.round(quantity * price * 100) / 100
                });
            });
        } else if (selection.parts.name) {
            // Fallback for single item
            const price = selection.parts.price || 0;
            items.push({
                id: 'parts_main',
                section: 'Оборудование',
                name: selection.parts.name,
                price: price,
                quantity: 1, // Logic for quantity might be missing here, assume 1 set
                unit: 'компл',
                total: price
            });
        }
    }

    // 5. Heating
    if (selection.heating) {
        if (selection.heating.items && selection.heating.items.length > 0) {
            selection.heating.items.forEach((item: EquipmentSelection, idx: number) => {
                const price = item.price || item.unitPrice || 0;
                items.push({
                    id: `heat_${idx}`,
                    section: 'Подогрев',
                    name: item.name || item.model || 'Нагреватель',
                    price: price,
                    quantity: item.quantity || 1,
                    unit: 'шт',
                    total: Math.round((item.quantity || 1) * price * 100) / 100
                });
            });
        } else {
            // Fallback for single item (e.g. from catalog without sub-items)
            const price = selection.heating.price || selection.heating.unitPrice || 0;
            items.push({
                id: 'heating_main',
                section: 'Подогрев',
                name: selection.heating.name || selection.heating.model || 'Нагреватель',
                price: price,
                quantity: 1,
                unit: 'шт',
                total: price
            });
        }
    }

    // 6. Additional Options
    if (selection.additional) {
        selection.additional.forEach((item: EquipmentSelection, idx: number) => {
            const price = item.price || item.unitPrice || 0;
            items.push({
                id: `add_${idx}`,
                section: 'Дополнительное оборудование',
                name: item.name || item.model || 'Оборудование',
                price: price,
                quantity: item.quantity || 1,
                unit: 'шт',
                installationPrice: item.installationPrice,
                total: Math.round((item.quantity || 1) * price * 100) / 100
            });
        });
    }

    // 7. Construction Works (from WorksStep)
    if (selection.works) {
        const worksList = Array.isArray(selection.works) ? selection.works : Object.values(selection.works);
        worksList.forEach((work) => {
            const quantity = work.quantity || 1;
            const price = work.total / quantity; // Unit price derived from total
            items.push({
                id: `work_${work.id}`,
                section: 'Строительные работы',
                name: work.name,
                price: price,
                quantity: quantity,
                unit: work.unit || 'ед',
                total: work.total
            });
        });
    }

    // 8. Installation Works
    // Parts Installation
    if (selection.parts?.items) {
        selection.parts.items.forEach((item: EquipmentSelection, idx: number) => {
            // Recalculate quantity for installation too
            let quantity = item.quantity || 1;
            if (item.type === 'skimmer' && volume > 0) quantity = Math.ceil(volume / 25);
            if (item.type === 'nozzle' && volume > 0) quantity = Math.ceil(volume / 7);

            if (item.installationPrice) {
                items.push({
                    id: `inst_part_${idx}`,
                    section: 'Монтажные работы',
                    name: `Монтаж: ${item.name || item.model || 'Деталь'}`,
                    price: item.installationPrice,
                    quantity: quantity,
                    unit: 'шт',
                    total: Math.round(quantity * item.installationPrice * 100) / 100
                });
            }
        });
    }
    // Heating Installation
    if (selection.heating?.installationPrice) {
        items.push({
            id: 'inst_heat',
            section: 'Монтажные работы',
            name: 'Монтаж нагревателя',
            price: selection.heating.installationPrice,
            quantity: 1,
            unit: 'шт',
            total: selection.heating.installationPrice
        });
    }
    // Additional Installation
    if (selection.additional) {
        selection.additional.forEach((item: EquipmentSelection, idx: number) => {
            if (item.installationPrice) {
                items.push({
                    id: `inst_add_${idx}`,
                    section: 'Монтажные работы',
                    name: `Монтаж: ${item.name || item.model || 'Оборудование'}`,
                    price: item.installationPrice,
                    quantity: item.quantity || 1,
                    unit: 'шт',
                    total: Math.round((item.quantity || 1) * item.installationPrice * 100) / 100
                });
            }
        });
    }

    return items;
};

export const calculateTotal = (items: EstimateItem[], prices: Record<string, number> = {}): number => {
    if (!Array.isArray(items)) {
        console.warn('calculateTotal: items is not an array');
        return 0;
    }

    return items.reduce((acc: number, item: EstimateItem) => {
        const price = prices[item.id] !== undefined ? prices[item.id] : (item.price || item.unitPrice || 0);
        const quantity = Math.max(0, item.quantity || 1);
        const unitPrice = Math.max(0, price);

        // Round to avoid floating point errors
        return acc + Math.round(unitPrice * quantity * 100) / 100;
    }, 0);
};

