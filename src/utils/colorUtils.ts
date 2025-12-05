/**
 * Color utilities
 * Color manipulation and conversion
 */

/**
 * Convert hex to RGB
 */
export const hexToRgb = (hex: any) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: any, g: any, b: any) => {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

/**
 * Convert hex to HSL
 */
export const hexToHsl = (hex: any) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

/**
 * Lighten color
 */
export const lighten = (hex: any, amount: any) => {
    const hsl = hexToHsl(hex);
    if (!hsl) return hex;

    hsl.l = Math.min(100, hsl.l + amount);
    return hslToHex(hsl.h, hsl.s, hsl.l);
};

/**
 * Darken color
 */
export const darken = (hex: any, amount: any) => {
    const hsl = hexToHsl(hex);
    if (!hsl) return hex;

    hsl.l = Math.max(0, hsl.l - amount);
    return hslToHex(hsl.h, hsl.s, hsl.l);
};

/**
 * HSL to Hex
 */
export const hslToHex = (h: any, s: any, l: any) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color);
    };
    return rgbToHex(f(0), f(8), f(4));
};

/**
 * Generate color palette
 */
export const generatePalette = (baseColor, count = 5) => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return [];

    const palette: string[] = [];
    const step = 100 / (count + 1);

    for (let i = 1; i <= count; i++) {
        const newHsl = { ...hsl, l: Math.round(step * i) };
        palette.push(hslToHex(newHsl.h, newHsl.s, newHsl.l));
    }

    return palette;
};

/**
 * Get contrast color (black or white)
 */
export const getContrastColor = (hex: any) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
};

/**
 * Check if color is valid hex
 */
export const isValidHex = (hex: any) => {
    return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);
};
