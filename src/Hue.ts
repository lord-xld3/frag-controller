function nonZeroRgbToHsv(r: number, g: number, b: number) {
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0; 
    let d = max - min;

    switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
    
    return [h, d / max, max];
}

function rgbToHsv(r: number, g: number, b: number) {
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

function hsvToRgb(h: number, s: number, v: number) {
    let r = 0, g = 0, b = 0;

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r, g, b];
}


export function adjustHue(r: number, g: number, b: number, hueShift: number) {
    // Convert RGB to HSV
    let [h, s, v] = rgbToHsv(r, g, b);

    // Adjust the hue
    h = (h + hueShift) % 1;

    // Convert back to RGB
    return hsvToRgb(h, s, v);
}

export function adjustNonZeroHue(r: number, g: number, b: number, hueShift: number) {
    // Convert RGB to HSV
    let [h, s, v] = nonZeroRgbToHsv(r, g, b);

    // Adjust the hue
    h = (h + hueShift) % 1;

    // Convert back to RGB
    return hsvToRgb(h, s, v);
}