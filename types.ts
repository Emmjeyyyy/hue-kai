export interface ColorData {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  locked: boolean;
  name?: string;
  source?: { rx: number; ry: number };
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export type PaletteMode = 
  | 'analogous' 
  | 'monochromatic' 
  | 'triadic' 
  | 'complementary' 
  | 'split-complementary' 
  | 'tetradic' 
  | 'compound' 
  | 'shades' 
  | 'random' 
  | 'cyberpunk' 
  | 'modern-ui' 
  | 'retro-future'
  | 'warm-earth'
  | 'hyper-warm'
  | 'obsidian-highlight'
  | 'industrial-concrete'
  | 'smooth-gradient'
  | 'iridescent-flow'
  | 'neon-maximalist'
  | 'noir-accent'
  | 'autumn-retro'
  | 'vaporwave'
  | 'synthwave'
  | 'aurora'
  | 'neo-brutalist'
  | 'glass-neon'
  | 'liquid-metal'
  | 'forest-canopy'
  | 'ocean-depths'
  | 'royal-gold'
  | 'colorblind-safe'
  | 'high-contrast'
  | 'deep-space'
  | 'holographic'
  | 'midnight'
  | 'pastel-dream'
  | 'nature-landscape';
