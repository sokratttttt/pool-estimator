// Estimate generation utilities
// Note: Filtration and equipment data moved to separate handling

export const generateEstimateItems = (selection, prices = {}) => {
    const items = [];

    // Helper to get price (dynamic or static)
    const getPrice = (id, defaultPrice) => {
        return prices[id] !== undefined ? prices[id] : defaultPrice;
    };

    // Calculate Dimensions
    let length = 0, width = 0, depth = 1.5, volume = 0;
    if (selection.dimensions) {
        length = selection.dimensions.length;
        width = selection.dimensions.width;
        depth = selection.dimensions.depth;
        volume = selection.dimensions.volume;
    } else if (selection.bowl) {
        length = selection.bowl.length;
        width = selection.bowl.width;
        depth = selection.bowl.depth;
        volume = selection.bowl.volume || (length * width * depth);
    }

    const surfaceArea = (length * width) + (2 * (length + width) * depth); // Floor + Walls
    const floorArea = length * width;
    const perimeter = 2 * (length + width);

    // 1. Bowl / Material
    // Check for composite bowl (either explicit material or implied by bowl existence)
    if ((selection.material?.id === 'composite' || !selection.material) && selection.bowl) {
        items.push({
            id: 'bowl_price',
            section: 'Чаша бассейна',
            name: selection.bowl.name,
            price: selection.bowl.price,
            quantity: 1,
            unit: 'шт'
        });

    } else if (selection.dimensions && selection.material) {
        if (selection.material.id === 'polypropylene') {
            items.push({
                id: 'bowl_poly_weld',
                section: 'Чаша бассейна',
                name: `Изготовление чаши из полипропилена (${selection.material.name})`,
                price: selection.material.basePricePerCubicMeter || 15000,
                quantity: volume,
                unit: 'м³'
            });
        }
    }

    // 2. Equipment (Filtration)
    if (selection.filtration) {
        items.push({
            id: 'filtration_main',
            section: 'Оборудование',
            name: selection.filtration.name,
            price: selection.filtration.price,
            quantity: 1,
            unit: 'шт'
        });
    }

    // 3. Embedded Parts - DYNAMIC LOGIC
    if (selection.parts) {
        if (selection.parts.items && selection.parts.items.length > 0) {
            selection.parts.items.forEach((item, idx) => {
                let quantity = item.quantity || 1;

                // Rule: 1 Skimmer per 25 m3
                if (item.type === 'skimmer' && volume > 0) {
                    quantity = Math.ceil(volume / 25);
                }
                // Rule: 1 Nozzle per 7 m3
                if (item.type === 'nozzle' && volume > 0) {
                    quantity = Math.ceil(volume / 7);
                }

                items.push({
                    ...item,
                    id: `part_${idx}`,
                    section: 'Оборудование',
                    quantity: quantity
                });
            });
        } else {
            // Fallback for single item
            items.push({
                id: 'parts_main',
                section: 'Оборудование',
                name: selection.parts.name,
                price: selection.parts.price,
                quantity: 1, // Logic for quantity might be missing here, assume 1 set
                unit: 'компл'
            });
        }
    }

    // 5. Heating
    if (selection.heating) {
        if (selection.heating.items && selection.heating.items.length > 0) {
            selection.heating.items.forEach((item, idx) => {
                items.push({ ...item, id: `heat_${idx}`, section: 'Подогрев' });
            });
        } else {
            // Fallback for single item (e.g. from catalog without sub-items)
            items.push({
                id: 'heating_main',
                section: 'Подогрев',
                name: selection.heating.name,
                price: selection.heating.price,
                quantity: 1,
                unit: 'шт'
            });
        }
    }

    // 6. Additional Options
    if (selection.additional) {
        selection.additional.forEach((item, idx) => {
            items.push({ ...item, id: `add_${idx}`, section: 'Дополнительное оборудование' });
        });
    }

    // 7. Construction Works (from WorksStep)
    if (selection.works) {
        Object.values(selection.works).forEach((work, idx) => {
            items.push({
                id: `work_${work.id}`,
                section: 'Строительные работы',
                name: work.name,
                price: work.total / (work.quantity || 1), // Unit price
                quantity: work.quantity,
                unit: work.unit
            });
        });
    }

    // 8. Installation Works
    // Parts Installation
    if (selection.parts?.items) {
        selection.parts.items.forEach((item, idx) => {
            // Recalculate quantity for installation too
            let quantity = item.quantity || 1;
            if (item.type === 'skimmer' && volume > 0) quantity = Math.ceil(volume / 25);
            if (item.type === 'nozzle' && volume > 0) quantity = Math.ceil(volume / 7);

            items.push({
                id: `inst_part_${idx}`,
                section: 'Монтажные работы',
                name: `Монтаж: ${item.name}`,
                price: item.installationPrice || 0,
                quantity: quantity,
                unit: 'шт'
            });
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
            unit: 'шт'
        });
    }
    // Additional Installation
    if (selection.additional) {
        selection.additional.forEach((item, idx) => {
            if (item.installationPrice) {
                items.push({
                    id: `inst_add_${idx}`,
                    section: 'Монтажные работы',
                    name: `Монтаж: ${item.name}`,
                    price: item.installationPrice,
                    quantity: 1,
                    unit: 'шт'
                });
            }
        });
    }

    return items;
};

export const calculateTotal = (items, prices = {}) => {
    return items.reduce((acc, item) => {
        const price = prices[item.id] !== undefined ? prices[item.id] : item.price;
        return acc + (price * (item.quantity || 1));
    }, 0);
};
