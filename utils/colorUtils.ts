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
  // Expanded logic for more diversity.
  // 35% Vivid, 20% Bright, 15% Pastel, 10% Deep, 15% Dynamic (Full Range), 5% Muted
  if (r < 0.35) return { name: 'vivid', sMin: 70, sMax: 100, lMin: 40, lMax: 65 };
  if (r < 0.55) return { name: 'bright', sMin: 60, sMax: 90, lMin: 80, lMax: 95 };
  if (r < 0.70) return { name: 'pastel', sMin: 30, sMax: 60, lMin: 85, lMax: 96 };
  if (r < 0.80) return { name: 'deep', sMin: 40, sMax: 80, lMin: 15, lMax: 35 };
  if (r < 0.95) return { name: 'dynamic', sMin: 20, sMax: 100, lMin: 20, lMax: 90 };
  return { name: 'muted', sMin: 5, sMax: 30, lMin: 40, lMax: 70 };
};

// Check if two colors are perceptually too similar
const areColorsTooSimilar = (h1: number, s1: number, l1: number, h2: number, s2: number, l2: number): boolean => {
    // Hue difference in degrees (shortest path)
    const hDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
    const sDiff = Math.abs(s1 - s2);
    const lDiff = Math.abs(l1 - l2);

    // If hues are effectively identical
    if (hDiff < 10) {
        // Must have significant Lightness or Saturation contrast
        // If Saturation is very low (greys), Hue matters less, so we strictly check L
        if (s1 < 10 && s2 < 10) return lDiff < 15;
        
        return lDiff < 20 && sDiff < 20;
    }
    
    // If hues are somewhat close
    if (hDiff < 30) {
        return lDiff < 15 && sDiff < 15;
    }

    return false;
}

// --- GENERATION ENGINE ---

export const generatePalette = (mode: PaletteMode, count: number = 5, baseColor?: string): ColorData[] => {
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
    // Normalize inputs
    h = h % 360;
    if (h < 0) h += 360;
    s = clamp(s, 0, 100);
    l = clamp(l, 5, 98); // Prevent pure black/white usually

    // Check collision against currently generated palette
    // This ensures distinct colors within the SAME palette
    for (const pc of paletteColors) {
        if (areColorsTooSimilar(h, s, l, pc.h, pc.s, pc.l)) {
            return false; // Collision detected
        }
    }

    // Convert
    let rgb = hslToRgb(h, s, l);
    let hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Check global history (optional, less strict here to allow re-use if context changes)
    if (globalHistory.has(hex)) {
        // Tweak slightly to make it unique
        l = clamp(l + (chance(0.5) ? 5 : -5), 5, 95);
        rgb = hslToRgb(h, s, l);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    paletteColors.push({h, s, l});
    palette.push(createColorData(hex));
    registerColor(hex);
    return true;
  };

  // Safe Add: Tries to add a color, if it fails due to similarity, tries to shift it
  const safeAddColor = (h: number, s: number, l: number) => {
      if (!addColor(h, s, l)) {
          // Attempt 1: Shift Lightness
          if (!addColor(h, s, clamp(l + 20, 0, 100))) {
              // Attempt 2: Shift Hue
              addColor(h + 30, s, l);
          }
      }
  };

  // --- SPECIALIZED RECIPES ---

  const generateNeutralContrastScheme = () => {
       const rootH = baseH;
       const accentH = (rootH + randomInt(150, 210)) % 360;
       
       safeAddColor(rootH, randomInt(5, 15), randomInt(10, 20)); // Dark Neutral
       safeAddColor(accentH, randomInt(70, 95), randomInt(50, 65)); // Vibrant Accent
       safeAddColor(rootH, randomInt(5, 10), randomInt(90, 98)); // Light Neutral
       safeAddColor((rootH + 30) % 360, randomInt(5, 20), randomInt(40, 60)); // Mid-tone
       
       // Fill rest with variations
       while(palette.length < count) {
           const h = chance(0.5) ? rootH : accentH;
           safeAddColor(h + randomInt(-20, 20), randomInt(20, 60), randomInt(30, 80));
       }
  };

  // --- MODE EXECUTION ---
  
  let strategyUsed = "";

  if (mode === 'random') {
      const strategies = [
          'golden-ratio', 
          'analogous-walk', 
          'triadic-scatter', 
          'neutral-pop', 
          'pastel-dream', 
          'high-contrast-clash',
          'monochromatic-texture',
          'structural-duo', 
          'structural-trio', 
          'anchor-focus',
          // NEW STRATEGIES
          'polychrome',
          'divergent',
          'complex-rhythm',
          'cinematic'
      ];
      
      const strategy = strategies[Math.floor(Math.random() * strategies.length)];
      strategyUsed = strategy;
      
      let currentH = baseH;

      switch(strategy) {
            case 'polychrome': {
                // Completely distinct hues for every color
                // Divide circle by count, add random jitter
                const slice = 360 / count;
                // Random start offset
                const offset = randomInt(0, 360);
                for(let i=0; i<count; i++) {
                    const h = offset + (i * slice) + randomInt(-20, 20);
                    const s = randomInt(50, 95);
                    const l = randomInt(30, 80);
                    safeAddColor(h, s, l);
                }
                break;
            }

            case 'divergent': {
                // Two clusters on opposite sides
                const h1 = baseH;
                const h2 = (baseH + 180) % 360;
                
                for(let i=0; i<count; i++) {
                    const target = i % 2 === 0 ? h1 : h2;
                    // Wide spread around targets
                    safeAddColor(
                        target + randomInt(-40, 40),
                        randomInt(40, 90),
                        randomInt(20, 80)
                    );
                }
                break;
            }

            case 'complex-rhythm': {
                // Fibonacci-like jumps or prime steps
                let step = 137.5; // Golden angle
                for(let i=0; i<count; i++) {
                    safeAddColor(
                        baseH + (i * step),
                        randomInt(vibe.sMin, Math.min(100, vibe.sMax + 20)),
                        randomInt(vibe.lMin, vibe.lMax)
                    );
                }
                break;
            }

            case 'cinematic': {
                // Orange/Teal or Purple/Yellow heavy
                const pairType = Math.random();
                let warmH = 0, coolH = 0;
                if (pairType < 0.33) { warmH = 25; coolH = 195; } // Orange/Teal
                else if (pairType < 0.66) { warmH = 340; coolH = 160; } // Pink/Green
                else { warmH = 50; coolH = 240; } // Yellow/Blue

                // Shift slightly
                const shift = randomInt(-20, 20);
                warmH += shift; coolH += shift;

                for(let i=0; i<count; i++) {
                    const isWarm = chance(0.4); // Bias towards cool slightly
                    const h = isWarm ? warmH : coolH;
                    safeAddColor(
                        h + randomInt(-15, 15),
                        randomInt(50, 90),
                        isWarm ? randomInt(50, 70) : randomInt(20, 50) // Warm colors often brighter, cool darker
                    );
                }
                break;
            }

            case 'structural-duo': {
                const h1 = baseH;
                const h2 = (baseH + randomInt(80, 280)) % 360; // Ensure distance
                
                for(let i=0; i<count; i++) {
                    const useFirst = i < count / 2; // Split evenly-ish
                    const targetH = useFirst ? h1 : h2;
                    safeAddColor(
                        targetH + randomInt(-10, 10),
                        randomInt(vibe.sMin, vibe.sMax), 
                        randomInt(10, 90)
                    );
                }
                break;
            }

            case 'structural-trio': {
                const h1 = baseH;
                const h2 = (baseH + randomInt(90, 150)) % 360;
                const h3 = (h2 + randomInt(90, 150)) % 360;
                const hues = [h1, h2, h3];

                for(let i=0; i<count; i++) {
                    const targetH = hues[i % 3];
                    safeAddColor(targetH + randomInt(-10, 10), randomInt(40, 90), randomInt(30, 80));
                }
                break;
            }

            case 'anchor-focus': {
                // High Contrast: White or Black anchor + Vivid Accents
                const isDarkAnchor = chance(0.5);
                const numAnchors = randomInt(1, 2);

                for(let i=0; i<count; i++) {
                    if (i < numAnchors) {
                        if (isDarkAnchor) safeAddColor(baseH, 5, randomInt(5, 12));
                        else safeAddColor(baseH, 5, randomInt(90, 98));
                    } else {
                        // Vivid Accents
                        const accentH = (baseH + (i * 50) + 60) % 360;
                        safeAddColor(accentH, randomInt(70, 100), randomInt(45, 65));
                    }
                }
                break;
            }

            case 'golden-ratio': 
                for(let i=0; i<count; i++) {
                    safeAddColor(
                        (baseH + (i * 0.618033988749895 * 360)) % 360, 
                        randomInt(vibe.sMin, vibe.sMax), 
                        randomInt(vibe.lMin, vibe.lMax)
                    );
                }
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
                    if (i === popIndex) {
                        safeAddColor((baseH + 180) % 360, randomInt(80, 100), 60);
                    } else {
                        safeAddColor(baseH + randomInt(-20, 20), randomInt(0, 20), randomInt(20, 90));
                    }
                }
                break;
                
            case 'pastel-dream':
                for(let i=0; i<count; i++) {
                    safeAddColor(
                        (baseH + (i * 70) + randomInt(-20, 20)) % 360,
                        randomInt(40, 70), 
                        randomInt(80, 94)
                    );
                }
                break;
                
            case 'high-contrast-clash':
                for(let i=0; i<count; i++) {
                    const l = chance(0.5) ? randomInt(10, 25) : randomInt(80, 95);
                    const h = (baseH + (i * 140)) % 360; 
                    safeAddColor(h, randomInt(60, 90), l);
                }
                break;
            
            case 'monochromatic-texture':
            default: 
                const startL = 20;
                const endL = 90;
                const stepL = (endL - startL) / count;
                for(let i=0; i<count; i++) {
                    safeAddColor(
                        baseH + randomInt(-15, 15),
                        randomInt(30, 80),
                        startL + (i * stepL) + randomInt(-5, 5)
                    );
                }
      }
  }

  else if (mode === 'cyberpunk') {
      const subTheme = Math.random();
      if (subTheme < 0.33) { 
          safeAddColor(baseH, randomInt(20, 40), randomInt(5, 12)); 
          for(let i=1; i<count; i++) {
              const h = (baseH + 120 + (i * 50)) % 360;
              safeAddColor(h, 100, 60); 
          }
      } else if (subTheme < 0.66) { 
           safeAddColor(0, 0, 5); 
           for(let i=1; i<count; i++) {
               const h = baseH + randomInt(-30, 30); 
               safeAddColor(h, randomInt(80, 100), randomInt(30, 80));
           }
      } else { 
           const start = baseH;
           for(let i=0; i<count; i++) {
               const h = (start + (i * 40)) % 360;
               safeAddColor(h, randomInt(80, 100), randomInt(40, 70));
           }
      }
  }

  else if (mode === 'modern-ui') {
      const brandH = (baseH + randomInt(0, 60)) % 360;
      // 1. Primary
      safeAddColor(brandH, randomInt(70, 90), randomInt(45, 60));
      // 2. Surface/Bg
      safeAddColor(brandH, 5, 96);
      // 3. Text/Dark
      safeAddColor(brandH, 10, 15);
      // 4. Secondary/Accent
      safeAddColor((brandH + 180) % 360, randomInt(60, 80), randomInt(50, 70));
      // 5. Muted/Border
      for(let i=4; i<count; i++) {
          safeAddColor(brandH, 5, randomInt(80, 90));
      }
  }

  else if (mode === 'retro-future') {
      // Y2K Chrome & Neon
      for(let i=0; i<count; i++) {
          if (chance(0.4)) { // Silver/Chrome
              safeAddColor(baseH, randomInt(0, 5), randomInt(75, 95));
          } else { // Acid brights
              const h = (baseH + i * 90) % 360;
              safeAddColor(h, randomInt(80, 100), randomInt(50, 70));
          }
      }
  }
  
  else if (mode === 'compound') {
      // Comp + Analogous
      const hues = [
          baseH, 
          (baseH + 180) % 360, 
          (baseH + 30) % 360, 
          (baseH + 210) % 360,
          (baseH + 150) % 360
      ];
      for(let i=0; i<count; i++) {
          safeAddColor(hues[i % hues.length] + randomInt(-10, 10), randomInt(vibe.sMin, vibe.sMax), randomInt(vibe.lMin, vibe.lMax));
      }
  }
  
  else if (mode === 'shades') {
      for(let i=0; i<count; i++) {
          safeAddColor(
              baseH + randomInt(-5, 5), 
              randomInt(10, 90), 
              randomInt(10, 90) 
          );
      }
  }

  else {
      // --- STANDARD MODES ---
      const hues: number[] = [];
      
      if (mode === 'monochromatic') {
           for(let i=0; i<count; i++) hues.push(baseH + randomInt(-10, 10));
      } else if (mode === 'analogous') {
           const spread = randomInt(30, 60);
           const start = baseH - ((count-1)*spread/2);
           for(let i=0; i<count; i++) hues.push(start + (i*spread));
      } else if (mode === 'triadic') {
           for(let i=0; i<count; i++) hues.push(baseH + (i*120) + randomInt(-15, 15));
      } else if (mode === 'tetradic') {
           const h2 = baseH + 180;
           const h3 = baseH + 90; // True square is 90
           const h4 = baseH + 270;
           const bases = [baseH, h2, h3, h4];
           for(let i=0; i<count; i++) hues.push(bases[i%4] + randomInt(-15, 15));
      } else if (mode === 'split-complementary') {
           const spread = randomInt(30, 50);
           const bases = [baseH, baseH+180-spread, baseH+180+spread];
           for(let i=0; i<count; i++) hues.push(bases[i%3] + randomInt(-10, 10));
      } else { // Complementary
           for(let i=0; i<count; i++) hues.push(baseH + ((i%2)*180) + randomInt(-10, 10));
      }

      if (mode === 'monochromatic') {
          const startL = 15;
          const endL = 95;
          const step = (endL - startL) / (count - 1 || 1);
          for(let i=0; i<count; i++) {
              safeAddColor(hues[i], clamp(baseS + randomInt(-10, 10), 0, 90), startL + (i*step));
          }
      } else {
          for (let i = 0; i < count; i++) {
              safeAddColor(hues[i], randomInt(vibe.sMin, vibe.sMax), randomInt(vibe.lMin, vibe.lMax));
          }
      }
  }

  // 3. Fallback filler if palette < count
  while(palette.length < count) {
      safeAddColor(randomInt(0, 360), randomInt(50, 90), randomInt(40, 60));
  }

  // 4. Shuffle
  // Almost always shuffle to avoid predictable gradients unless it's specific modes
  let result = palette.slice(0, count);
  
  if (mode !== 'monochromatic' && mode !== 'analogous') {
     for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
     }
  } else if (chance(0.5)) {
      // Sometimes shuffle mono/analogous too
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
     }
  }

  return result;
};