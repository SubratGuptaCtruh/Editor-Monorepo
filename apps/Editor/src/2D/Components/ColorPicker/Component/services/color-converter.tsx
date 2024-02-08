export const colorConverterService = {
    // Convert HSL (Hue, Saturation, Lightness) to Hexadecimal color representation
    hslToHex: (h: number, s: number, l: number): string => {
        l /= 100;
        // Calculate chroma and second largest component (a)
        const a = (s * Math.min(l, 1 - l)) / 100;
        // Inner function to calculate individual color channels and return as hexadecimal
        const f = (n: number): string => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color)
                .toString(16)
                .padStart(2, "0");
        };
        // Combine red, green, and blue channels and return as hexadecimal color
        return `#${f(0)}${f(8)}${f(4)}`;
    },

    // Convert Hexadecimal color to HSL (Hue, Saturation, Lightness) representation
    hexToHSL: (hex: string): { h: number; s: number; l: number } | undefined => {
        // Regular expression to validate Hex color format
        const ex = /^#([\da-f]{3}){1,2}$/i;
        // Check if the input hex color matches the valid format
        if (ex.test(hex)) {
            // Parse individual red, green, and blue components from hex
            let r: number, g: number, b: number;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
            } else {
                // Invalid hex color format
                return undefined;
            }

            // Normalize red, green, and blue values to [0, 1]
            const rNormalized = r / 255;
            const gNormalized = g / 255;
            const bNormalized = b / 255;
            // Calculate maximum and minimum values of RGB components
            const cmin = Math.min(rNormalized, gNormalized, bNormalized);
            const cmax = Math.max(rNormalized, gNormalized, bNormalized);
            // Calculate delta and initialize variables for HSL representation
            const delta = cmax - cmin;
            let h = 0,
                s = 0,
                l = 0;
            // Calculate hue (h), saturation (s), and lightness (l)
            if (delta === 0) {
                h = 0;
            } else if (cmax === rNormalized) {
                h = ((gNormalized - bNormalized) / delta) % 6;
            } else if (cmax === gNormalized) {
                h = (bNormalized - rNormalized) / delta + 2;
            } else {
                h = (rNormalized - gNormalized) / delta + 4;
            }
            h = h * 60;
            if (h < 0) {
                h += 360;
            }
            l = (cmax + cmin) / 2;
            s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
            s = +(s * 100).toFixed(1);
            l = +(l * 100).toFixed(1);
            // Return HSL representation
            return { h, s, l };
        } else {
            // Invalid hex color format
            return undefined;
        }
    },

    // Convert Hexadecimal color to RGB (Red, Green, Blue) representation
    hexToRGB: (hex: string) => {
        // Parse red, green, and blue components from hex and return as RGB object
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    },

    // Convert RGB (Red, Green, Blue) color to HSV (Hue, Saturation, Value) representation
    RGBToHSV: (r: number, g: number, b: number) => {
        // Calculate maximum and chromatic difference
        const v = Math.max(r, g, b);
        const c = v - Math.min(r, g, b);
        // Calculate hue (h), saturation (s), and value (v) in HSV
        const h = c && (v === r ? (g - b) / c : v === g ? 2 + (b - r) / c : 4 + (r - g) / c);
        return {
            h: 60 * (h < 0 ? h + 6 : h),
            s: v && (c / v) * 100,
            v: (v / 255) * 100,
        };
    },
};
