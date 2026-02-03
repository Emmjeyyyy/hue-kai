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

// Base Hue Rotation to prevent consecutive palettes of same color
let lastGlobalHue = Math.random() * 360;

const registerColor = (hex: string) => {
    globalHistory.add(hex);
    if (globalHistory.size > HISTORY_LIMIT) {
        const first = globalHistory.values().next().value;
        if (first) globalHistory.delete(first);
    }
};

const isRecentlyUsed = (hex: string) => globalHistory.has(hex);

// Vibe Definitions
interface Vibe {
  name: string;
  sMin: number; sMax: number;
  lMin: number; lMax: number;
}

const getWeightedVibe = (): Vibe => {
  const r = Math.random();
  // Adjusted probabilities for variety
  if (r < 0.35) return { name: 'vivid', sMin: 65, sMax: 100, lMin: 45, lMax: 60 };
  if (r < 0.55) return { name: 'bright', sMin: 50, sMax: 90, lMin: 75, lMax: 95 };
  if (r < 0.70) return { name: 'pastel', sMin: 30, sMax: 70, lMin: 80, lMax: 96 };
  if (r < 0.85) return { name: 'deep', sMin: 50, sMax: 90, lMin: 15, lMax: 35 };
  if (r < 0.95) return { name: 'balanced', sMin: 30, sMax: 85, lMin: 25, lMax: 80 };
  if (r < 0.99) return { name: 'neon', sMin: 95, sMax: 100, lMin: 50, lMax: 60 };
  return { name: 'muted', sMin: 5, sMax: 25, lMin: 40, lMax: 60 }; // Rare muted
};

// --- GENERATION ENGINE ---

export const generatePalette = (mode: PaletteMode, count: number = 5, baseColor?: string): ColorData[] => {
  const palette: ColorData[] = [];
  const usedHexes = new Set<string>();

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
    // Jump at least 60 degrees from last generation's base to ensure freshness
    const jump = randomInt(60, 240);
    baseH = (lastGlobalHue + jump) % 360;
    lastGlobalHue = baseH;

    baseS = randomInt(vibe.sMin, vibe.sMax);
    baseL = randomInt(vibe.lMin, vibe.lMax);
  }

  // 2. Helper to Add Colors
  const addColor = (h: number, s: number, l: number) => {
    h = h % 360;
    if (h < 0) h += 360;
    s = clamp(s, 0, 100);
    l = clamp(l, 0, 100);

    let rgb = hslToRgb(h, s, l);
    let hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Conflict Resolution & Anti-Repetition
    let attempts = 0;
    // We try to find a color that hasn't been used in this palette AND hasn't been generated recently
    while ((usedHexes.has(hex) || isRecentlyUsed(hex)) && attempts < 15) {
        h = (h + randomInt(10, 40)) % 360; // Shift hue
        l = clamp(l + randomInt(-10, 10), 5, 95); // Shift light
        
        rgb = hslToRgb(h, s, l);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        attempts++;
    }
    
    // Hard fallback if we're stuck in a loop
    if (usedHexes.has(hex)) hex = generateRandomColor();

    usedHexes.add(hex);
    registerColor(hex);
    palette.push(createColorData(hex));
  };

  // --- SPECIALIZED RECIPES ---

  // A. Neutral Contrast Scheme (The requested feature)
  const generateNeutralContrastScheme = () => {
       const isWarmNeutral = chance(0.5);
       // 1. Black/Dark Base
       addColor(randomInt(200, 260), randomInt(5, 20), randomInt(5, 12));
       // 2. Warm Saturated Accent
       addColor(randomInt(10, 40), randomInt(85, 100), randomInt(50, 65));
       // 3. Cool Light Accent
       addColor(randomInt(180, 220), randomInt(20, 50), randomInt(80, 95));
       // 4. Soft Neutral
       addColor(isWarmNeutral ? randomInt(320, 360) : randomInt(200, 220), randomInt(5, 20), randomInt(92, 98));
       // 5. Mid Gray
       addColor(randomInt(200, 240), randomInt(5, 15), randomInt(40, 55));
       
       // Fill
       while(palette.length < count) addColor(baseH, randomInt(50, 80), randomInt(40, 60));
  };

  // --- MODE EXECUTION ---

  if (mode === 'random') {
      // "True RNG" Strategy Selection
      // We pick a generation recipe to ensure internal consistency but external variety.
      
      const strategies = [
          'golden-ratio', 
          'analogous-walk', 
          'triadic-scatter', 
          'neutral-pop', 
          'pastel-dream', 
          'high-contrast-clash',
          'monochromatic-texture'
      ];
      
      // 10% Chance for the specific Neutral Contrast Scheme
      if (chance(0.1)) {
          generateNeutralContrastScheme();
      } else {
          const strategy = strategies[Math.floor(Math.random() * strategies.length)];
          
          let currentH = baseH;

          switch(strategy) {
              case 'golden-ratio': // Perfect mathematical distribution
                  for(let i=0; i<count; i++) {
                      addColor(
                          (baseH + (i * 0.618033988749895 * 360)) % 360, 
                          randomInt(vibe.sMin, vibe.sMax), 
                          randomInt(vibe.lMin, vibe.lMax)
                      );
                  }
                  break;

              case 'analogous-walk': // Smooth gradient walk
                  const step = randomInt(20, 45) * (chance(0.5) ? 1 : -1);
                  for(let i=0; i<count; i++) {
                      addColor(
                          currentH, 
                          clamp(baseS + randomInt(-10, 10), 30, 100), 
                          clamp(baseL + randomInt(-15, 15), 20, 90)
                      );
                      currentH += step;
                  }
                  break;

              case 'triadic-scatter': // 3 main points with jitter
                  for(let i=0; i<count; i++) {
                      const offset = (Math.floor(i % 3) * 120) + randomInt(-20, 20);
                      addColor(baseH + offset, randomInt(60, 95), randomInt(30, 80));
                  }
                  break;

              case 'neutral-pop': // Mostly greys with 1-2 pops
                  const popIndices = [randomInt(0, count-1), randomInt(0, count-1)];
                  for(let i=0; i<count; i++) {
                      if (popIndices.includes(i)) {
                          addColor(randomInt(0, 360), randomInt(80, 100), randomInt(50, 70));
                      } else {
                          addColor(baseH + randomInt(-30, 30), randomInt(0, 15), randomInt(20, 90));
                      }
                  }
                  break;
                  
              case 'pastel-dream':
                  for(let i=0; i<count; i++) {
                      addColor(
                          randomInt(0, 360), // Any hue
                          randomInt(30, 70), // Mid sat
                          randomInt(85, 96)  // High light
                      );
                  }
                  break;
                  
              case 'high-contrast-clash':
                  for(let i=0; i<count; i++) {
                      // Flip between very dark and very light
                      const l = chance(0.5) ? randomInt(10, 25) : randomInt(80, 95);
                      addColor(currentH, randomInt(70, 100), l);
                      currentH += randomInt(90, 180); // Big jumps
                  }
                  break;

              default: // Monochromatic Texture
                  for(let i=0; i<count; i++) {
                      addColor(
                          baseH + randomInt(-10, 10),
                          randomInt(20, 90),
                          randomInt(10, 90) // Full lightness range
                      );
                  }
          }
      }
  }

  else if (mode === 'cyberpunk') {
      // V2: Randomized sub-palettes
      const subTheme = Math.random();
      
      if (subTheme < 0.33) { // Classic Neon
          addColor(randomInt(220, 280), randomInt(30, 50), randomInt(5, 12)); // Dark Cool Base
          for(let i=1; i<count; i++) {
              // High Sat neon accents
              addColor(randomInt(0, 360), 100, 60); 
          }
      } else if (subTheme < 0.66) { // Matrix/Hacker
           addColor(0, 0, 5); // Black
           for(let i=1; i<count; i++) {
               const greenH = 120 + randomInt(-40, 40);
               addColor(greenH, randomInt(80, 100), randomInt(30, 80));
           }
      } else { // Synthwave Sunset
           // Start Purple, End Yellow/Orange
           const start = 260 + randomInt(-20, 20);
           const end = 40 + randomInt(-10, 10) + 360;
           const step = (end - start) / (count - 1 || 1);
           for(let i=0; i<count; i++) {
               addColor((start + (i*step)) % 360, randomInt(80, 100), randomInt(40, 70));
           }
      }
  }

  else if (mode === 'modern-ui') {
      // V2: Randomized Brand Color
      // 30% Dark Mode, 30% Light Mode, 30% Colorful, 10% Neutral Contrast
      const sub = Math.random();
      const brandH = randomInt(0, 360); // Randomized brand hue!

      if (sub < 0.3) { // Dark
          // Slate/Zinc background
          addColor(215, 20, 12); 
          addColor(215, 15, 22);
          // Accents
          for(let i=2; i<count; i++) addColor(brandH, randomInt(70, 90), randomInt(60, 75));
      } else if (sub < 0.6) { // Light
          addColor(0, 0, 98); 
          addColor(brandH, 5, 95); // Tinted surface
          addColor(0, 0, 20); // Text
          for(let i=3; i<count; i++) addColor(brandH, randomInt(80, 100), randomInt(50, 60));
      } else if (sub < 0.9) { // Brand Heavy
           for(let i=0; i<count; i++) {
               addColor(brandH + (i * 20), randomInt(70, 90), randomInt(45, 65));
           }
      } else {
           generateNeutralContrastScheme();
      }
  }

  else if (mode === 'retro-future') {
      // 90s Memphis or Y2K Chrome
      if (chance(0.5)) { // Memphis Pattern
          const primaries = [0, 50, 120, 180, 280, 320]; // Red, Yellow, Green, Cyan, Purple, Pink
          for(let i=0; i<count; i++) {
              if (chance(0.15)) addColor(0,0,10); // Black squiggle
              else if (chance(0.15)) addColor(0,0,95); // White background
              else {
                  const h = primaries[randomInt(0, primaries.length-1)] + randomInt(-10,10);
                  addColor(h, randomInt(70, 90), randomInt(50, 70));
              }
          }
      } else { // Y2K Chrome (Silvers + Iridescent)
          for(let i=0; i<count; i++) {
              if (chance(0.6)) { // Silver/Grey
                  addColor(210, randomInt(5, 20), randomInt(70, 95));
              } else { // Holographic Accent
                  addColor(randomInt(0, 360), randomInt(50, 80), randomInt(70, 90));
              }
          }
      }
  }
  
  else if (mode === 'compound') {
      // Mix of complementary and analogous
      // Hues: Base, Base+180 (Comp), Base+30 (Analogous), Base+210 (Comp of Analogous)
      const hues = [
          baseH, 
          (baseH + 180) % 360, 
          (baseH + 30) % 360, 
          (baseH + 210) % 360,
          (baseH + 150) % 360
      ];
      for(let i=0; i<count; i++) {
          addColor(hues[i % hues.length] + randomInt(-10, 10), randomInt(vibe.sMin, vibe.sMax), randomInt(vibe.lMin, vibe.lMax));
      }
  }
  
  else if (mode === 'shades') {
      // Locked Hue, Varied Lightness/Saturation
      for(let i=0; i<count; i++) {
          addColor(
              baseH + randomInt(-5, 5), 
              randomInt(20, 100), 
              randomInt(10, 95) // Force full range for better palette
          );
      }
  }

  else {
      // --- STANDARD MODES ---
      // (Monochromatic, Analogous, Triadic, Tetradic, Split-Comp, Complementary)
      // Logic mostly unchanged, but using updated 'addColor' which respects history
      
      const hues: number[] = [];
      
      if (mode === 'monochromatic') {
           for(let i=0; i<count; i++) hues.push(baseH + randomInt(-5, 5));
      } else if (mode === 'analogous') {
           const spread = randomInt(25, 50);
           const start = baseH - ((count-1)*spread/2);
           for(let i=0; i<count; i++) hues.push(start + (i*spread));
      } else if (mode === 'triadic') {
           for(let i=0; i<count; i++) hues.push(baseH + (i*120) + randomInt(-10, 10));
      } else if (mode === 'tetradic') {
           const h2 = baseH + 180;
           const h3 = baseH + 60;
           const h4 = baseH + 240;
           const bases = [baseH, h2, h3, h4];
           for(let i=0; i<count; i++) hues.push(bases[i%4] + randomInt(-10, 10));
      } else if (mode === 'split-complementary') {
           const spread = randomInt(20, 40);
           const bases = [baseH, baseH+180-spread, baseH+180+spread];
           for(let i=0; i<count; i++) hues.push(bases[i%3] + randomInt(-5, 5));
      } else { // Complementary
           for(let i=0; i<count; i++) hues.push(baseH + ((i%2)*180) + randomInt(-5, 5));
      }

      // Special Lightness spread for Monochromatic
      if (mode === 'monochromatic') {
          const startL = randomInt(10, 30);
          const endL = randomInt(80, 95);
          const step = (endL - startL) / (count - 1 || 1);
          for(let i=0; i<count; i++) {
              addColor(hues[i], clamp(baseS + randomInt(-20, 20), 0, 100), startL + (i*step));
          }
      } else {
          for (let i = 0; i < count; i++) {
              addColor(hues[i], randomInt(vibe.sMin, vibe.sMax), randomInt(vibe.lMin, vibe.lMax));
          }
      }
  }

  // 3. Shuffle (Randomize order to break gradients unless specifically desired)
  let result = palette.slice(0, count);
  
  // Some modes look better sorted, some shuffled. 
  // We apply a random chance to shuffle even sorted modes for variety.
  if (chance(0.7)) {
     for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
     }
  }

  return result;
};