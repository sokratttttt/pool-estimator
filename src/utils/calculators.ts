/**
 * Calculators utility functions
 * Mathematical calculations for pool estimates
 * 
 * All monetary values are rounded to 2 decimal places (копейки)
 * All measurements are validated for non-negative values
 */

// ============================================
// TYPES
// ============================================

/** Result of installment calculation */
export interface InstallmentResult {
    monthlyPayment: number;
    totalAmount: number;
    totalInterest: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Round monetary value to 2 decimal places (копейки)
 */
const roundMoney = (value: number): number => {
    return Math.round(value * 100) / 100;
};

/**
 * Round measurement to 3 decimal places
 */
const roundMeasurement = (value: number): number => {
    return Math.round(value * 1000) / 1000;
};

/**
 * Validate that a value is a non-negative number
 */
const validateNonNegative = (value: number, name: string): void => {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(`${name} must be a valid number`);
    }
    if (value < 0) {
        throw new RangeError(`${name} cannot be negative`);
    }
};

/**
 * Validate that a value is a positive number
 */
const validatePositive = (value: number, name: string): void => {
    validateNonNegative(value, name);
    if (value === 0) {
        throw new RangeError(`${name} must be greater than zero`);
    }
};

/**
 * Validate percentage is between 0 and 100
 */
const validatePercent = (value: number, name: string): void => {
    validateNonNegative(value, name);
    if (value > 100) {
        throw new RangeError(`${name} cannot exceed 100%`);
    }
};

// ============================================
// AREA CALCULATIONS
// ============================================

/**
 * Calculate pool area (rectangular)
 * @param length - Pool length in meters
 * @param width - Pool width in meters
 * @returns Area in square meters
 */
export const calculateRectangularArea = (length: number, width: number): number => {
    validatePositive(length, 'Length');
    validatePositive(width, 'Width');
    return roundMeasurement(length * width);
};

/**
 * Calculate pool area (circular)
 * @param diameter - Pool diameter in meters
 * @returns Area in square meters
 */
export const calculateCircularArea = (diameter: number): number => {
    validatePositive(diameter, 'Diameter');
    const radius = diameter / 2;
    return roundMeasurement(Math.PI * radius * radius);
};

/**
 * Calculate pool area (oval/ellipse)
 * @param length - Major axis (length) in meters
 * @param width - Minor axis (width) in meters
 * @returns Area in square meters
 */
export const calculateOvalArea = (length: number, width: number): number => {
    validatePositive(length, 'Length');
    validatePositive(width, 'Width');
    const a = length / 2;
    const b = width / 2;
    return roundMeasurement(Math.PI * a * b);
};

// ============================================
// VOLUME CALCULATIONS
// ============================================

/**
 * Calculate pool volume
 * @param length - Pool length in meters
 * @param width - Pool width in meters
 * @param depth - Pool depth in meters
 * @returns Volume in cubic meters
 */
export const calculatePoolVolume = (length: number, width: number, depth: number): number => {
    validatePositive(length, 'Length');
    validatePositive(width, 'Width');
    validatePositive(depth, 'Depth');
    return roundMeasurement(length * width * depth);
};

/**
 * Calculate average depth for pools with slope
 * @param shallowDepth - Depth at shallow end in meters
 * @param deepDepth - Depth at deep end in meters
 * @returns Average depth in meters
 */
export const calculateAverageDepth = (shallowDepth: number, deepDepth: number): number => {
    validateNonNegative(shallowDepth, 'Shallow depth');
    validateNonNegative(deepDepth, 'Deep depth');
    if (shallowDepth > deepDepth) {
        throw new RangeError('Shallow depth cannot exceed deep depth');
    }
    return roundMeasurement((shallowDepth + deepDepth) / 2);
};

/**
 * Calculate water volume in liters
 * @param volumeCubicMeters - Volume in cubic meters
 * @returns Volume in liters
 */
export const calculateWaterVolume = (volumeCubicMeters: number): number => {
    validateNonNegative(volumeCubicMeters, 'Volume');
    return roundMeasurement(volumeCubicMeters * 1000);
};

// ============================================
// PRICE CALCULATIONS (with proper rounding)
// ============================================

/**
 * Calculate total price with discount
 * @param price - Original price in rubles
 * @param discountPercent - Discount percentage (0-100)
 * @returns Discounted price in rubles
 */
export const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
    validateNonNegative(price, 'Price');
    validatePercent(discountPercent, 'Discount');

    const discountAmount = price * (discountPercent / 100);
    return roundMoney(price - discountAmount);
};

/**
 * Calculate price with markup
 * @param cost - Base cost in rubles
 * @param markupPercent - Markup percentage (0+)
 * @returns Price with markup in rubles
 */
export const calculateMarkupPrice = (cost: number, markupPercent: number): number => {
    validateNonNegative(cost, 'Cost');
    validateNonNegative(markupPercent, 'Markup percent');

    const markupAmount = cost * (markupPercent / 100);
    return roundMoney(cost + markupAmount);
};

/**
 * Calculate VAT (НДС) amount
 * @param price - Base price in rubles
 * @param vatPercent - VAT percentage (default 20%)
 * @returns VAT amount in rubles
 */
export const calculateVAT = (price: number, vatPercent: number = 20): number => {
    validateNonNegative(price, 'Price');
    validateNonNegative(vatPercent, 'VAT percent');

    return roundMoney(price * (vatPercent / 100));
};

/**
 * Calculate price including VAT
 * @param price - Base price without VAT in rubles
 * @param vatPercent - VAT percentage (default 20%)
 * @returns Price with VAT in rubles
 */
export const calculatePriceWithVAT = (price: number, vatPercent: number = 20): number => {
    validateNonNegative(price, 'Price');
    validateNonNegative(vatPercent, 'VAT percent');

    return roundMoney(price * (1 + vatPercent / 100));
};

/**
 * Calculate price excluding VAT
 * @param priceWithVAT - Price including VAT in rubles
 * @param vatPercent - VAT percentage (default 20%)
 * @returns Price without VAT in rubles
 */
export const calculatePriceWithoutVAT = (priceWithVAT: number, vatPercent: number = 20): number => {
    validateNonNegative(priceWithVAT, 'Price with VAT');
    validateNonNegative(vatPercent, 'VAT percent');

    return roundMoney(priceWithVAT / (1 + vatPercent / 100));
};

// ============================================
// COST CALCULATIONS
// ============================================

/**
 * Calculate delivery cost based on distance
 * @param distanceKm - Distance in kilometers
 * @param ratePerKm - Cost per kilometer (default 50₽)
 * @returns Delivery cost in rubles
 */
export const calculateDeliveryCost = (distanceKm: number, ratePerKm: number = 50): number => {
    validateNonNegative(distanceKm, 'Distance');
    validateNonNegative(ratePerKm, 'Rate per km');

    return roundMoney(distanceKm * ratePerKm);
};

/**
 * Calculate installation cost based on complexity
 * @param basePrice - Base installation price in rubles
 * @param complexityMultiplier - Complexity factor (1.0 = standard, 1.5 = complex)
 * @returns Installation cost in rubles
 */
export const calculateInstallationCost = (basePrice: number, complexityMultiplier: number = 1): number => {
    validateNonNegative(basePrice, 'Base price');
    if (complexityMultiplier < 0.5 || complexityMultiplier > 5) {
        throw new RangeError('Complexity multiplier must be between 0.5 and 5');
    }

    return roundMoney(basePrice * complexityMultiplier);
};

/**
 * Calculate annual maintenance cost
 * @param poolVolumeCubicMeters - Pool volume in cubic meters
 * @param costPerCubicMeter - Annual cost per m³ (default 1000₽)
 * @returns Annual maintenance cost in rubles
 */
export const calculateMaintenanceCost = (poolVolumeCubicMeters: number, costPerCubicMeter: number = 1000): number => {
    validateNonNegative(poolVolumeCubicMeters, 'Pool volume');
    validateNonNegative(costPerCubicMeter, 'Cost per cubic meter');

    return roundMoney(poolVolumeCubicMeters * costPerCubicMeter);
};

/**
 * Calculate heating cost
 * @param volumeCubicMeters - Pool volume in cubic meters
 * @param temperatureDeltaCelsius - Temperature increase in °C
 * @param electricityCostPerKwh - Electricity cost per kWh (default 6₽)
 * @returns Heating cost in rubles
 */
export const calculateHeatingCost = (
    volumeCubicMeters: number,
    temperatureDeltaCelsius: number,
    electricityCostPerKwh: number = 6
): number => {
    validateNonNegative(volumeCubicMeters, 'Volume');
    validateNonNegative(temperatureDeltaCelsius, 'Temperature delta');
    validateNonNegative(electricityCostPerKwh, 'Electricity cost');

    // kWh needed = volume * temperature delta * 1.16 (specific heat coefficient)
    const kWhNeeded = volumeCubicMeters * temperatureDeltaCelsius * 1.16;
    return roundMoney(kWhNeeded * electricityCostPerKwh);
};

// ============================================
// EQUIPMENT CALCULATIONS
// ============================================

/**
 * Calculate required filtration rate
 * @param volumeCubicMeters - Pool volume in cubic meters
 * @param turnoverHours - Hours to filter entire volume (default 6)
 * @returns Required flow rate in m³/hour
 */
export const calculateFiltrationRate = (volumeCubicMeters: number, turnoverHours: number = 6): number => {
    validateNonNegative(volumeCubicMeters, 'Volume');
    validatePositive(turnoverHours, 'Turnover hours');

    return roundMeasurement(volumeCubicMeters / turnoverHours);
};

/**
 * Calculate chemical dosage
 * @param volumeCubicMeters - Pool volume in cubic meters
 * @param concentrationPpm - Required concentration in ppm (parts per million)
 * @returns Chemical amount in kg
 */
export const calculateChemicalDosage = (volumeCubicMeters: number, concentrationPpm: number): number => {
    validateNonNegative(volumeCubicMeters, 'Volume');
    validateNonNegative(concentrationPpm, 'Concentration');

    // Convert ppm to kg: volume(m³) * concentration(ppm) / 1000
    return roundMeasurement(volumeCubicMeters * concentrationPpm / 1000);
};

// ============================================
// FINANCIAL CALCULATIONS
// ============================================

/**
 * Calculate payment installments (credit/рассрочка)
 * @param totalPrice - Total price in rubles
 * @param numberOfMonths - Number of payment months
 * @param annualInterestRate - Annual interest rate percentage (default 0 = interest-free)
 * @returns Object with monthly payment, total amount, and total interest
 */
export const calculateInstallments = (
    totalPrice: number,
    numberOfMonths: number,
    annualInterestRate: number = 0
): InstallmentResult => {
    validatePositive(totalPrice, 'Total price');
    validatePositive(numberOfMonths, 'Number of months');
    validateNonNegative(annualInterestRate, 'Interest rate');

    const months = Math.floor(numberOfMonths);

    // Interest-free installments
    if (annualInterestRate === 0) {
        const monthlyPayment = roundMoney(totalPrice / months);
        return {
            monthlyPayment,
            totalAmount: roundMoney(monthlyPayment * months),
            totalInterest: 0
        };
    }

    // With interest (annuity formula)
    const monthlyRate = annualInterestRate / 100 / 12;
    const annuityCoef = (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

    const monthlyPayment = roundMoney(totalPrice * annuityCoef);
    const totalAmount = roundMoney(monthlyPayment * months);
    const totalInterest = roundMoney(totalAmount - totalPrice);

    return {
        monthlyPayment,
        totalAmount,
        totalInterest
    };
};

/**
 * Calculate percentage of a value
 * @param value - The part value
 * @param total - The total value
 * @returns Percentage (0-100)
 */
export const calculatePercentage = (value: number, total: number): number => {
    validateNonNegative(value, 'Value');
    validateNonNegative(total, 'Total');

    if (total === 0) return 0;
    return roundMeasurement((value / total) * 100);
};

/**
 * Calculate percentage change between two values
 * @param oldValue - Original value
 * @param newValue - New value
 * @returns Percentage change (can be negative)
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
    validateNonNegative(oldValue, 'Old value');
    validateNonNegative(newValue, 'New value');

    if (oldValue === 0) {
        return newValue === 0 ? 0 : 100;
    }
    return roundMeasurement(((newValue - oldValue) / oldValue) * 100);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Decimal places (default 2)
 * @returns Rounded number
 */
export const roundTo = (value: number, decimals: number = 2): number => {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError('Value must be a valid number');
    }
    if (decimals < 0 || decimals > 10) {
        throw new RangeError('Decimals must be between 0 and 10');
    }

    const factor = Math.pow(10, Math.floor(decimals));
    return Math.round(value * factor) / factor;
};

/**
 * Calculate weighted average
 * @param values - Array of values
 * @param weights - Array of weights (must match values length)
 * @returns Weighted average
 */
export const calculateWeightedAverage = (values: number[], weights: number[]): number => {
    if (!Array.isArray(values) || !Array.isArray(weights)) {
        throw new TypeError('Values and weights must be arrays');
    }
    if (values.length !== weights.length) {
        throw new Error('Values and weights must have the same length');
    }
    if (values.length === 0) {
        throw new Error('Arrays cannot be empty');
    }

    // Validate all values and weights
    values.forEach((v, i) => validateNonNegative(v, `Value at index ${i}`));
    weights.forEach((w, i) => validateNonNegative(w, `Weight at index ${i}`));

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) {
        throw new Error('Total weight cannot be zero');
    }

    const weightedSum = values.reduce((sum, v, i) => sum + v * weights[i], 0);
    return roundMeasurement(weightedSum / totalWeight);
};
