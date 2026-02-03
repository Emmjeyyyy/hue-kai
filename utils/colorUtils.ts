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
  const usedHexes = new Set<string>();

  // Helper to add unique color with retry logic
  const addColor = (h: number, s: number, l: number) => {
    // Normalize parameters
    h = h % 360;
    if (h < 0) h += 360;
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));

    let rgb = hslToRgb(h, s, l);
    let hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    // Retry logic to avoid duplicates
    let attempts = 0;
    while (usedHexes.has(hex) && attempts < 20) {
      // Shift L first, then S to find a unique slot
      if (attempts < 10) {
         l = (l + 8) % 100;
         if (l < 5) l = 10; // Avoid getting stuck at 0
      } else {
         s = (s + 15) % 100;
      }
      
      rgb = hslToRgb(h, s, l);
      hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      attempts++;
    }
    
    // If still duplicate (very rare), just accept it or fallback to random
    if (usedHexes.has(hex)) {
       hex = generateRandomColor();
    }

    usedHexes.add(hex);
    palette.push(createColorData(hex));
  };
  
  // 1. RANDOM MODE
  // Allows full range of neutrals and colors
  if (mode === 'random') {
      while (palette.length < count) {
          const h = Math.floor(Math.random() * 360);
          let s: number, l: number;
          
          const type = Math.random();
          if (type < 0.15) { 
              // Dark Neutral (Black-ish)
              s = Math.random() * 20;
              l = Math.random() * 12 + 3;
          } else if (type < 0.3) {
              // Light Neutral (White-ish)
              s = Math.random() * 20;
              l = Math.random() * 12 + 85;
          } else if (type < 0.45) {
              // Muted / Greyish
              s = Math.random() * 30;
              l = Math.random() * 60 + 20;
          } else {
              // Vibrant
              s = Math.random() * 50 + 50;
              l = Math.random() * 60 + 20;
          }
          
          addColor(h, s, l);
      }
      return palette;
  }

  // SPECIAL MODERN MODES
  if (mode === 'cyberpunk') {
      // Dark Base, Light Neutral, High-Sat Neon Accents
      
      let baseH = Math.floor(Math.random() * 360);
      if (baseColor) {
         const rgb = hexToRgb(baseColor);
         const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
         baseH = hsl.h;
      }

      // 1. Deep Dark Base (often slightly tinted)
      addColor(baseH, 30, 6); 
      
      // 2. Bright Neutral Anchor (Silver/White)
      addColor(baseH, 10, 92);

      // 3. Primary Neon
      // If we have a base color input, try to use it as the neon anchor if it's vibrant, otherwise shift
      let neonH = baseH;
      if (baseColor) {
          const l = hexToRgb(baseColor) ? rgbToHsl(hexToRgb(baseColor).r, hexToRgb(baseColor).g, hexToRgb(baseColor).b).l : 50;
          if (l < 30 || l > 80) neonH = (baseH + 180) % 360; 
      }
      addColor(neonH, 100, 60);

      // 4. Secondary Neon (Triadic or Offset)
      addColor((neonH + 120) % 360, 90, 60);

      // 5. Tension/Clash Accent
      addColor((neonH + 300) % 360, 100, 55);

      while(palette.length < count) addColor(Math.random()*360, 100, 50);
      return palette.slice(0, count);
  }

  if (mode === 'modern-ui') {
      // High contrast: Light BG, Dark Text, Brand, Secondary, Muted
      let brandH = Math.floor(Math.random() * 360);
      if (baseColor) {
         const rgb = hexToRgb(baseColor);
         brandH = rgbToHsl(rgb.r, rgb.g, rgb.b).h;
      }

      // 1. Surface (White/Light Grey)
      addColor(220, 5, 96);
      
      // 2. Text/Ink (Dark Grey/Blue-Black)
      addColor(220, 15, 12);
      
      // 3. Primary Brand Color (Vibrant but legible)
      addColor(brandH, 85, 50);
      
      // 4. Secondary Accent (Warm/Cool Balance)
      // If brand is cool (green/blue/purple ~ 90-300), pick warm secondary.
      const isCool = brandH > 90 && brandH < 300;
      let secH = isCool ? (Math.random() * 80 + 330) % 360 : (Math.random() * 80 + 170) % 360;
      addColor(secH, 80, 60);

      // 5. Muted/Functional Support
      addColor(brandH, 15, 90); // Brand tint

      while(palette.length < count) addColor(Math.random()*360, 50, 50);
      return palette.slice(0, count);
  }

  if (mode === 'retro-future') {
      // Controlled Clashes & High Tension
      let mainH = Math.floor(Math.random() * 360);
      if (baseColor) {
         const rgb = hexToRgb(baseColor);
         mainH = rgbToHsl(rgb.r, rgb.g, rgb.b).h;
      }

      // 1. Main Anchor
      addColor(mainH, 90, 50);

      // 2. Immediate Clash (Analogous pushed too far)
      addColor((mainH + 40) % 360, 100, 60);

      // 3. Complementary Contrast
      addColor((mainH + 180) % 360, 90, 50);

      // 4. Split Tension
      addColor((mainH + 210) % 360, 100, 55);

      // 5. Deep Tone for grounding
      addColor((mainH + 280) % 360, 80, 20);

      while(palette.length < count) addColor(Math.random()*360, 80, 50);
      return palette.slice(0, count);
  }

  // 2. STRUCTURED MODES (Classical)
  let baseHue: number, baseSat: number, baseLit: number;

  if (baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    baseHue = hsl.h;
    baseSat = hsl.s;
    baseLit = hsl.l;
  } else {
    baseHue = Math.floor(Math.random() * 360);
    baseSat = Math.floor(Math.random() * 40) + 60; // 60-100 (Bias towards color)
    baseLit = Math.floor(Math.random() * 40) + 30; // 30-70 (Bias towards mid-tones)
  }

  const hues: number[] = [];
  
  switch (mode) {
    case 'monochromatic':
        for (let i = 0; i < count; i++) hues.push(baseHue);
        break;
    case 'analogous':
        const spread = 30;
        const start = baseHue - (Math.floor((count - 1) / 2) * spread);
        for (let i = 0; i < count; i++) {
           hues.push((start + i * spread + 360) % 360);
        }
        break;
    case 'triadic':
        for (let i = 0; i < count; i++) {
           hues.push((baseHue + i * 120) % 360);
        }
        break;
    case 'tetradic':
        const t1 = baseHue;
        const t2 = (baseHue + 180) % 360;
        const t3 = (baseHue + 60) % 360;
        const t4 = (baseHue + 240) % 360;
        const sequence = [t1, t2, t3, t4];
        for (let i = 0; i < count; i++) {
           hues.push(sequence[i % 4]);
        }
        break;
    case 'split-complementary':
        const scBases = [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
        for (let i = 0; i < count; i++) {
             hues.push(scBases[i % 3]);
        }
        break;
    case 'complementary':
    default:
        for (let i = 0; i < count; i++) {
           hues.push((baseHue + (i % 2) * 180) % 360);
        }
        break;
  }

  // Determine Strategy for Neutrals (for non-monochromatic modes)
  const useNeutralTemplate = (!baseColor && Math.random() < 0.6) || (baseColor && count >= 5);

  // Monochromatic Strategy Setup
  let monoStartL = 0;
  let monoStepL = 0;
  let monoFixedS = 0;
  
  if (mode === 'monochromatic') {
      // 20% chance to allow dark/neutral/muted monochromatic palettes
      // 80% chance to enforce vibrant, bright, colorful palettes
      const isMoodPalette = !baseColor && Math.random() < 0.2;
      
      if (isMoodPalette) {
          // "Mood" Mode: Can be dark, desaturated, or high contrast darks
          monoFixedS = Math.random() * 60; // 0-60% Saturation (Neutral to Muted)
          const range = 40 + Math.random() * 40; 
          monoStartL = 5 + Math.random() * 20; // Start very dark
          monoStepL = range / Math.max(1, count - 1);
      } else {
          // "Vibrant" Mode (Default): Bright, colorful, clear
          monoFixedS = baseColor ? baseSat : (65 + Math.random() * 35); // High Saturation
          
          // Lightness range restricted to "pretty" zone (e.g. 25% to 92%)
          const minL = 25;
          const maxL = 92;
          const range = 50 + Math.random() * 20; // Spread of 50-70%
          
          // Randomize start within safe bounds
          const maxStart = maxL - range;
          monoStartL = minL + Math.random() * (maxStart - minL);
          monoStepL = range / Math.max(1, count - 1);
      }
  }

  for (let i = 0; i < count; i++) {
    let h = hues[i];
    let s = baseSat;
    let l = baseLit;

    if (mode === 'monochromatic') {
        l = monoStartL + (i * monoStepL);
        s = monoFixedS;
        
        // Physics tweak: Extremely light colors often perceived with slightly less saturation in UI design
        if (l > 85) s *= 0.85; 
    } else {
        // Standard Structured Mode Logic
        // Apply "Templates" if enabled and count is sufficient
        if (useNeutralTemplate && count >= 4) {
             const modIndex = i % 5;
             if (modIndex === 2) { 
                 // Light Neutral (Tint)
                 l = 92 + (Math.random() * 6); // 92-98
                 s = Math.min(s, Math.random() * 15); 
             } else if (modIndex === 3) {
                 // Dark Neutral (Shade)
                 l = 8 + (Math.random() * 12); // 8-20
                 s = Math.min(s, Math.random() * 20);
             } else if (modIndex === 4) {
                 // Vibrant Pop
                 s = Math.min(100, s + 20);
                 l = Math.max(40, Math.min(70, l));
             } else {
                 // Standard variation
                 s = Math.max(0, Math.min(100, s + (Math.random() * 20 - 10)));
                 l = Math.max(10, Math.min(90, l + (Math.random() * 20 - 10)));
             }
        } else {
             // Fallback or Smaller Palettes
             // Just slightly relax bounds
             l = Math.max(10, Math.min(95, l));
             s = Math.max(0, Math.min(100, s));
        }
    }

    addColor(h, s, l);
  }

  return palette;
};