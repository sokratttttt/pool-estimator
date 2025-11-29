/**
 * Calculators utility functions
 * Mathematical calculations for pool estimates
 */

/**
 * Calculate pool area (rectangular)
 */
export const calculateRectangularArea = (length, width) => {
    return parseFloat(length) * parseFloat(width);
};

/**
 * Calculate pool area (circular)
 */
export const calculateCircularArea = (diameter) => {
    const radius = parseFloat(diameter) / 2;
    return Math.PI * radius * radius;
};

/**
 * Calculate pool area (oval)
 */
export const calculateOvalArea = (length, width) => {
    const a = parseFloat(length) / 2;
    const b = parseFloat(width) / 2;
    return Math.PI * a * b;
};

/**
 * Calculate pool volume
 */
export const calculatePoolVolume = (length, width, depth) => {
    return parseFloat(length) * parseFloat(width) * parseFloat(depth);
};

/**
 * Calculate average depth for pools with slope
 */
export const calculateAverageDepth = (shallowDepth, deepDepth) => {
    return (parseFloat(shallowDepth) + parseFloat(deepDepth)) / 2;
};

/**
 * Calculate water volume in liters
 */
export const calculateWaterVolume = (volume) => {
    return parseFloat(volume) * 1000; // m³ to liters
};

/**
 * Calculate total price with discount
 */
export const calculateDiscountedPrice = (price, discountPercent) => {
    const discount = parseFloat(price) * (parseFloat(discountPercent) / 100);
    return parseFloat(price) - discount;
};

/**
 * Calculate price with markup
 */
export const calculateMarkupPrice = (cost, markupPercent) => {
    const markup = parseFloat(cost) * (parseFloat(markupPercent) / 100);
    return parseFloat(cost) + markup;
};

/**
 * Calculate VAT (НДС)
 */
export const calculateVAT = (price, vatPercent = 20) => {
    return parseFloat(price) * (parseFloat(vatPercent) / 100);
};

/**
 * Calculate price including VAT
 */
export const calculatePriceWithVAT = (price, vatPercent = 20) => {
    return parseFloat(price) + calculateVAT(price, vatPercent);
};

/**
 * Calculate price excluding VAT
 */
export const calculatePriceWithoutVAT = (priceWithVAT, vatPercent = 20) => {
    return parseFloat(priceWithVAT) / (1 + parseFloat(vatPercent) / 100);
};

/**
 * Calculate delivery cost based on distance
 */
export const calculateDeliveryCost = (distance, ratePerKm = 50) => {
    return parseFloat(distance) * parseFloat(ratePerKm);
};

/**
 * Calculate installation cost based on complexity
 */
export const calculateInstallationCost = (basePrice, complexityMultiplier = 1) => {
    return parseFloat(basePrice) * parseFloat(complexityMultiplier);
};

/**
 * Calculate maintenance cost (annual)
 */
export const calculateMaintenanceCost = (poolVolume, costPerCubicMeter = 1000) => {
    return parseFloat(poolVolume) * parseFloat(costPerCubicMeter);
};

/**
 * Calculate heating cost
 */
export const calculateHeatingCost = (volume, temperatureDelta, electricityCost = 6) => {
    // Simplified calculation: kWh needed = volume * temperature delta * 1.16
    const kWhNeeded = parseFloat(volume) * parseFloat(temperatureDelta) * 1.16;
    return kWhNeeded * parseFloat(electricityCost);
};

/**
 * Calculate filtration system size
 */
export const calculateFiltrationRate = (volume) => {
    // Pool volume should be filtered every 6-8 hours
    return parseFloat(volume) / 6;
};

/**
 * Calculate chemical dosage
 */
export const calculateChemicalDosage = (volume, concentration) => {
    return parseFloat(volume) * parseFloat(concentration) / 1000;
};

/**
 * Calculate payment installments
 */
export const calculateInstallments = (totalPrice, numberOfMonths, interestRate = 0) => {
    const principal = parseFloat(totalPrice);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(numberOfMonths);

    if (interestRate === 0) {
        return {
            monthlyPayment: principal / months,
            totalAmount: principal,
            totalInterest: 0
        };
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = monthlyPayment * months;
    const totalInterest = totalAmount - principal;

    return {
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100
    };
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
    if (parseFloat(total) === 0) return 0;
    return (parseFloat(value) / parseFloat(total)) * 100;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
    if (parseFloat(oldValue) === 0) return 0;
    return ((parseFloat(newValue) - parseFloat(oldValue)) / parseFloat(oldValue)) * 100;
};

/**
 * Round to specified decimal places
 */
export const roundTo = (number, decimals = 2) => {
    return Math.round(parseFloat(number) * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Calculate weighted average
 */
export const calculateWeightedAverage = (values, weights) => {
    if (values.length !== weights.length) {
        throw new Error('Values and weights must have the same length');
    }

    const totalWeight = weights.reduce((sum, w) => sum + parseFloat(w), 0);
    const weightedSum = values.reduce((sum, v, i) => sum + parseFloat(v) * parseFloat(weights[i]), 0);

    return weightedSum / totalWeight;
};
