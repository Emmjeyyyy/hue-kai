import { ColorData, HSL, RGB, PaletteMode } from '../types';

// Helpers
export const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

export const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hslToRgb = (h: number, s: number, l: number): RGB => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4))
  };
};

export const rgbToCmyk = (r: number, g: number, b: number): string => {
  let c = 0, m = 0, y = 0, k = 0;
  r = r / 255;
  g = g / 255;
  b = b / 255;
  k = Math.min(1 - r, 1 - g, 1 - b);
  if (k !== 1) {
    c = (1 - r - k) / (1 - k);
    m = (1 - g - k) / (1 - k);
    y = (1 - b - k) / (1 - k);
  }
  return `${Math.round(c * 100)}% ${Math.round(m * 100)}% ${Math.round(y * 100)}% ${Math.round(k * 100)}%`;
};

export const createColorData = (hex: string): ColorData => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  return {
    hex: hex.toUpperCase(),
    rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    hsl: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`,
    cmyk,
    locked: false,
  };
};

export const generateRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

// Generation Logic
export const generatePalette = (mode: PaletteMode, count: number = 5, baseColor?: string): ColorData[] => {
  const palette: ColorData[] = [];
  
  let baseHue: number;
  let baseSat: number;
  let baseLit: number;

  if (baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    baseHue = hsl.h;
    baseSat = hsl.s;
    baseLit = hsl.l;
  } else {
    baseHue = Math.floor(Math.random() * 360);
    // Ensure base color is vivid enough for valid generation
    baseSat = Math.floor(Math.random() * 30) + 70;
    baseLit = Math.floor(Math.random() * 40) + 30;
  }

  const hues: number[] = [];
  
  // Strict hue calculation
  switch (mode) {
    case 'monochromatic':
        for (let i = 0; i < count; i++) hues.push(baseHue);
        break;
        
    case 'analogous':
        // Neighboring hues within a narrow range (30 degrees).
        // Centered around base if possible.
        const spread = 30;
        const start = baseHue - (Math.floor((count - 1) / 2) * spread);
        for (let i = 0; i < count; i++) {
           hues.push((start + i * spread + 360) % 360);
        }
        break;
        
    case 'triadic':
        // Exactly 120 degrees apart
        for (let i = 0; i < count; i++) {
           hues.push((baseHue + i * 120) % 360);
        }
        break;
        
    case 'tetradic':
        // Rectangular Tetradic: Two complementary pairs.
        // Pair 1: Base, Base + 180
        // Pair 2: Base + 60, Base + 240
        // Ordered as Base, Comp, Offset, OffsetComp for visual pairing
        const t1 = baseHue;
        const t2 = (baseHue + 180) % 360;
        const t3 = (baseHue + 60) % 360;
        const t4 = (baseHue + 240) % 360;
        const sequence = [t1, t2, t3, t4];
        
        for (let i = 0; i < count; i++) {
           hues.push(sequence[i % 4]);
        }
        break;
        
    case 'complementary':
        // Directly opposite (180 degrees)
        for (let i = 0; i < count; i++) {
           hues.push((baseHue + (i % 2) * 180) % 360);
        }
        break;
        
    case 'split-complementary':
        // Base, Base + 150, Base + 210
        const scBases = [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
        for (let i = 0; i < count; i++) {
             hues.push(scBases[i % 3]);
        }
        break;
        
    case 'random':
    default:
        hues.push(baseHue);
        for (let i = 1; i < count; i++) {
           hues.push(Math.floor(Math.random() * 360));
        }
        break;
  }

  for (let i = 0; i < count; i++) {
    let h = hues[i];
    let s = baseSat;
    let l = baseLit;

    if (mode === 'monochromatic') {
        // Strict Monochromatic: Vary only S and L
        if (count === 2) {
             // For 2 colors (e.g. Color Wheel mode), first is base, second is controlled variant
             if (i === 0) {
                 s = baseSat;
                 l = baseLit;
             } else {
                 // Determine direction: if base is light (>50), go darker. If dark/mid, go lighter.
                 // This ensures contrast without washing out.
                 const isLight = baseLit > 50;
                 const shift = isLight ? -25 : 25;
                 
                 l = baseLit + shift;
                 
                 // Clamp lightness to keep it visible/colored (avoiding white/black)
                 l = Math.max(15, Math.min(85, l));
                 
                 // Subtle saturation adjustment to maintain visual intensity
                 // If lightening, slightly desaturate to avoid neon pastel look
                 // If darkening, slightly saturate to avoid muddy look
                 if (shift > 0) s = Math.max(10, baseSat - 10);
                 else s = Math.min(100, baseSat + 10);
             }
        } else {
             // For ramp generation (count > 2), create a gradient centered around base
             const step = 15;
             const totalRange = (count - 1) * step;
             
             // Center the ramp around baseLit
             let startL = baseLit - (totalRange / 2);
             
             // Slide window if out of bounds [15, 85]
             if (startL < 15) startL = 15;
             if (startL + totalRange > 85) startL = 85 - totalRange;
             
             l = startL + (i * step);
             
             // Saturation compensation: 
             // Lighter colors get slightly less saturated, darker get slightly more.
             const lightingDiff = l - baseLit;
             s = baseSat - (lightingDiff * 0.3);
             s = Math.max(10, Math.min(100, s));
        }
    } else if (mode === 'random') {
         s = Math.floor(Math.random() * 50) + 50;
         l = Math.floor(Math.random() * 60) + 20;
    } else {
        // For other strict modes (Comp, Triad, Tetrad, Analog), 
        // keep S and L consistent to emphasize the Hue relationship.
        l = Math.max(20, Math.min(90, l));
        s = Math.max(20, Math.min(100, s));
    }

    const rgb = hslToRgb(h, s, l);
    palette.push(createColorData(rgbToHex(rgb.r, rgb.g, rgb.b)));
  }

  return palette;
};