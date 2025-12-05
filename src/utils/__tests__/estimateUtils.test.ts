import { calculateTotal, generateEstimateItems } from '../estimateUtils';

describe('estimateUtils', () => {
    describe('calculateTotal', () => {
        it('should calculate total correctly', () => {
            const items = [
                { price: 1000, quantity: 2 },
                { price: 500, quantity: 1 },
            ];
            expect(calculateTotal(items)).toBe(2500);
        });

        it('should handle empty items', () => {
            expect(calculateTotal([])).toBe(0);
        });

        it('should handle items without quantity', () => {
            const items = [
                { price: 1000 },
                { price: 500 },
            ];
            expect(calculateTotal(items)).toBe(1500);
        });
    });

    describe('generateEstimateItems', () => {
        it('should generate items from selection with polypropylene material', () => {
            const selection = {
                material: {
                    id: 'polypropylene',
                    name: 'Полипропилен',
                    basePricePerCubicMeter: 15000
                },
                dimensions: { length: 8, width: 4, depth: 1.5, volume: 48 }
            };
            const items = generateEstimateItems(selection);
            expect(items.length).toBeGreaterThan(0);
            expect(items[0].name).toContain('полипропилена');
        });

        it('should generate items from selection with composite bowl', () => {
            const selection = {
                bowl: {
                    name: 'Композитная чаша Luxor 8x4',
                    price: 250000,
                    length: 8,
                    width: 4,
                    depth: 1.5,
                    volume: 48
                }
            };
            const items = generateEstimateItems(selection);
            expect(items.length).toBeGreaterThan(0);
            expect(items[0].name).toContain('Luxor');
        });

        it('should handle empty selection', () => {
            const items = generateEstimateItems({});
            expect(items).toEqual([]);
        });
    });
});
