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

// Generation Logic
export const generatePalette = (mode: PaletteMode, count: number = 5, baseColor?: string): ColorData[] => {
  const palette: ColorData[] = [];
  const usedHexes = new Set<string>();

  // Add color with retry mechanism for uniqueness
  const addColor = (h: number, s: number, l: number) => {
    // Normalize inputs
    h = h % 360;
    if (h < 0) h += 360;
    s = clamp(s, 0, 100);
    l = clamp(l, 0, 100);

    let rgb = hslToRgb(h, s, l);
    let hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Collision handling: Jitter values if duplicate found
    let attempts = 0;
    while (usedHexes.has(hex) && attempts < 20) {
        h = (h + randomInt(5, 20)) % 360;
        l = clamp(l + randomInt(-10, 10), 5, 95);
        s = clamp(s + randomInt(-10, 10), 5, 95);
        
        rgb = hslToRgb(h, s, l);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        attempts++;
    }

    // Fallback if still stuck
    if (usedHexes.has(hex)) {
        hex = generateRandomColor();
    }

    usedHexes.add(hex);
    palette.push(createColorData(hex));
  };

  // 1. Determine Base Parameters
  let baseH: number, baseS: number, baseL: number;
  if (baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    baseH = hsl.h;
    baseS = hsl.s;
    baseL = hsl.l;
  } else {
    baseH = randomInt(0, 360);
    baseS = randomInt(40, 95);
    baseL = randomInt(30, 70);
  }

  // 2. Mode Handling

  if (mode === 'random') {
    for(let i=0; i<count; i++) {
        // Generate completely random but viable colors
        addColor(randomInt(0, 360), randomInt(10, 100), randomInt(15, 90));
    }
    return palette;
  }

  if (mode === 'cyberpunk') {
    // 1. Deep Dark Base (Background)
    addColor(baseH + randomInt(-10, 10), randomInt(20, 40), randomInt(5, 12));
    
    // 2. Bright Tech Neutral (Silver/White)
    addColor((baseH + 180) % 360, randomInt(0, 15), randomInt(85, 95));

    // 3. Primary Neon (High Sat, Mid-Light)
    addColor(baseH, randomInt(90, 100), randomInt(50, 65));

    // 4. Secondary Neon (Shifted)
    const shift = Math.random() > 0.5 ? 60 : 120; // Triadic or Analogous shift
    addColor((baseH + shift + randomInt(-10, 10)) % 360, randomInt(85, 100), randomInt(50, 70));

    // 5. Tension/Clash Accent
    const clash = Math.random() > 0.5 ? 300 : 150;
    addColor((baseH + clash + randomInt(-10, 10)) % 360, randomInt(90, 100), randomInt(50, 60));

    // Fill remaining
    while (palette.length < count) {
        addColor(randomInt(0, 360), randomInt(80, 100), randomInt(45, 75));
    }
    return palette.slice(0, count);
  }

  if (mode === 'modern-ui') {
      // 1. Surface (White/Grey)
      addColor(220 + randomInt(-10, 10), randomInt(2, 10), randomInt(95, 98));
      
      // 2. Text/Ink (Dark Blue/Grey)
      addColor(220 + randomInt(-10, 10), randomInt(15, 30), randomInt(10, 18));
      
      // 3. Primary Brand
      addColor(baseH, randomInt(70, 95), randomInt(50, 60));
      
      // 4. Secondary/Highlight
      const isCool = baseH > 90 && baseH < 300;
      const secH = isCool ? (baseH + randomInt(30, 60)) % 360 : (baseH + 180) % 360;
      addColor(secH, randomInt(70, 90), randomInt(55, 65));
      
      // 5. Muted Support
      addColor(baseH, randomInt(10, 30), randomInt(88, 94)); // Light brand tint

      while(palette.length < count) {
        addColor(randomInt(0, 360), randomInt(40, 60), randomInt(40, 60));
      }
      return palette.slice(0, count);
  }

  if (mode === 'retro-future') {
      // Synthwave: Purple, Pink, Teal, Orange, Chrome
      // 1. Deep Space Base
      const bgH = randomInt(230, 290);
      addColor(bgH, randomInt(60, 80), randomInt(10, 20));
      
      // 2. Laser Pink/Magenta
      addColor(randomInt(290, 340), randomInt(90, 100), randomInt(50, 65));
      
      // 3. Cyber Cyan
      addColor(randomInt(160, 200), randomInt(90, 100), randomInt(50, 65));
      
      // 4. Grid Orange/Yellow
      addColor(randomInt(20, 50), randomInt(90, 100), randomInt(55, 70));
      
      // 5. Chrome Reflection
      addColor(bgH, randomInt(5, 15), randomInt(75, 90));

      while(palette.length < count) {
         addColor(randomInt(0, 360), 100, 60);
      }
      return palette.slice(0, count);
  }

  // 3. Structured Modes (Monochromatic, Analogous, etc.)
  
  const hues: number[] = [];

  // Determine Hues based on mode
  if (mode === 'monochromatic') {
      for(let i=0; i<count; i++) hues.push(baseH + randomInt(-5, 5)); // Slight hue jitter for depth
  } else if (mode === 'analogous') {
      const spread = randomInt(30, 60);
      const start = baseH - (spread * (count - 1) / 2);
      for(let i=0; i<count; i++) hues.push(start + (i * spread) + randomInt(-5, 5));
  } else if (mode === 'triadic') {
      for(let i=0; i<count; i++) hues.push(baseH + (i * 120) + randomInt(-10, 10));
  } else if (mode === 'tetradic') {
      const h2 = (baseH + 180) % 360;
      const h3 = (baseH + 60) % 360;
      const h4 = (baseH + 240) % 360;
      const sequence = [baseH, h2, h3, h4];
      for(let i=0; i<count; i++) hues.push(sequence[i % 4] + randomInt(-10, 10));
  } else if (mode === 'split-complementary') {
      const spread = randomInt(20, 45);
      const bases = [baseH, baseH + 180 - spread, baseH + 180 + spread];
      for(let i=0; i<count; i++) hues.push(bases[i % 3] + randomInt(-5, 5));
  } else {
      // Complementary default
      for(let i=0; i<count; i++) hues.push(baseH + ((i % 2) * 180) + randomInt(-10, 10));
  }

  // Determine Saturation and Lightness
  if (mode === 'monochromatic') {
      // Linear gradient for lightness, but randomized start/end
      const startL = randomInt(10, 25);
      const endL = randomInt(85, 95);
      const step = (endL - startL) / Math.max(1, count - 1);
      
      for(let i=0; i<count; i++) {
          const l = startL + (i * step);
          // Curve saturation: High L usually means lower S in monochromatic scales for better visuals
          const satMod = l > 80 ? 0.7 : 1;
          const s = clamp(baseS * satMod + randomInt(-10, 10), 0, 100);
          addColor(hues[i], s, l);
      }
  } else {
      // Structured variation for other modes
      // We apply a probabilistic "template" to ensure contrast if palette is large enough
      
      for (let i = 0; i < count; i++) {
          let h = hues[i];
          let s = baseS + randomInt(-15, 15);
          let l = baseL + randomInt(-15, 15);

          // If we have enough colors, force some contrast roles
          if (count >= 4) {
              const role = i % 5; 
              // Roles based on index relative to count (simple distribution)
              // 0,1: Main colors (retain base properties)
              // 2: Light/Tint
              // 3: Dark/Shade
              // 4: Vibrant/Accent
              
              if (role === 2) {
                  l = randomInt(85, 96);
                  s = randomInt(5, 40);
              } else if (role === 3) {
                  l = randomInt(10, 25);
                  s = randomInt(20, 50);
              } else if (role === 4) {
                  s = randomInt(90, 100);
                  l = randomInt(50, 65);
              }
          }

          addColor(h, s, l);
      }
  }

  return palette;
};
