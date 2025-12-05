/**
 * Tests for Estimate Calculation Utilities
 */

import {
    calculateEstimateTotal,
    validateEstimateData,
    generateEstimateNumber,
    calculatePoolVolume,
    calculateMaterialQuantities,
} from '../estimateCalculations';
import type { CalculationParams } from '../estimateCalculations';
import type { Bowl, Estimate } from '@/types';

describe('estimateCalculations', () => {
    describe('calculateEstimateTotal', () => {
        it('should calculate total correctly with VAT', () => {
            const params: CalculationParams = {
                bowls: [
                    { id: '1', name: 'Bowl 1', price: 100, created_at: '2023-01-01' } as Bowl,
                    { id: '2', name: 'Bowl 2', price: 200, created_at: '2023-01-01' } as Bowl,
                ],
                laborCost: 300,
                equipmentCost: 150,
                additionalCosts: 50,
                vatRate: 20,
            };

            const result = calculateEstimateTotal(params);

            expect(result.total).toBe(800); // 100+200+300+150+50
            expect(result.breakdown.materials).toBe(300);
            expect(result.breakdown.labor).toBe(300);
            expect(result.breakdown.equipment).toBe(150);
            expect(result.breakdown.additional).toBe(50);
            expect(result.vat).toBe(160); // 800 * 0.2
            expect(result.grandTotal).toBe(960); // 800 + 160
        });

        it('should handle zero values', () => {
            const params: CalculationParams = {
                bowls: [],
                laborCost: 0,
                equipmentCost: 0,
                additionalCosts: 0,
                vatRate: 0,
            };

            const result = calculateEstimateTotal(params);

            expect(result.total).toBe(0);
            expect(result.grandTotal).toBe(0);
        });

        it('should handle different VAT rates', () => {
            const params: CalculationParams = {
                bowls: [],
                laborCost: 100,
                equipmentCost: 0,
                additionalCosts: 0,
                vatRate: 18,
            };

            const result = calculateEstimateTotal(params);

            expect(result.vat).toBe(18); // 100 * 0.18
            expect(result.grandTotal).toBe(118);
        });
    });

    describe('validateEstimateData', () => {
        it('should return no errors for valid data', () => {
            const estimate: Partial<Estimate> = {
                name: 'Valid Estimate',
                total: 1000,
                status: 'draft',
            };

            const errors = validateEstimateData(estimate);

            expect(errors).toHaveLength(0);
        });

        it('should return error for missing name', () => {
            const estimate: Partial<Estimate> = {
                name: '',
                total: 1000,
            };

            const errors = validateEstimateData(estimate);

            expect(errors).toContain('Название сметы обязательно');
        });

        it('should return error for name exceeding max length', () => {
            const estimate: Partial<Estimate> = {
                name: 'a'.repeat(201),
                total: 1000,
            };

            const errors = validateEstimateData(estimate);

            expect(errors).toContain('Название сметы не должно превышать 200 символов');
        });

        it('should return error for negative total', () => {
            const estimate: Partial<Estimate> = {
                name: 'Test Estimate',
                total: -100,
            };

            const errors = validateEstimateData(estimate);

            expect(errors).toContain('Сумма сметы не может быть отрицательной');
        });

        it('should return error for invalid status', () => {
            const estimate: Partial<Estimate> = {
                name: 'Test',
                status: 'invalid' as any,
            };

            const errors = validateEstimateData(estimate);

            expect(errors).toContain('Некорректный статус сметы');
        });
    });

    describe('generateEstimateNumber', () => {
        it('should generate estimate number with correct format', () => {
            const estimateNumber = generateEstimateNumber();

            expect(estimateNumber).toMatch(/^EST-\d{6}-\d{3}$/);
        });

        it('should generate unique numbers', () => {
            const numbers = Array.from({ length: 10 }, () => generateEstimateNumber());
            const uniqueNumbers = new Set(numbers);

            expect(uniqueNumbers.size).toBe(numbers.length);
        });
    });

    describe('calculatePoolVolume', () => {
        it('should calculate volume correctly', () => {
            const volume = calculatePoolVolume(10, 5, 2);
            expect(volume).toBe(100);
        });

        it('should handle decimal dimensions', () => {
            const volume = calculatePoolVolume(10.5, 5.5, 2.5);
            expect(volume).toBeCloseTo(144.375);
        });
    });

    describe('calculateMaterialQuantities', () => {
        it('should calculate material quantities with safety margins', () => {
            const quantities = calculateMaterialQuantities(10, 5, 2);

            // Volume = 10*5*2 = 100
            // Surface area = 2*(10*2 + 5*2) + 10*5 = 2*30 + 50 = 110

            expect(quantities.concrete).toBeCloseTo(110); // 100 * 1.1
            expect(quantities.tiles).toBeCloseTo(115.5); // 110 * 1.05
            expect(quantities.waterproofing).toBeCloseTo(121); // 110 * 1.1
        });
    });
});
