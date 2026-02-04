import { ColorData, HSL, RGB, PaletteMode } from '../types';

// --- HELPERS ---

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

export const sortColorsByVisualProgression = (colors: ColorData[]): ColorData[] => {
    const getVals = (c: ColorData) => {
         const rgb = hexToRgb(c.hex);
         return rgbToHsl(rgb.r, rgb.g, rgb.b);
    };

    // Store HSL values to avoid re-calculation during sort
    const withVals = colors.map(c => ({ data: c, hsl: getVals(c) }));
    
    // Split into Achromatic (Low Saturation) and Chromatic
    // Threshold 12% matches "almost grey" visual perception
    const chromatic: typeof withVals = [];
    const achromatic: typeof withVals = [];
    
    for (const item of withVals) {
        if (item.hsl.s < 12) { 
            achromatic.push(item);
        } else {
            chromatic.push(item);
        }
    }
    
    // Sort Achromatic by Lightness (Dark to Light)
    achromatic.sort((a, b) => a.hsl.l - b.hsl.l);
    
    // Sort Chromatic by Hue (Spectral)
    if (chromatic.length > 0) {
        chromatic.sort((a, b) => a.hsl.h - b.hsl.h);
        
        // Find largest gap to rotate for visual continuity (Red wrap-around)
        let maxGap = 0;
        let gapIndex = 0;
        
        for (let i = 0; i < chromatic.length; i++) {
            const curr = chromatic[i].hsl.h;
            const next = chromatic[(i + 1) % chromatic.length].hsl.h;
            // Calculate distance in 360 circle
            let diff = next - curr;
            if (diff < 0) diff += 360;
            
            // We look for the largest "jump" in hue. This jump represents the
            // natural break point in the color wheel for this specific palette.
            if (diff > maxGap) {
                maxGap = diff;
                gapIndex = i;
            }
        }
        
        // Rotate: The element AFTER the gap should be the start
        const startIdx = (gapIndex + 1) % chromatic.length;
        const rotated = [
            ...chromatic.slice(startIdx),
            ...chromatic.slice(0, startIdx)
        ];
        
        chromatic.splice(0, chromatic.length, ...rotated);
    }
    
    // Combine: Achromatic first to act as anchors, then Chromatic spectrum
    return [...achromatic.map(x => x.data), ...chromatic.map(x => x.data)];
};

// --- SIGNATURE & ANTI-REPETITION LOGIC ---

// Calculate a structural signature for the palette
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
        // Update contrast metrics
        minL = Math.min(minL, hsl.l);
        maxL = Math.max(maxL, hsl.l);

        // Coarse buckets for S/L
        satBuckets.push(Math.floor(hsl.s / 20));
        lumBuckets.push(Math.floor(hsl.l / 20));

        // Define Neutral (s < 12)
        const isNeutral = hsl.s < 12;

        if (isNeutral) {
            neutralCount++;
            // Neutral Roles
            if (hsl.l < 30) roles.push('ND'); // Neutral Dark
            else if (hsl.l > 70) roles.push('NL'); // Neutral Light
            else roles.push('NM'); // Neutral Mid
        } else {
            // Chromatic Roles
            // Bucket Hue for composition (15 deg steps)
            hueBuckets.push(Math.floor(hsl.h / 15));

            if (hsl.s > 75) roles.push('V'); // Vivid
            else if (hsl.l < 30) roles.push('D'); // Dark
            else if (hsl.l > 70) roles.push('L'); // Light
            else roles.push('M'); // Mid
        }
    });

    // Sort to ensure order independence (Canonical form)
    hueBuckets.sort((a,b) => a - b);
    satBuckets.sort((a,b) => a - b);
    lumBuckets.sort((a,b) => a - b);
    roles.sort();

    const contrast = Math.floor((maxL - minL) / 20); // Coarse contrast bucket

    // Example Signature: "H:1,5,10|S:1,3,5|L:2,4,4|R:D,L,V|N:0|C:3"
    return `H:${hueBuckets.join(',')}|S:${satBuckets.join(',')}|L:${lumBuckets.join(',')}|R:${roles.join(',')}|N:${neutralCount}|C:${contrast}`;
};

// --- INTERNAL LOGIC & STATE ---

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomRange(min, max));
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const chance = (prob: number) => Math.random() < prob;

// Global history to prevent recent repetition
const globalHistory = new Set<string>();
const HISTORY_LIMIT = 60; 

// Track recent base hues to force diversity over time
const recentBaseHues: number[] = [];
const BASE_HUE_LIMIT = 5;

// Palette Signature History
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

// Check if a hue is too close to recently used base hues
const isHueRecentlyUsed = (h: number) => {
    return recentBaseHues.some(recent => {
        const diff = Math.min(Math.abs(h - recent), 360 - Math.abs(h - recent));
        return diff < 30; // 30 degree exclusion zone
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
  // Revised logic to reduce frequency of washed-out pastels
  // 40% Vivid (High Energy)
  if (r < 0.40) return { name: 'vivid', sMin: 70, sMax: 100, lMin: 40, lMax: 65 };
  // 25% Bright (Good for UI, high L but good S)
  if (r < 0.65) return { name: 'bright', sMin: 60, sMax: 90, lMin: 70, lMax: 90 }; 
  // 15% Deep (Darker, richer)
  if (r < 0.80) return { name: 'deep', sMin: 40, sMax: 80, lMin: 15, lMax: 35 };
  // 10% Dynamic (Full Range)
  if (r < 0.90) return { name: 'dynamic', sMin: 20, sMax: 100, lMin: 20, lMax: 90 };
  // 5% Pastel (The washed out look, kept rare)
  if (r < 0.95) return { name: 'pastel', sMin: 30, sMax: 60, lMin: 85, lMax: 96 };
  // 5% Muted
  return { name: 'muted', sMin: 5, sMax: 30, lMin: 40, lMax: 70 };
};

// Check if two colors are perceptually too similar
const areColorsTooSimilar = (h1: number, s1: number, l1: number, h2: number, s2: number, l2: number): boolean => {
    const hDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
    const sDiff = Math.abs(s1 - s2);
    const lDiff = Math.abs(l1 - l2);

    if (hDiff < 10) {
        if (s1 < 10 && s2 < 10) return lDiff < 15;
        return lDiff < 20 && sDiff < 20;
    }
    if (hDiff < 30) {
        return lDiff < 15 && sDiff < 15;
    }
    return false;
}

// Ensure palette is not "washed out" or boring
const enforceContrastAndVibrancy = (palette: ColorData[]): ColorData[] => {
    if (palette.length < 2) return palette;

    const hsls = palette.map(c => {
        const rgb = hexToRgb(c.hex);
        return rgbToHsl(rgb.r, rgb.g, rgb.b);
    });

    // Metrics
    const lValues = hsls.map(c => c.l);
    const minL = Math.min(...lValues);
    const maxL = Math.max(...lValues);
    const rangeL = maxL - minL;
    
    // Check for "Washed Out" (Cluster of High L, Mid S)
    const washedOutCount = hsls.filter(c => c.l > 75 && c.s < 70).length;
    const isWashedOut = washedOutCount / palette.length >= 0.7; // 70% or more are washed out

    // Check for "Dull" (Low Saturation everywhere)
    const dullCount = hsls.filter(c => c.s < 30).length;
    const isDull = dullCount / palette.length >= 0.8;

    // Check for "Flat" (No lightness contrast)
    const isFlat = rangeL < 25;

    let modified = false;

    if (isWashedOut) {
        // Inject a deep anchor
        // Usually index 0 or random
        const idx = 0;
        hsls[idx].l = randomInt(15, 30);
        hsls[idx].s = Math.max(hsls[idx].s, 50); // Ensure it has some color
        modified = true;
        
        // If we have many colors, inject a vibrant accent too
        if (palette.length >= 4) {
             const idx2 = palette.length - 1;
             hsls[idx2].l = randomInt(45, 60);
             hsls[idx2].s = randomInt(80, 100);
        }
    } else if (isDull) {
        // Inject a Vivid Pop
        const idx = randomInt(0, palette.length - 1);
        hsls[idx].s = randomInt(85, 100);
        hsls[idx].l = randomInt(50, 65);
        modified = true;
    } else if (isFlat) {
        // Stretch contrast
        // Find brightest and darkest indices
        let minIdx = 0, maxIdx = 0;
        hsls.forEach((c, i) => {
            if (c.l < hsls[minIdx].l) minIdx = i;
            if (c.l > hsls[maxIdx].l) maxIdx = i;
        });

        // Push extremes
        if (hsls[minIdx].l > 20) {
            hsls[minIdx].l = Math.max(5, hsls[minIdx].l - 25);
            modified = true;
        }
        if (hsls[maxIdx].l < 85) {
             hsls[maxIdx].l = Math.min(98, hsls[maxIdx].l + 15);
             modified = true;
        }
    }

    if (modified) {
        return hsls.map(h => {
             const rgb = hslToRgb(h.h, h.s, h.l);
             const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
             return createColorData(hex);
        });
    }

    return palette;
};

// --- GENERATION ENGINE ---

export const generatePalette = (mode: PaletteMode, count: number = 5, baseColor?: string): ColorData[] => {
    
    // Internal generator function
    const generateCandidate = (): ColorData[] => {
        const palette: ColorData[] = [];
        const paletteColors: {h: number, s: number, l: number}[] = [];

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
            // Try to find a fresh hue
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
                'neutral-pop', 'high-contrast-clash', // Removed pastel-dream from main random list to make it rarer (it depends on Vibe now or luck)
                'monochromatic-texture', 'structural-duo', 'structural-trio', 
                'anchor-focus', 'polychrome', 'divergent', 
                'complex-rhythm', 'cinematic'
            ];
            
            // Re-inject pastel-dream with low probability
            if (chance(0.05)) strategies.push('pastel-dream');

            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            strategyUsed = strategy;
            let currentH = baseH;

            switch(strategy) {
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

        // --- ENFORCE CONTRAST & VIBRANCY ---
        // Post-processing to avoid washed-out/dull palettes (unless strict mode like mono)
        // We only skip this for monochromatic/shades which have their own strict logic
        if (mode !== 'monochromatic' && mode !== 'shades') {
            finalPalette = enforceContrastAndVibrancy(finalPalette);
        }

        const noShuffleModes = ['monochromatic', 'analogous', 'warm-earth', 'hyper-warm'];
        
        if (!noShuffleModes.includes(mode)) {
            for (let i = finalPalette.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalPalette[i], finalPalette[j]] = [finalPalette[j], finalPalette[i]];
            }
        } else if (!noShuffleModes.includes(mode) && chance(0.5)) {
             for (let i = finalPalette.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalPalette[i], finalPalette[j]] = [finalPalette[j], finalPalette[i]];
            }
        }
        return finalPalette;
    };

    // Main Execution Loop with Retry Logic
    let result: ColorData[] = [];
    
    // Allow 1 retry if signature matches history
    // Only apply to random generation modes where we want variety
    const shouldCheckSignature = (mode === 'random' || mode === 'warm-earth' || mode === 'hyper-warm') && !baseColor;
    const maxAttempts = shouldCheckSignature ? 2 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        result = generateCandidate();
        
        if (shouldCheckSignature) {
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