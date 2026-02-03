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

// Internal Logic Helpers
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomRange(min, max));
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const chance = (prob: number) => Math.random() < prob;

// Vibe / Atmosphere Definitions
interface Vibe {
  name: string;
  sMin: number; sMax: number;
  lMin: number; lMax: number;
}

const getWeightedVibe = (): Vibe => {
  const r = Math.random();
  // 45% Vivid/Rich: High saturation, mid lightness (Best for general design)
  if (r < 0.45) return { name: 'vivid', sMin: 65, sMax: 100, lMin: 40, lMax: 65 };
  
  // 25% Bright/Clean: Mid-High saturation, High lightness (Modern App feel)
  if (r < 0.70) return { name: 'bright', sMin: 50, sMax: 90, lMin: 70, lMax: 95 };
  
  // 15% Deep/Strong: Saturated but dark (Sophisticated)
  if (r < 0.85) return { name: 'deep', sMin: 50, sMax: 90, lMin: 15, lMax: 35 };
  
  // 10% Dynamic/Balanced: Full range but biased against grey
  if (r < 0.95) return { name: 'balanced', sMin: 35, sMax: 95, lMin: 20, lMax: 85 };
  
  // 4% Neon: Max saturation
  if (r < 0.99) return { name: 'neon', sMin: 95, sMax: 100, lMin: 50, lMax: 60 };
  
  // 1% Muted/Desaturated: The only place where low saturation is allowed
  return { name: 'muted', sMin: 0, sMax: 20, lMin: 30, lMax: 70 };
};

// Generation Logic
export const generatePalette = (mode: PaletteMode, count: number = 5, baseColor?: string): ColorData[] => {
  const palette: ColorData[] = [];
  const usedHexes = new Set<string>();

  // Determine Vibe for this generation
  const vibe = getWeightedVibe();

  const addColor = (h: number, s: number, l: number) => {
    h = h % 360;
    if (h < 0) h += 360;
    s = clamp(s, 0, 100);
    l = clamp(l, 0, 100);

    let rgb = hslToRgb(h, s, l);
    let hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Uniqueness Check with Jitter
    let attempts = 0;
    while (usedHexes.has(hex) && attempts < 20) {
        h = (h + randomInt(10, 30)) % 360;
        l = clamp(l + randomInt(-5, 5), 5, 95);
        rgb = hslToRgb(h, s, l);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        attempts++;
    }
    
    // Fallback
    if (usedHexes.has(hex)) hex = generateRandomColor();

    usedHexes.add(hex);
    palette.push(createColorData(hex));
  };

  // Specialized Generator for Neutral-Anchored Contrast Scheme
  const generateNeutralContrastScheme = () => {
       // 1. Black / Near-black Base (Cool-tinted)
       addColor(randomInt(210, 240), randomInt(5, 20), randomInt(5, 12));
       
       // 2. Warm Saturated Accent (Burnt Tangerine / Red-Orange)
       addColor(randomInt(10, 40), randomInt(85, 100), randomInt(50, 65));

       // 3. Light Cool Accent (Frosted Blue / Cyan)
       addColor(randomInt(180, 210), randomInt(20, 50), randomInt(80, 95));

       // 4. Soft Light Neutral (Off-white / Lavender blush)
       // Can be slightly warm or cool
       if (chance(0.5)) {
           addColor(randomInt(320, 360), randomInt(5, 20), randomInt(92, 98)); // Warm/Pinkish
       } else {
           addColor(randomInt(200, 220), randomInt(5, 20), randomInt(92, 98)); // Cool/Bluish
       }

       // 5. Mid Neutral Gray
       addColor(randomInt(210, 240), randomInt(5, 15), randomInt(40, 55));
       
       // Fill remainder with variations of the warm accent or dark base if count > 5
       while (palette.length < count) {
           if (chance(0.5)) {
               // Dark variant
               addColor(randomInt(210, 240), randomInt(5, 20), randomInt(10, 25));
           } else {
               // Accent variant
               addColor(randomInt(10, 40), randomInt(70, 90), randomInt(40, 70));
           }
       }
  };

  // Base Parameter Setup
  let baseH: number, baseS: number, baseL: number;
  
  if (baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    baseH = hsl.h;
    baseS = hsl.s; 
    baseL = hsl.l;
  } else {
    baseH = randomInt(0, 360);
    // Use Vibe constraints for base
    baseS = randomInt(vibe.sMin, vibe.sMax);
    baseL = randomInt(vibe.lMin, vibe.lMax);
  }

  // --- MODE HANDLERS ---

  if (mode === 'random') {
      // 10% Chance to trigger the Neutral Contrast Scheme for variety
      if (Math.random() < 0.1) {
          generateNeutralContrastScheme();
      } else {
          // Coolors-style Procedural Generation (Saturated & Balanced)
          // Instead of pure random, we walk the color wheel with constraints.
          
          const method = Math.random();
          let hueStep = 0;
          
          if (method < 0.5) {
             // Analogous / Soft shift (Most pleasing for random palettes)
             // Step 20-50 degrees
             hueStep = randomInt(20, 50) * (Math.random() > 0.5 ? 1 : -1);
          } else if (method < 0.8) {
             // Triadic / Wider spacing
             hueStep = randomInt(90, 150);
          } else {
             // Tighter Monochromatic-ish shift
             hueStep = randomInt(5, 15) * (Math.random() > 0.5 ? 1 : -1);
          }

          let currentH = baseH;
          
          for(let i=0; i<count; i++) {
              // Hue: Walk with jitter
              let h = (currentH + randomInt(-5, 5)) % 360;
              currentH += hueStep;

              // Saturation:
              // Use vibe range but apply local jitter.
              // CRITICAL: Enforce minimum saturation unless explicitly muted.
              let s = clamp(randomInt(vibe.sMin, vibe.sMax) + randomInt(-10, 10), 0, 100);
              if (vibe.name !== 'muted') {
                  s = Math.max(30, s); // Floor saturation to avoid greyish mud
              }

              // Lightness:
              // Add variance to ensure adjacent colors have some contrast
              let l = clamp(randomInt(vibe.lMin, vibe.lMax) + randomInt(-15, 15), 0, 100);
              
              // Lightness Guard: Prevent washed out neon colors
              if (s > 90 && l > 85 && vibe.name !== 'neon') l = 85;

              addColor(h, s, l);
          }
      }
  }

  else if (mode === 'cyberpunk') {
      // Sub-themes for variety
      const subTheme = Math.random();
      
      if (subTheme < 0.4) { // Classic Dark Neon
          addColor(baseH + randomInt(-20, 20), randomInt(20, 40), randomInt(5, 12)); // Dark Bg
          // Neons
          for(let i=1; i<count; i++) {
              addColor(randomInt(0, 360), randomInt(90, 100), randomInt(50, 65));
          }
      } else if (subTheme < 0.7) { // Vaporwave (Pastel Neon)
           addColor(randomInt(240, 300), randomInt(40, 60), randomInt(10, 20)); // Deep Purple Base (more sat)
           for(let i=1; i<count; i++) {
               // Pinks, Cyans, Purples
               const h = Math.random() > 0.5 ? randomInt(300, 340) : randomInt(160, 200);
               addColor(h, randomInt(70, 95), randomInt(70, 85));
           }
      } else { // High Tech Light (Mirror's Edge style)
           addColor(0, 0, randomInt(90, 98)); // White/Light Grey
           addColor(randomInt(0, 360), 0, randomInt(80, 90)); // Light Grey
           addColor(0, 100, 50); // Pure Red
           addColor(45, 100, 50); // Pure Yellow
           addColor(200, 100, 50); // Pure Blue
           // Fill rest randomly with high saturation
           while(palette.length < count) addColor(randomInt(0, 360), randomInt(80, 100), randomInt(40, 60));
      }
  }

  else if (mode === 'modern-ui') {
      const subTheme = Math.random();

      if (subTheme < 0.25) { // Dark Mode
          addColor(220, 15, 10); // Dark Bg
          addColor(220, 10, 20); // Surface
          // Accents - Force saturation
          const accentH = baseH;
          for(let i=2; i<count; i++) addColor(accentH + (i*10), randomInt(75, 95), randomInt(60, 75));
      } else if (subTheme < 0.50) { // Light Mode (Classic)
          addColor(220, 5, 98); // White
          addColor(220, 10, 90); // Off-white
          addColor(220, 20, 20); // Text
          // Brand colors
          while(palette.length < count) addColor(baseH, randomInt(75, 95), randomInt(50, 60));
      } else if (subTheme < 0.70) { // Colorful / Brand Heavy
           // Analogous shift
           for(let i=0; i<count; i++) {
               addColor(baseH + (i * 30), randomInt(75, 95), randomInt(50, 65));
           }
      } else {
           // Neutral Anchored Accent Contrast
           generateNeutralContrastScheme();
      }
  }

  else if (mode === 'retro-future') {
      const subTheme = Math.random();
      
      if (subTheme < 0.5) { // Synthwave Sunset
          // Purple to Orange gradient
          const startH = 260;
          const endH = 30 + 360; // 390
          const step = (endH - startH) / count;
          for(let i=0; i<count; i++) {
              addColor((startH + (i*step)) % 360, randomInt(75, 100), randomInt(45, 65));
          }
      } else { // 90s Arcade
          // Primary colors + Black
          const primaries = [0, 120, 240, 60, 300];
          for(let i=0; i<count; i++) {
              if (chance(0.2)) {
                   addColor(0, 0, 10); // Black
              } else {
                   const h = primaries[i % primaries.length] + randomInt(-10, 10);
                   addColor(h, randomInt(85, 100), randomInt(45, 60));
              }
          }
      }
  }

  else {
      // --- STRUCTURED MODES (Mono, Analogous, etc.) ---
      // We apply the VIBE to the S and L channels, but strictly follow Hue rules.

      const hues: number[] = [];

      // Define Hues
      if (mode === 'monochromatic') {
           for(let i=0; i<count; i++) hues.push(baseH + randomInt(-10, 10)); // Slight hue shift for richness
      } else if (mode === 'analogous') {
           const spread = randomInt(30, 50);
           const start = baseH - ((count-1)*spread/2);
           for(let i=0; i<count; i++) hues.push(start + (i*spread));
      } else if (mode === 'triadic') {
           for(let i=0; i<count; i++) hues.push(baseH + (i*120) + randomInt(-5, 5));
      } else if (mode === 'tetradic') {
           const h2 = baseH + 180;
           const h3 = baseH + 60;
           const h4 = baseH + 240;
           const bases = [baseH, h2, h3, h4];
           for(let i=0; i<count; i++) hues.push(bases[i%4] + randomInt(-5, 5));
      } else if (mode === 'split-complementary') {
           const spread = 30;
           const bases = [baseH, baseH+180-spread, baseH+180+spread];
           for(let i=0; i<count; i++) hues.push(bases[i%3]);
      } else { // Complementary
           for(let i=0; i<count; i++) hues.push(baseH + ((i%2)*180));
      }

      // Apply S/L based on Vibe
      if (mode === 'monochromatic') {
          // Special handling for mono to ensure contrast
          let startL = vibe.lMin;
          let endL = vibe.lMax;
          
          if (endL - startL < 20) {
              startL = Math.max(0, startL - 20);
              endL = Math.min(100, endL + 20);
          }

          const step = (endL - startL) / (count - 1 || 1);
          
          for(let i=0; i<count; i++) {
              const l = startL + (i * step);
              const s = clamp(baseS + randomInt(-10, 10), vibe.sMin, vibe.sMax);
              addColor(hues[i], s, l);
          }
      } else {
          // Other structured modes
          for (let i = 0; i < count; i++) {
              const h = hues[i];
              let s = clamp(randomInt(vibe.sMin, vibe.sMax), 0, 100);
              // Ensure minimum saturation for structured modes unless muted
              if (vibe.name !== 'muted') s = Math.max(30, s);
              
              const l = clamp(randomInt(vibe.lMin, vibe.lMax), 0, 100);
              addColor(h, s, l);
          }
      }
  }

  // 4. Arrangement / Shuffle Logic
  let result = palette.slice(0, count);

  const getLightness = (hex: string) => {
      const rgb = hexToRgb(hex);
      return rgbToHsl(rgb.r, rgb.g, rgb.b).l;
  };

  const sortStrategy = Math.random();

  if (mode === 'monochromatic') {
      if (chance(0.8)) {
          result.sort((a, b) => getLightness(a.hex) - getLightness(b.hex));
          if (chance(0.5)) result.reverse();
      } else {
          for (let i = result.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [result[i], result[j]] = [result[j], result[i]];
          }
      }
  } else {
      // For the Neutral Contrast Scheme, sometimes we want to preserve the generation order 
      // (Base -> Accents) because it looks designed.
      // But generally, shuffling is good.
      if (sortStrategy < 0.6) {
          // Shuffle
          for (let i = result.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [result[i], result[j]] = [result[j], result[i]];
          }
      } else if (sortStrategy < 0.8) {
          // Sort Lightness
          result.sort((a, b) => getLightness(a.hex) - getLightness(b.hex));
          if (chance(0.5)) result.reverse();
      }
  }

  return result;
};