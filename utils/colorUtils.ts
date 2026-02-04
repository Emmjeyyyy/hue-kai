import { ColorData, HSL, RGB, PaletteMode } from '../types';
import { 
    converter, 
    differenceEuclidean, 
    formatHex,
    interpolate,
    samples
} from 'culori';

// --- CULORI SETUP ---
const toOklch = converter('oklch');
const toOklab = converter('oklab');
const toRgb = converter('rgb');

// --- HELPERS (Legacy/Display) ---

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

// --- INTELLIGENT SORTING ---

export const sortColorsByVisualProgression = (colors: ColorData[]): ColorData[] => {
    // Enhance: Convert to OKLCH for perceptual sorting
    const withVals = colors.map(c => {
         const oklch = toOklch(c.hex);
         // Culori might return undefined for hue on achromatic colors
         return { 
           data: c, 
           oklch: oklch || { mode: 'oklch' as const, l: 0, c: 0, h: 0 } 
         };
    });
    
    // Perceptual Achromatic Threshold (Chroma < 0.04 in OKLCH is visually grey)
    const chromatic: typeof withVals = [];
    const achromatic: typeof withVals = [];
    
    for (const item of withVals) {
        if (!item.oklch.h && item.oklch.h !== 0) item.oklch.h = 0;

        if (item.oklch.c < 0.04) { 
            achromatic.push(item);
        } else {
            chromatic.push(item);
        }
    }
    
    // Sort Achromatic by Lightness (Dark to Light) using OKLCH Lightness
    achromatic.sort((a, b) => a.oklch.l - b.oklch.l);
    
    // Sort Chromatic by Hue (Spectral)
    if (chromatic.length > 0) {
        chromatic.sort((a, b) => (a.oklch.h || 0) - (b.oklch.h || 0));
        
        // Find largest perceptual gap
        let maxGap = 0;
        let gapIndex = 0;
        
        for (let i = 0; i < chromatic.length; i++) {
            const curr = chromatic[i].oklch.h || 0;
            const next = chromatic[(i + 1) % chromatic.length].oklch.h || 0;
            
            let diff = next - curr;
            if (diff < 0) diff += 360;
            
            if (diff > maxGap) {
                maxGap = diff;
                gapIndex = i;
            }
        }
        
        const startIdx = (gapIndex + 1) % chromatic.length;
        const rotated = [
            ...chromatic.slice(startIdx),
            ...chromatic.slice(0, startIdx)
        ];
        
        chromatic.splice(0, chromatic.length, ...rotated);
    }
    
    return [...achromatic.map(x => x.data), ...chromatic.map(x => x.data)];
};

// --- SIGNATURE & ANTI-REPETITION LOGIC ---

// Calculate a structural signature for the palette
// NOTE: Preserving original HSL bucket logic as requested for identity/behavior
const calculatePaletteSignature = (colors: ColorData[]): string => {
    const hsls = colors.map(c => {
        const rgb = hexToRgb(c.hex);
        return rgbToHsl(rgb.r, rgb.g, rgb.b);
    });

    let minL = 100, maxL = 0;
    let neutralCount = 0;
    
    const hueBuckets: number[] = [];
    const satBuckets: number[] = [];
    const lumBuckets: number[] = [];
    const roles: string[] = [];

    hsls.forEach(hsl => {
        minL = Math.min(minL, hsl.l);
        maxL = Math.max(maxL, hsl.l);

        satBuckets.push(Math.floor(hsl.s / 20));
        lumBuckets.push(Math.floor(hsl.l / 20));

        const isNeutral = hsl.s < 12;

        if (isNeutral) {
            neutralCount++;
            if (hsl.l < 30) roles.push('ND'); 
            else if (hsl.l > 70) roles.push('NL'); 
            else roles.push('NM'); 
        } else {
            hueBuckets.push(Math.floor(hsl.h / 15));
            if (hsl.s > 75) roles.push('V'); 
            else if (hsl.l < 30) roles.push('D'); 
            else if (hsl.l > 70) roles.push('L'); 
            else roles.push('M'); 
        }
    });

    hueBuckets.sort((a,b) => a - b);
    satBuckets.sort((a,b) => a - b);
    lumBuckets.sort((a,b) => a - b);
    roles.sort();

    const contrast = Math.floor((maxL - minL) / 20); 

    return `H:${hueBuckets.join(',')}|S:${satBuckets.join(',')}|L:${lumBuckets.join(',')}|R:${roles.join(',')}|N:${neutralCount}|C:${contrast}`;
};

// --- INTERNAL LOGIC & STATE ---

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomRange(min, max));
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const chance = (prob: number) => Math.random() < prob;

const globalHistory = new Set<string>();
const HISTORY_LIMIT = 60; 

const recentBaseHues: number[] = [];
const BASE_HUE_LIMIT = 5;

const recentSignatures: string[] = [];
const SIGNATURE_LIMIT = 30;

const registerColor = (hex: string) => {
    globalHistory.add(hex);
    if (globalHistory.size > HISTORY_LIMIT) {
        const first = globalHistory.values().next().value;
        if (first) globalHistory.delete(first);
    }
};

const registerBaseHue = (h: number) => {
    recentBaseHues.push(h);
    if (recentBaseHues.length > BASE_HUE_LIMIT) {
        recentBaseHues.shift();
    }
}

const registerSignature = (sig: string) => {
    recentSignatures.push(sig);
    if (recentSignatures.length > SIGNATURE_LIMIT) {
        recentSignatures.shift();
    }
}

const isHueRecentlyUsed = (h: number) => {
    return recentBaseHues.some(recent => {
        const diff = Math.min(Math.abs(h - recent), 360 - Math.abs(h - recent));
        return diff < 30; 
    });
}

// Vibe Definitions
interface Vibe {
  name: string;
  sMin: number; sMax: number;
  lMin: number; lMax: number;
}

const getWeightedVibe = (): Vibe => {
  const r = Math.random();
  if (r < 0.40) return { name: 'vivid', sMin: 70, sMax: 100, lMin: 40, lMax: 65 };
  if (r < 0.65) return { name: 'bright', sMin: 60, sMax: 90, lMin: 70, lMax: 90 }; 
  if (r < 0.80) return { name: 'deep', sMin: 40, sMax: 80, lMin: 15, lMax: 35 };
  if (r < 0.90) return { name: 'dynamic', sMin: 20, sMax: 100, lMin: 20, lMax: 90 };
  if (r < 0.95) return { name: 'pastel', sMin: 30, sMax: 60, lMin: 85, lMax: 96 };
  return { name: 'muted', sMin: 5, sMax: 30, lMin: 40, lMax: 70 };
};

// Check if two colors are perceptually too similar using Oklab Distance
const areColorsTooSimilar = (h1: number, s1: number, l1: number, h2: number, s2: number, l2: number): boolean => {
    const c1 = { mode: 'hsl' as const, h: h1, s: s1/100, l: l1/100 };
    const c2 = { mode: 'hsl' as const, h: h2, s: s2/100, l: l2/100 };
    
    const dist = differenceEuclidean('oklab')(c1, c2);
    if (typeof dist !== 'number' || isNaN(dist)) return false;
    return dist < 0.06;
}

// Ensure palette is not "washed out" or boring using OKLCH intelligence
const enforceContrastAndVibrancy = (palette: ColorData[]): ColorData[] => {
    if (palette.length < 2) return palette;

    const oklchColors = palette.map(c => {
        const o = toOklch(c.hex);
        return o || { mode: 'oklch' as const, l: 0, c: 0, h: 0 };
    });

    const lValues = oklchColors.map(c => c.l);
    const minL = Math.min(...lValues);
    const maxL = Math.max(...lValues);
    const rangeL = maxL - minL;
    
    const washedOutCount = oklchColors.filter(c => c.l > 0.85 && c.c < 0.1).length;
    const isWashedOut = washedOutCount / palette.length >= 0.7;

    const dullCount = oklchColors.filter(c => c.c < 0.05).length;
    const isDull = dullCount / palette.length >= 0.8;

    const isFlat = rangeL < 0.25;

    let modified = false;

    if (isWashedOut) {
        const idx = 0;
        oklchColors[idx].l = randomRange(0.2, 0.3);
        if (oklchColors[idx].c < 0.05) oklchColors[idx].c = 0.1;
        modified = true;
        
        if (palette.length >= 4) {
             const idx2 = palette.length - 1;
             oklchColors[idx2].l = randomRange(0.5, 0.7);
             oklchColors[idx2].c = randomRange(0.15, 0.25);
             modified = true;
        }
    } else if (isDull) {
        const idx = randomInt(0, palette.length - 1);
        oklchColors[idx].c = randomRange(0.2, 0.3); 
        oklchColors[idx].l = randomRange(0.5, 0.7);
        modified = true;
    } else if (isFlat) {
        let minIdx = 0, maxIdx = 0;
        oklchColors.forEach((c, i) => {
            if (c.l < oklchColors[minIdx].l) minIdx = i;
            if (c.l > oklchColors[maxIdx].l) maxIdx = i;
        });

        if (oklchColors[minIdx].l > 0.3) {
            oklchColors[minIdx].l = Math.max(0.05, oklchColors[minIdx].l - 0.25);
            modified = true;
        }
        if (oklchColors[maxIdx].l < 0.9) {
             oklchColors[maxIdx].l = Math.min(0.98, oklchColors[maxIdx].l + 0.15);
             modified = true;
        }
    }

    if (modified) {
        return oklchColors.map(o => {
             const hex = formatHex(o);
             return createColorData(hex);
        });
    }

    return palette;
};

// --- GENERATION ENGINE ---

interface GenerationResult {
    colors: ColorData[];
    skipShuffle?: boolean;
    skipPostProcess?: boolean;
}

export const generatePalette = (mode: PaletteMode, count: number = 5, baseColor?: string): ColorData[] => {
    
    // Internal generator function
    const generateCandidate = (): GenerationResult => {
        const palette: ColorData[] = [];
        const paletteColors: {h: number, s: number, l: number}[] = [];
        let skipShuffle = false;
        let skipPostProcess = false;

        // 1. Determine Base Hue with Anti-Repetition
        let baseH: number, baseS: number, baseL: number;
        const vibe = getWeightedVibe();

        if (baseColor) {
            const rgb = hexToRgb(baseColor);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            baseH = hsl.h;
            baseS = hsl.s; 
            baseL = hsl.l;
        } else {
            let attempts = 0;
            do {
                baseH = randomInt(0, 360);
                attempts++;
            } while (isHueRecentlyUsed(baseH) && attempts < 10);
            
            registerBaseHue(baseH);

            baseS = randomInt(vibe.sMin, vibe.sMax);
            baseL = randomInt(vibe.lMin, vibe.lMax);
        }

        // 2. Helper to Add Colors with Collision Detection
        const addColor = (h: number, s: number, l: number): boolean => {
            h = h % 360;
            if (h < 0) h += 360;
            s = clamp(s, 0, 100);
            l = clamp(l, 5, 98);

            for (const pc of paletteColors) {
                if (areColorsTooSimilar(h, s, l, pc.h, pc.s, pc.l)) {
                    return false; 
                }
            }

            let rgb = hslToRgb(h, s, l);
            let hex = rgbToHex(rgb.r, rgb.g, rgb.b);

            if (globalHistory.has(hex)) {
                l = clamp(l + (chance(0.5) ? 5 : -5), 5, 95);
                rgb = hslToRgb(h, s, l);
                hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            }

            paletteColors.push({h, s, l});
            palette.push(createColorData(hex));
            registerColor(hex);
            return true;
        };

        const safeAddColor = (h: number, s: number, l: number) => {
            if (!addColor(h, s, l)) {
                if (!addColor(h, s, clamp(l + 20, 0, 100))) {
                    addColor(h + 30, s, l);
                }
            }
        };

        // --- MODE EXECUTION ---
        
        let strategyUsed = "";

        if (mode === 'random') {
            const strategies = [
                'golden-ratio', 'analogous-walk', 'triadic-scatter', 
                'neutral-pop', 'high-contrast-clash',
                'monochromatic-texture', 'structural-duo', 'structural-trio', 
                'anchor-focus', 'polychrome', 'divergent', 
                'complex-rhythm', 'cinematic',
                // ADVANCED COLOR FX (Probabilistic injection)
                'smooth-gradient', 'iridescent-flow', 'neon-maximalist'
            ];
            
            if (chance(0.05)) strategies.push('pastel-dream');

            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            strategyUsed = strategy;
            let currentH = baseH;

            switch(strategy) {
                    // --- NEW ADVANCED FX ---
                    case 'smooth-gradient': {
                        // Generate a perceptually uniform gradient
                        // We pick start and end points in OKLCH to ensure vibrancy
                        const start = { mode: 'oklch' as const, l: randomRange(0.4, 0.9), c: randomRange(0.1, 0.3), h: randomInt(0, 360) };
                        // Ensure end is distinct but related
                        const hueShift = chance(0.5) ? randomInt(60, 120) : randomInt(180, 240);
                        const end = { mode: 'oklch' as const, l: randomRange(0.2, 0.8), c: randomRange(0.1, 0.3), h: (start.h + hueShift) % 360 };
                        
                        const interpolator = interpolate([start, end], 'oklab'); // Oklab interpolation for smoothness
                        const steps = count;
                        // Use Culori samples to generate 'count' steps from 0 to 1
                        const gradientColors = samples(steps).map(interpolator).map(formatHex);
                        
                        gradientColors.forEach(hex => {
                            if(hex) palette.push(createColorData(hex));
                        });
                        
                        skipShuffle = true; // Gradients must order strictly
                        skipPostProcess = true; // Gradients are intentional
                        break;
                    }

                    case 'iridescent-flow': {
                        // Simulates surface interference (pearl or oil slick)
                        // Characteristic: High hue shift density, constant chroma/lightness
                        const type = chance(0.7) ? 'pearl' : 'oil';
                        const baseL = type === 'pearl' ? randomRange(0.85, 0.96) : randomRange(0.15, 0.25);
                        const baseC = type === 'pearl' ? randomRange(0.02, 0.1) : randomRange(0.1, 0.2); // Oil has more chroma
                        const startHue = randomInt(0, 360);
                        const hueStep = randomRange(10, 20); // Small steps
                        
                        for(let i=0; i<count; i++) {
                            const oklch = {
                                mode: 'oklch' as const,
                                l: baseL + randomRange(-0.02, 0.02),
                                c: baseC,
                                h: (startHue + (i * hueStep)) % 360
                            };
                            const hex = formatHex(oklch);
                            if(hex) palette.push(createColorData(hex));
                        }
                        
                        skipShuffle = true;
                        skipPostProcess = true; // Iridescence is naturally low-contrast/flat
                        break;
                    }

                    case 'neon-maximalist': {
                        // High Energy: Maximize Chroma in Oklch
                        // Oklch chroma can go up to ~0.37, generally >0.2 is very vivid
                        for(let i=0; i<count; i++) {
                             // Distribute hues for maximum contrast
                             const h = (baseH + (i * (360/count)) + randomInt(-20, 20)) % 360;
                             const oklch = {
                                 mode: 'oklch' as const,
                                 l: randomRange(0.6, 0.85), // Light enough to glow
                                 c: randomRange(0.2, 0.32), // Extremely vivid
                                 h: h
                             };
                             const hex = formatHex(oklch);
                             if(hex) palette.push(createColorData(hex));
                        }
                        // Don't skip shuffle/post-process, let it feel organic but intense
                        break;
                    }

                    // --- EXISTING STRATEGIES ---
                    case 'polychrome': {
                        const slice = 360 / count;
                        const offset = randomInt(0, 360);
                        for(let i=0; i<count; i++) {
                            safeAddColor(offset + (i * slice) + randomInt(-20, 20), randomInt(50, 95), randomInt(30, 80));
                        }
                        break;
                    }
                    case 'divergent': {
                        const h1 = baseH;
                        const h2 = (baseH + 180) % 360;
                        for(let i=0; i<count; i++) {
                            const target = i % 2 === 0 ? h1 : h2;
                            safeAddColor(target + randomInt(-40, 40), randomInt(40, 90), randomInt(20, 80));
                        }
                        break;
                    }
                    case 'complex-rhythm': {
                        let step = 137.5;
                        for(let i=0; i<count; i++) {
                            safeAddColor(baseH + (i * step), randomInt(vibe.sMin, Math.min(100, vibe.sMax + 20)), randomInt(vibe.lMin, vibe.lMax));
                        }
                        break;
                    }
                    case 'cinematic': {
                        const pairType = Math.random();
                        let warmH = 0, coolH = 0;
                        if (pairType < 0.33) { warmH = 25; coolH = 195; }
                        else if (pairType < 0.66) { warmH = 340; coolH = 160; }
                        else { warmH = 50; coolH = 240; }
                        const shift = randomInt(-20, 20);
                        warmH += shift; coolH += shift;
                        for(let i=0; i<count; i++) {
                            const isWarm = chance(0.4);
                            const h = isWarm ? warmH : coolH;
                            safeAddColor(h + randomInt(-15, 15), randomInt(50, 90), isWarm ? randomInt(50, 70) : randomInt(20, 50));
                        }
                        break;
                    }
                    case 'structural-duo': {
                        const h1 = baseH;
                        const h2 = (baseH + randomInt(80, 280)) % 360;
                        for(let i=0; i<count; i++) {
                            const targetH = (i < count / 2) ? h1 : h2;
                            safeAddColor(targetH + randomInt(-10, 10), randomInt(vibe.sMin, vibe.sMax), randomInt(10, 90));
                        }
                        break;
                    }
                    case 'structural-trio': {
                        const h1 = baseH;
                        const h2 = (baseH + randomInt(90, 150)) % 360;
                        const h3 = (h2 + randomInt(90, 150)) % 360;
                        const hues = [h1, h2, h3];
                        for(let i=0; i<count; i++) {
                            safeAddColor(hues[i % 3] + randomInt(-10, 10), randomInt(40, 90), randomInt(30, 80));
                        }
                        break;
                    }
                    case 'anchor-focus': {
                        const isDarkAnchor = chance(0.5);
                        const numAnchors = randomInt(1, 2);
                        for(let i=0; i<count; i++) {
                            if (i < numAnchors) {
                                if (isDarkAnchor) safeAddColor(baseH, 5, randomInt(5, 12));
                                else safeAddColor(baseH, 5, randomInt(90, 98));
                            } else {
                                const accentH = (baseH + (i * 50) + 60) % 360;
                                safeAddColor(accentH, randomInt(70, 100), randomInt(45, 65));
                            }
                        }
                        break;
                    }
                    case 'golden-ratio': 
                        for(let i=0; i<count; i++) safeAddColor((baseH + (i * 0.618033988749895 * 360)) % 360, randomInt(vibe.sMin, vibe.sMax), randomInt(vibe.lMin, vibe.lMax));
                        break;
                    case 'analogous-walk': 
                        const step = randomInt(30, 50) * (chance(0.5) ? 1 : -1);
                        for(let i=0; i<count; i++) {
                            safeAddColor(currentH, clamp(baseS + randomInt(-10, 10), 30, 90), clamp(baseL + randomInt(-15, 15), 30, 80));
                            currentH += step;
                        }
                        break;
                    case 'triadic-scatter': 
                        for(let i=0; i<count; i++) {
                            const offset = (Math.floor(i % 3) * 120) + randomInt(-30, 30);
                            safeAddColor(baseH + offset, randomInt(60, 95), randomInt(30, 80));
                        }
                        break;
                    case 'neutral-pop': 
                        const popIndex = randomInt(0, count-1);
                        for(let i=0; i<count; i++) {
                            if (i === popIndex) safeAddColor((baseH + 180) % 360, randomInt(80, 100), 60);
                            else safeAddColor(baseH + randomInt(-20, 20), randomInt(0, 20), randomInt(20, 90));
                        }
                        break;
                    case 'pastel-dream':
                        for(let i=0; i<count; i++) safeAddColor((baseH + (i * 70) + randomInt(-20, 20)) % 360, randomInt(40, 70), randomInt(80, 94));
                        break;
                    case 'high-contrast-clash':
                        for(let i=0; i<count; i++) {
                            const l = chance(0.5) ? randomInt(10, 25) : randomInt(80, 95);
                            safeAddColor((baseH + (i * 140)) % 360, randomInt(60, 90), l);
                        }
                        break;
                    case 'monochromatic-texture':
                    default: 
                        const startL = 20;
                        const endL = 90;
                        const stepL = (endL - startL) / count;
                        for(let i=0; i<count; i++) safeAddColor(baseH + randomInt(-15, 15), randomInt(30, 80), startL + (i * stepL) + randomInt(-5, 5));
            }
        }
        else if (mode === 'warm-earth') {
            const startH = (randomInt(350, 390)) % 360; 
            const totalShift = randomInt(30, 60); 
            const startL = randomInt(15, 25);
            const endL = randomInt(65, 85);   
            for(let i=0; i<count; i++) {
                const progress = i / (count - 1 || 1);
                const currentH = (startH + (progress * totalShift)) % 360;
                const s = clamp(randomInt(50, 80) + (progress * 20), 40, 100);
                const l = clamp(startL + (progress * (endL - startL)) + randomInt(-5, 5), 10, 95);
                safeAddColor(currentH, s, l);
            }
        }
        else if (mode === 'hyper-warm') {
            const minH = 320;
            const maxH = 410; 
            for(let i=0; i<count; i++) {
                let h = randomInt(minH, maxH) % 360;
                const s = randomInt(80, 100);
                let l = 50;
                if (h >= 40 && h <= 70) l = randomInt(60, 90);
                else if (h >= 10 && h < 40) l = randomInt(50, 75);
                else l = randomInt(45, 65);
                safeAddColor(h, s, l);
            }
        }
        else if (mode === 'cyberpunk') {
            const subTheme = Math.random();
            if (subTheme < 0.33) { 
                safeAddColor(baseH, randomInt(20, 40), randomInt(5, 12)); 
                for(let i=1; i<count; i++) safeAddColor((baseH + 120 + (i * 50)) % 360, 100, 60); 
            } else if (subTheme < 0.66) { 
                safeAddColor(0, 0, 5); 
                for(let i=1; i<count; i++) safeAddColor(baseH + randomInt(-30, 30), randomInt(80, 100), randomInt(30, 80));
            } else { 
                for(let i=0; i<count; i++) safeAddColor((baseH + (i * 40)) % 360, randomInt(80, 100), randomInt(40, 70));
            }
        }
        else if (mode === 'modern-ui') {
            const brandH = (baseH + randomInt(0, 60)) % 360;
            safeAddColor(brandH, randomInt(70, 90), randomInt(45, 60));
            safeAddColor(brandH, 5, 96);
            safeAddColor(brandH, 10, 15);
            safeAddColor((brandH + 180) % 360, randomInt(60, 80), randomInt(50, 70));
            for(let i=4; i<count; i++) safeAddColor(brandH, 5, randomInt(80, 90));
        }
        else if (mode === 'retro-future') {
            for(let i=0; i<count; i++) {
                if (chance(0.4)) safeAddColor(baseH, randomInt(0, 5), randomInt(75, 95));
                else safeAddColor((baseH + i * 90) % 360, randomInt(80, 100), randomInt(50, 70));
            }
        }
        else if (mode === 'compound') {
            const hues = [baseH, (baseH + 180) % 360, (baseH + 30) % 360, (baseH + 210) % 360, (baseH + 150) % 360];
            for(let i=0; i<count; i++) safeAddColor(hues[i % hues.length] + randomInt(-10, 10), randomInt(vibe.sMin, vibe.sMax), randomInt(vibe.lMin, vibe.lMax));
        }
        else if (mode === 'shades') {
            for(let i=0; i<count; i++) safeAddColor(baseH + randomInt(-5, 5), randomInt(10, 90), randomInt(10, 90));
        }
        else {
            const hues: number[] = [];
            if (mode === 'monochromatic') for(let i=0; i<count; i++) hues.push(baseH + randomInt(-10, 10));
            else if (mode === 'analogous') {
                const spread = randomInt(30, 60);
                const start = baseH - ((count-1)*spread/2);
                for(let i=0; i<count; i++) hues.push(start + (i*spread));
            } else if (mode === 'triadic') for(let i=0; i<count; i++) hues.push(baseH + (i*120) + randomInt(-15, 15));
            else if (mode === 'tetradic') {
                const h2 = baseH + 180; const h3 = baseH + 90; const h4 = baseH + 270; const bases = [baseH, h2, h3, h4];
                for(let i=0; i<count; i++) hues.push(bases[i%4] + randomInt(-15, 15));
            } else if (mode === 'split-complementary') {
                const spread = randomInt(30, 50); const bases = [baseH, baseH+180-spread, baseH+180+spread];
                for(let i=0; i<count; i++) hues.push(bases[i%3] + randomInt(-10, 10));
            } else for(let i=0; i<count; i++) hues.push(baseH + ((i%2)*180) + randomInt(-10, 10));

            if (mode === 'monochromatic') {
                const startL = 15; const endL = 95; const step = (endL - startL) / (count - 1 || 1);
                for(let i=0; i<count; i++) safeAddColor(hues[i], clamp(baseS + randomInt(-10, 10), 0, 90), startL + (i*step));
            } else {
                for (let i = 0; i < count; i++) safeAddColor(hues[i], randomInt(vibe.sMin, vibe.sMax), randomInt(vibe.lMin, vibe.lMax));
            }
        }

        while(palette.length < count) safeAddColor(randomInt(0, 360), randomInt(50, 90), randomInt(40, 60));

        let finalPalette = palette.slice(0, count);

        // --- ENFORCE CONTRAST & VIBRANCY (Upgraded to OKLCH) ---
        // Skip for specific modes that require strict relationships (mono, gradient, iridescent)
        if (mode !== 'monochromatic' && mode !== 'shades' && !skipPostProcess) {
            finalPalette = enforceContrastAndVibrancy(finalPalette);
        }

        const noShuffleModes = ['monochromatic', 'analogous', 'warm-earth', 'hyper-warm'];
        
        if (!skipShuffle && !noShuffleModes.includes(mode)) {
            for (let i = finalPalette.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalPalette[i], finalPalette[j]] = [finalPalette[j], finalPalette[i]];
            }
        } else if (!skipShuffle && !noShuffleModes.includes(mode) && chance(0.5)) {
             for (let i = finalPalette.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalPalette[i], finalPalette[j]] = [finalPalette[j], finalPalette[i]];
            }
        }
        return { colors: finalPalette, skipShuffle, skipPostProcess };
    };

    // Main Execution Loop with Retry Logic
    let result: ColorData[] = [];
    
    // Allow 1 retry if signature matches history
    // Only apply to random generation modes where we want variety
    const shouldCheckSignature = (mode === 'random' || mode === 'warm-earth' || mode === 'hyper-warm') && !baseColor;
    const maxAttempts = shouldCheckSignature ? 2 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const candidate = generateCandidate();
        result = candidate.colors;
        
        if (shouldCheckSignature && !candidate.skipShuffle) { // Don't check signature for gradients/iridescent as they are unique by nature
            const sig = calculatePaletteSignature(result);
            if (attempt === 0 && recentSignatures.includes(sig)) {
                // Detected repetition, retrying...
                continue;
            }
            registerSignature(sig);
        }
        break;
    }
    
    return result;
};