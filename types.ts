export interface ColorData {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  locked: boolean;
  name?: string;
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

export type PaletteMode = 'analogous' | 'monochromatic' | 'triadic' | 'complementary' | 'split-complementary' | 'tetradic' | 'random' | 'cyberpunk' | 'modern-ui' | 'retro-future';