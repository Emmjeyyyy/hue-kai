import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  RefreshCw, Plus, Minus, Copy, Check,
  Move, Trash2, Undo2, Redo2, Lock, Unlock
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { CyberButton } from '../components/UI';
import { hexToRgb, rgbToHex } from '../utils/colorUtils';

// ─── Types ───────────────────────────────────────────────────────────────────

type GradientType = 'linear' | 'radial';

interface GradientStop {
  id: string;
  hex: string;
  position: number; // 0–100
}

interface GradientState {
  stops: GradientStop[];
  gradientType: GradientType;
  angle: number;
  radialShape: 'circle' | 'ellipse';
  radialPos: string;
}

// ─── Palette presets for auto-generation ─────────────────────────────────────

const GRADIENT_PALETTES = [
  { name: 'Aurora Borealis',  hues: [160, 190, 220, 260, 300], s: 80, lMin: 55, lMax: 80 },
  { name: 'Sunset Overdrive', hues: [0,  20,  40,  55,  70],   s: 90, lMin: 45, lMax: 70 },
  { name: 'Neon Abyss',       hues: [260, 290, 310, 180, 200], s: 95, lMin: 40, lMax: 65 },
  { name: 'Ocean Depth',      hues: [200, 210, 225, 240, 255], s: 75, lMin: 20, lMax: 65 },
  { name: 'Candy Pop',        hues: [330, 350, 10,  40,  70],  s: 85, lMin: 65, lMax: 88 },
  { name: 'Matte Ember',      hues: [10,  25,  40,  55],       s: 60, lMin: 30, lMax: 60 },
  { name: 'Holographic',      hues: [0, 60, 120, 180, 240, 300], s: 80, lMin: 55, lMax: 75 },
  { name: 'Cyberpunk',        hues: [280, 300, 180, 200],      s: 100, lMin: 45, lMax: 65 },
  { name: 'Forest Mist',      hues: [100, 120, 140, 160],      s: 50, lMin: 30, lMax: 60 },
  { name: 'Rose Gold',        hues: [345, 360, 20,  40],       s: 55, lMin: 55, lMax: 75 },
  { name: 'Deep Space Cyan',  hues: [245, 240, 200, 190],      s: 100, lMin: 5, lMax: 50 },
  { name: 'Vaporwave',        hues: [280, 290, 310, 320],      s: 90, lMin: 15, lMax: 60 },
  { name: 'Lava Flow',        hues: [0, 10, 30, 45],           s: 100, lMin: 10, lMax: 55 },
  { name: 'Emerald Void',     hues: [160, 150, 130, 100],      s: 95, lMin: 8, lMax: 55 },
  { name: 'Midnight Sun',     hues: [260, 300, 15, 45],        s: 90, lMin: 10, lMax: 65 },
  { name: 'Golden Hour',      hues: [15, 30, 45, 60],          s: 85, lMin: 40, lMax: 75 },
];

const LINEAR_PRESETS = [
  { name: 'Cyber Neon', angle: 135, stops: [{ hex: '#FF00FF', position: 0 }, { hex: '#00FFFF', position: 100 }] },
  { name: 'Abyssal Blue', angle: 135, stops: [{ hex: '#000000', position: 0 }, { hex: '#001F99', position: 50 }, { hex: '#0091FF', position: 100 }] },
  { name: 'Sunset Vibes', angle: 90, stops: [{ hex: '#FF5F6D', position: 0 }, { hex: '#FFC371', position: 100 }] },
  { name: 'Deep Matrix', angle: 180, stops: [{ hex: '#000000', position: 0 }, { hex: '#3E0A0A', position: 100 }] },
  { name: 'Purple Rain', angle: 135, stops: [{ hex: '#C850C0', position: 0 }, { hex: '#4158D0', position: 100 }] },
  { name: 'Deep Sea', angle: 90, stops: [{ hex: '#2E3192', position: 0 }, { hex: '#1BFFFF', position: 100 }] },
  { name: 'Neon Plasma', angle: 135, stops: [{ hex: '#0B0F19', position: 0 }, { hex: '#0033FF', position: 20 }, { hex: '#00FFFF', position: 40 }, { hex: '#CCFF00', position: 60 }, { hex: '#FFFF00', position: 80 }, { hex: '#FFFFFF', position: 100 }] },
  { name: 'Midnight Flare', angle: 135, stops: [{ hex: '#2A0845', position: 0 }, { hex: '#7B2CBF', position: 30 }, { hex: '#FF007F', position: 60 }, { hex: '#FF5E00', position: 85 }, { hex: '#FFD000', position: 100 }] },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return rgbToHex(r, g, b);
};

const generateStopsFromPalette = (count: number): GradientStop[] => {
  const n = Math.max(2, Math.min(count, 8));

  // ── Strategy selector: pick from 20 generation modes ─────────────────────
  const strategy = Math.floor(Math.random() * 20);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clamp  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const jitter = (base: number, range: number) => base + (Math.random() - 0.5) * 2 * range;
  const curve  = (t: number, midBias: number = 0): number => Math.pow(t, 1 + midBias * 0.6);

  const makeStop = (h: number, s: number, l: number, pos: number): GradientStop => ({
    id: uid(),
    hex: hslToHex(((h % 360) + 360) % 360, clamp(s, 0, 100), clamp(l, 2, 97)).toUpperCase(),
    position: Math.round(clamp(pos, 0, 100)),
  });

  // Non-uniform position spreader: organic, non-even stop placement
  const spreadPositions = (n: number, tightness = 60): number[] => {
    if (n <= 1) return [0];
    const positions = [0];
    for (let i = 1; i < n - 1; i++) {
      const even = (i / (n - 1)) * 100;
      const nudge = (Math.random() - 0.5) * (tightness / n);
      positions.push(clamp(even + nudge, positions[positions.length - 1] + 3, 97));
    }
    positions.push(100);
    return positions;
  };

  const positions = spreadPositions(n);
  const stops: GradientStop[] = [];

  if (strategy === 0) {
    // ── ANALOGOUS FLOW ──────────────────────────────────────────────────────
    const palette = GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)];
    const baseHue = palette.hues[Math.floor(Math.random() * palette.hues.length)];
    const hueSpan = jitter(55, 30);
    const darkStart = Math.random() > 0.5;
    const midBias = (Math.random() - 0.5) * 1.8;
    const baseSat = jitter(palette.s, 12);
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = baseHue + hueSpan * t + jitter(0, 6);
      const lRange = palette.lMax - palette.lMin;
      const l = jitter(palette.lMin + lRange * curve(darkStart ? t : 1 - t, midBias), 6);
      stops.push(makeStop(h, jitter(baseSat, 8), l, positions[i]));
    }

  } else if (strategy === 1) {
    // ── COMPLEMENTARY TENSION ───────────────────────────────────────────────
    const hA = Math.random() * 360;
    const hB = hA + 150 + Math.random() * 60;
    const sat = jitter(80, 15);
    const darkEdges = Math.random() > 0.4;
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const blend = (Math.sin((t - 0.5) * Math.PI) + 1) / 2;
      const h = hA + (hB - hA) * blend;
      const l = darkEdges
        ? jitter(20 + 55 * Math.sin(t * Math.PI), 8)
        : jitter(40 + 35 * t, 10);
      stops.push(makeStop(h, sat, l, positions[i]));
    }

  } else if (strategy === 2) {
    // ── TRIADIC BOUNCE ──────────────────────────────────────────────────────
    const hBase = Math.random() * 360;
    const triads = [hBase, hBase + 120, hBase + 240];
    const sat = jitter(85, 10);
    const lBase = jitter(50, 15);
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const triadIndex = t * 2;
      const lo = Math.floor(triadIndex) % 3;
      const hi = (lo + 1) % 3;
      const frac = triadIndex - Math.floor(triadIndex);
      const diff = ((triads[hi] - triads[lo] + 540) % 360) - 180;
      const hMixed = triads[lo] + diff * frac;
      const l = jitter(lBase + (Math.random() - 0.5) * 30, 8);
      stops.push(makeStop(hMixed, sat, l, positions[i]));
    }

  } else if (strategy === 3) {
    // ── DARK CINEMATIC ──────────────────────────────────────────────────────
    const accentHue = Math.random() * 360;
    const accentHue2 = accentHue + jitter(110, 40);
    const accentPos = new Set<number>();
    const numAccents = n >= 4 ? 1 + Math.floor(Math.random() * 2) : 1;
    while (accentPos.size < numAccents) accentPos.add(1 + Math.floor(Math.random() * (n - 2)));
    for (let i = 0; i < n; i++) {
      if (accentPos.has(i)) {
        stops.push(makeStop(Math.random() > 0.5 ? accentHue2 : accentHue, jitter(95, 5), jitter(58, 12), positions[i]));
      } else {
        stops.push(makeStop(jitter(accentHue, 30), jitter(40, 20), jitter(8, 6), positions[i]));
      }
    }

  } else if (strategy === 4) {
    // ── PASTEL AURORA ───────────────────────────────────────────────────────
    const baseHue = Math.random() * 360;
    const hueShift = jitter(80, 40);
    const sat = jitter(70, 15);
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = baseHue + hueShift * t + jitter(0, 8);
      const l = jitter(65 + 12 * Math.sin(t * Math.PI * 2), 8);
      stops.push(makeStop(h, sat, l, positions[i]));
    }

  } else if (strategy === 5) {
    // ── MONOCHROMATIC DEPTH ─────────────────────────────────────────────────
    const hue = Math.random() * 360;
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      // Saturation dips slightly in the darkest and brightest regions
      const s = jitter(60 + 30 * Math.sin(t * Math.PI), 10);
      // Lightness travels from near-black to luminous highlights
      const l = jitter(4 + 88 * t, 8);
      stops.push(makeStop(hue + jitter(0, 5), s, l, positions[i]));
    }

  } else if (strategy === 6) {
    // ── SPLIT COMPLEMENTARY ─────────────────────────────────────────────────
    const hDom = Math.random() * 360;
    const hA = hDom + 150;
    const hB = hDom - 150;
    // Randomly weight the two split hues
    const domWeight = jitter(0.55, 0.2); // dominant hue gets 55% ± 20%
    const splitPositions = spreadPositions(n, 40);
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = t < domWeight ? hDom : (Math.random() > 0.5 ? hA : hB);
      const s = jitter(78, 12);
      const l = jitter(25 + 45 * curve(t, -0.3), 8);
      stops.push(makeStop(h, s, l, splitPositions[i]));
    }

  } else if (strategy === 7) {
    // ── TETRADIC SPECTRUM ───────────────────────────────────────────────────
    const hBase = Math.random() * 360;
    const tetrads = [hBase, hBase + 90, hBase + 180, hBase + 270];
    // Randomly assign weights so 1-2 hues dominate
    const weights = tetrads.map(() => Math.random());
    const totalW = weights.reduce((a, b) => a + b, 0);
    const cumW = weights.map(((sum => (w: number) => (sum += w / totalW, sum))(0)));
    const sat = jitter(80, 12);
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const r = Math.random();
      const idx = cumW.findIndex(c => r <= c);
      const h = tetrads[idx >= 0 ? idx : 3];
      const l = jitter(30 + 40 * t, 10);
      stops.push(makeStop(h, sat, l, positions[i]));
    }

  } else if (strategy === 8) {
    // ── SUNSET BLEND ────────────────────────────────────────────────────────
    // Warm hues: orange → coral → pink → purple
    const startHue = jitter(25, 10);   // orange-ish
    const endHue   = jitter(300, 15);  // purple-ish
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = startHue + (endHue - startHue) * t;
      const s = jitter(88, 8);
      // Luminance falls off at the edges for atmospheric richness
      const l = jitter(30 + 35 * Math.sin(t * Math.PI), 8);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 9) {
    // ── OCEAN DEPTHS ────────────────────────────────────────────────────────
    const baseHue = jitter(200, 20); // deep navy/teal range
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      // Hue drifts from deep navy toward bright cyan
      const h = baseHue + 35 * t + jitter(0, 8);
      // Occasional aqua highlight punch at random spots
      const isHighlight = n >= 4 && i === Math.floor(n * 0.6) && Math.random() > 0.4;
      const s = isHighlight ? jitter(95, 5) : jitter(70, 15);
      const l = isHighlight ? jitter(70, 8) : jitter(5 + 55 * t, 8);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 10) {
    // ── NEON GLOW ───────────────────────────────────────────────────────────
    const neonHue  = Math.random() * 360;
    const neonHue2 = neonHue + jitter(90, 30);
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      // Bright neon concentrated in the middle, dark at the edges
      const brightness = Math.pow(Math.sin(t * Math.PI), 1.5);
      const h = neonHue + (neonHue2 - neonHue) * t;
      const s = jitter(95 - 20 * (1 - brightness), 5);
      const l = jitter(5 + 65 * brightness, 6);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 11) {
    // ── GLASS / FROSTED ─────────────────────────────────────────────────────
    const baseHue = jitter(210, 40); // cool hues: blue-gray, lavender
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = baseHue + jitter(0, 15);
      const s = jitter(15 + 10 * Math.sin(t * Math.PI), 8); // very low saturation
      const l = jitter(80 + 12 * t, 6); // very high lightness
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 12) {
    // ── METALLIC ────────────────────────────────────────────────────────────
    const metalHue = Math.random() > 0.5 ? jitter(45, 15) : jitter(200, 20); // gold or steel
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = metalHue + jitter(0, 8);
      const s = jitter(18, 10);
      // Repeated light-dark-light reflections
      const reflectionWave = 0.5 + 0.5 * Math.cos(t * Math.PI * (2 + Math.floor(Math.random() * 2)));
      const l = jitter(20 + 60 * reflectionWave, 6);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 13) {
    // ── PRISMATIC ───────────────────────────────────────────────────────────
    // Travels broadly across the hue wheel with smooth transitions
    const startHue = Math.random() * 360;
    const arcSpan  = jitter(240, 40); // wide arc
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = startHue + arcSpan * t;
      const s = jitter(85, 10);
      const l = jitter(55 + 10 * Math.sin(t * Math.PI * 3), 6);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 14) {
    // ── EARTHY NATURAL ──────────────────────────────────────────────────────
    // Muted greens, browns, ochres, terracotta, warm neutrals
    const earthHues = [25, 35, 48, 80, 100, 15, 10]; // brown, ochre, olive, green
    const earthPos = spreadPositions(n, 80); // more irregular spacing
    for (let i = 0; i < n; i++) {
      const h = earthHues[Math.floor(Math.random() * earthHues.length)] + jitter(0, 10);
      const s = jitter(35, 20); // low saturation — muted
      const l = jitter(28 + 30 * (i / Math.max(1, n - 1)), 10);
      stops.push(makeStop(h, s, l, earthPos[i]));
    }

  } else if (strategy === 15) {
    // ── DUOTONE ─────────────────────────────────────────────────────────────
    const hA = Math.random() * 360;
    const hB = hA + jitter(140, 40); // dominant pair
    // Randomly pick an interpolation curve style
    const curveType = Math.floor(Math.random() * 4);
    const blendCurve = (t: number) => {
      if (curveType === 0) return t;                                        // linear
      if (curveType === 1) return t * t;                                    // ease-in
      if (curveType === 2) return t * (2 - t);                             // ease-out
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;                // S-curve
    };
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const blend = blendCurve(t);
      const h = hA + (((hB - hA + 540) % 360) - 180) * blend;
      const s = jitter(80, 10);
      const l = jitter(15 + 65 * blend, 8);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 16) {
    // ── SPOTLIGHT ───────────────────────────────────────────────────────────
    const baseHue = Math.random() * 360;
    // Pick a random peak position for the bright spotlight
    const peak = 0.2 + Math.random() * 0.6;
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const dist = Math.abs(t - peak);
      const brightness = Math.exp(-dist * dist / 0.04); // gaussian falloff
      const s = jitter(75 + 15 * brightness, 8);
      const l = jitter(8 + 72 * brightness, 6);
      stops.push(makeStop(baseHue + jitter(0, 10), s, l, positions[i]));
    }

  } else if (strategy === 17) {
    // ── MIDNIGHT AURORA ─────────────────────────────────────────────────────
    const baseHue = jitter(240, 30); // deep blue/purple base
    const accentHue = baseHue + jitter(100, 30); // green/teal accent
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      // Luminance wave simulating slow-moving light bands
      const wave = 0.5 + 0.5 * Math.sin(t * Math.PI * 2.5 + Math.random() * 0.5);
      const isAccent = wave > 0.75;
      const h = isAccent ? accentHue : baseHue + jitter(0, 15);
      const s = jitter(isAccent ? 90 : 60, 10);
      const l = jitter(isAccent ? 45 + 20 * wave : 8 + 20 * wave, 5);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else if (strategy === 18) {
    // ── RETRO VAPORWAVE ─────────────────────────────────────────────────────
    // Purple → magenta → pink → cyan → blue
    const vaporHues = [270, 300, 330, 180, 220];
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const hIdx = t * (vaporHues.length - 1);
      const lo = Math.floor(hIdx);
      const hi = Math.min(lo + 1, vaporHues.length - 1);
      const h = vaporHues[lo] + (vaporHues[hi] - vaporHues[lo]) * (hIdx - lo);
      const s = jitter(90, 8);
      // Strong brightness contrast
      const l = jitter(20 + 40 * Math.sin(t * Math.PI * 1.5), 10);
      stops.push(makeStop(h, s, l, positions[i]));
    }

  } else {
    // ── PAPER / EDITORIAL ───────────────────────────────────────────────────
    // Warm off-whites, beige, warm grays with one subtle accent
    const paperHue = jitter(35, 20); // warm off-white base
    const accentHue = Math.random() * 360; // one restrained accent
    const accentIdx = 1 + Math.floor(Math.random() * Math.max(1, n - 2));
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const isAccent = i === accentIdx;
      const h = isAccent ? accentHue : paperHue + jitter(0, 10);
      const s = isAccent ? jitter(40, 15) : jitter(10, 6);
      const l = isAccent ? jitter(72, 8) : jitter(85 - 12 * t, 6);
      stops.push(makeStop(h, s, l, positions[i]));
    }
  }

  return stops;
};




// ─── CSS gradient string builder ─────────────────────────────────────────────

const buildGradientCSS = (
  stops: GradientStop[],
  type: GradientType,
  angle: number,
  radialShape: 'circle' | 'ellipse',
  radialPos: string,
): string => {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const colorStops = sorted.map(s => `${s.hex} ${s.position}%`).join(', ');
  switch (type) {
    case 'linear': return `linear-gradient(${angle}deg, ${colorStops})`;
    case 'radial': return `radial-gradient(${radialShape} at ${radialPos}, ${colorStops})`;
  }
};

const buildFormattedCSS = (
  stops: GradientStop[],
  type: GradientType,
  angle: number,
  radialShape: 'circle' | 'ellipse',
  radialPos: string,
): string => {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const colorStops = sorted.map(s => `  ${s.hex} ${s.position}%`).join(',\n');
  const prefix = type === 'linear' 
    ? `linear-gradient(\n  ${angle}deg,\n` 
    : `radial-gradient(\n  ${radialShape} at ${radialPos},\n`;
  
  return `background: ${prefix}${colorStops}\n);`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StopRow: React.FC<{
  stop: GradientStop;
  index: number;
  canDelete: boolean;
  onColorChange: (id: string, hex: string) => void;
  onPositionChange: (id: string, pos: number) => void;
  onDelete: (id: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}> = ({ stop, index, canDelete, onColorChange, onPositionChange, onDelete, onDragStart, onDragEnd }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(stop.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors group/row">
      <span className="font-mono text-[10px] text-white/30 w-4 text-center shrink-0">{index + 1}</span>

      {/* Color swatch + native color picker */}
      <div className="relative shrink-0">
        <div
          className="w-8 h-8 rounded-md border border-white/20 cursor-pointer shadow-inner"
          style={{ backgroundColor: stop.hex }}
          onClick={() => inputRef.current?.click()}
        />
        <input
          ref={inputRef}
          type="color"
          value={stop.hex}
          onChange={e => onColorChange(stop.id, e.target.value.toUpperCase())}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>

      {/* Hex display */}
      <button
        onClick={handleCopy}
        className="font-mono text-sm text-white/70 hover:text-chroma-yellow transition-colors tracking-wider flex items-center gap-1.5 shrink-0 w-24"
      >
        {copied
          ? <><Check size={12} className="text-green-400" /><span className="text-green-400 text-xs">COPIED</span></>
          : <><Copy size={11} className="opacity-50" />{stop.hex}</>
        }
      </button>

      {/* Position slider */}
      <div className="flex-1 flex items-center gap-2 min-w-[80px] mr-1">
        <input
          type="range"
          min={0}
          max={100}
          value={stop.position}
          onChange={e => onPositionChange(stop.id, Number(e.target.value))}
          onMouseDown={() => onDragStart?.()}
          onMouseUp={() => onDragEnd?.()}
          onTouchStart={() => onDragStart?.()}
          onTouchEnd={() => onDragEnd?.()}
          className="flex-1 h-1 accent-chroma-cyan cursor-pointer min-w-0"
        />
        <span className="font-mono text-[11px] text-white/40 w-7 text-right shrink-0">{stop.position}%</span>
      </div>

      {/* Delete */}
      <button
        onClick={() => canDelete && onDelete(stop.id)}
        disabled={!canDelete}
        className="text-white hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const TypeBtn: React.FC<{
  label: string; sub: string; active: boolean; onClick: () => void;
}> = ({ label, sub, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center py-2.5 px-2 rounded-lg border transition-all duration-200 ${
      active
        ? 'border-chroma-cyan/60 bg-chroma-cyan/10 text-chroma-cyan shadow-[0_0_10px_rgba(0,255,255,0.15)]'
        : 'border-white/10 bg-white/[0.02] text-white hover:border-white/30'
    }`}
  >
    <span className="font-mono font-bold text-xs tracking-widest">{label}</span>
    <span className="font-mono text-[9px] opacity-50 mt-0.5">{sub}</span>
  </button>
);

const AngleWheel: React.FC<{ angle: number; onChange: (a: number) => void; onDragStart?: () => void; isLocked?: boolean; onLockToggle?: () => void }> = ({ angle, onChange, onDragStart, isLocked, onLockToggle }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getAngleFromEvent = useCallback((e: MouseEvent | TouchEvent) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    let deg = Math.round((rad * 180) / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg % 360;
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      onChange(getAngleFromEvent(e));
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [onChange, getAngleFromEvent]);

  const rad = ((angle - 90) * Math.PI) / 180;
  const dotX = 50 + 38 * Math.cos(rad);
  const dotY = 50 + 38 * Math.sin(rad);

  return (
    <div className="flex items-center gap-3">
      <div
        ref={wheelRef}
        className="relative w-20 h-20 rounded-full border border-white/20 bg-white/5 cursor-pointer shrink-0 select-none"
        onMouseDown={(e) => { isDragging.current = true; onDragStart?.(); onChange(getAngleFromEvent(e as any)); }}
        onTouchStart={(e) => { isDragging.current = true; onDragStart?.(); onChange(getAngleFromEvent(e as any)); }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle cx={dotX} cy={dotY} r="5" fill="#00ffff" />
          <line x1="50" y1="50" x2={dotX} y2={dotY} stroke="#00ffff" strokeWidth="1.5" strokeOpacity="0.6" />
        </svg>
        {onLockToggle && (
          <button
            onClick={(e) => { e.stopPropagation(); onLockToggle(); }}
            onMouseDown={(e) => e.stopPropagation()}
            title={isLocked ? 'Unlock angle' : 'Lock angle'}
            className={`absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center rounded-full border transition-all z-10 ${
              isLocked
                ? 'border-chroma-cyan/70 bg-chroma-cyan/20 text-chroma-cyan shadow-[0_0_8px_rgba(0,255,255,0.3)]'
                : 'border-white/30 bg-[#111] text-white/60 hover:text-white hover:border-white/50'
            }`}
          >
            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
        )}
      </div>
      <div className="flex flex-col">
        <input
          type="number"
          min={0}
          max={359}
          value={angle}
          onFocus={() => onDragStart?.()}
          onChange={e => onChange(((Number(e.target.value) % 360) + 360) % 360)}
          className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 font-mono text-sm text-white text-center focus:outline-none focus:border-chroma-cyan/50"
        />
        <span className="text-[9px] font-mono text-white/30 mt-1 text-center">DEGREES</span>
      </div>
    </div>
  );
};

const DraggableStopMarker: React.FC<{
  stop: GradientStop;
  barRef: React.RefObject<HTMLDivElement>;
  onChange: (id: string, pos: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}> = ({ stop, barRef, onChange, onDragStart, onDragEnd }) => {
  const isDragging = useRef(false);
  
  // Use a ref for the latest callback to avoid re-binding event listeners
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !barRef.current) return;
      
      const rect = barRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      let pos = ((clientX - rect.left) / rect.width) * 100;
      pos = Math.max(0, Math.min(100, Math.round(pos)));
      
      onChangeRef.current(stop.id, pos);
    };
    
    const onUp = () => { 
      if (isDragging.current) {
        isDragging.current = false; 
        onDragEnd?.();
      }
    };
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [barRef, stop.id]); // Empty reactive dependencies — listeners are stable

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_6px_rgba(0,0,0,0.9)] cursor-grab active:cursor-grabbing hover:scale-125 transition-transform touch-none"
      style={{ left: `${stop.position}%`, backgroundColor: stop.hex }}
      onMouseDown={(e) => { 
        e.preventDefault(); 
        isDragging.current = true; 
        onDragStart?.();
      }}
      onTouchStart={(e) => { 
        // e.preventDefault(); // Sometimes needed, but can break scrolling on some mobile devices if on the parent. On the dot it's fine.
        isDragging.current = true; 
        onDragStart?.();
      }}
    />
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const GradientMaker: React.FC = () => {
  const STORAGE_KEY = 'hue-kai-gradient-state';
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };
  const savedState = getInitialState();

  const [generateStopCount, setGenerateStopCount] = useState(savedState?.generateStopCount ?? 4);
  const [lockStopCount, setLockStopCount] = useState(savedState?.lockStopCount ?? false);
  const [lockAngle, setLockAngle] = useState(savedState?.lockAngle ?? false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [stops, setStops] = useState<GradientStop[]>(() => savedState?.stops ?? generateStopsFromPalette(4));
  const [gradientType, setGradientType] = useState<GradientType>(savedState?.gradientType ?? 'linear');
  const [angle, setAngle] = useState(savedState?.angle ?? 135);
  const [radialShape, setRadialShape] = useState<'circle' | 'ellipse'>(savedState?.radialShape ?? 'circle');
  const [radialPos, setRadialPos] = useState(savedState?.radialPos ?? 'center');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      generateStopCount, lockStopCount, lockAngle, stops, gradientType, angle, radialShape, radialPos
    }));
  }, [generateStopCount, lockStopCount, lockAngle, stops, gradientType, angle, radialShape, radialPos]);
  const [copied, setCopied] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [displayStops, setDisplayStops] = useState<GradientStop[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevGradientRef = useRef<string>('');
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [past, setPast] = useState<GradientState[]>([]);
  const [future, setFuture] = useState<GradientState[]>([]);
  const stateRef = useRef({ stops, gradientType, angle, radialShape, radialPos });
  stateRef.current = { stops, gradientType, angle, radialShape, radialPos };

  const saveHistory = useCallback(() => {
    setPast(prev => [...prev, stateRef.current]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setPast(prev => {
      if (prev.length === 0) return prev;
      const newPast = [...prev];
      const lastState = newPast.pop()!;
      setFuture(f => [stateRef.current, ...f]);
      
      setStops(lastState.stops);
      setGradientType(lastState.gradientType);
      setAngle(lastState.angle);
      setRadialShape(lastState.radialShape);
      setRadialPos(lastState.radialPos);
      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      const newFuture = [...prev];
      const nextState = newFuture.shift()!;
      setPast(p => [...p, stateRef.current]);
      
      setStops(nextState.stops);
      setGradientType(nextState.gradientType);
      setAngle(nextState.angle);
      setRadialShape(nextState.radialShape);
      setRadialPos(nextState.radialPos);
      return newFuture;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  // Defer list sorting while dragging so rows don't jump around instantly
  useEffect(() => {
    if (!isDraggingNode) {
      setDisplayStops([...stops].sort((a, b) => a.position - b.position));
    } else {
      setDisplayStops(prev => prev.map(p => {
        const live = stops.find(s => s.id === p.id);
        return live ? live : p;
      }));
    }
  }, [stops, isDraggingNode]);

  const gradientCSS = buildGradientCSS(stops, gradientType, angle, radialShape, radialPos);
  const formattedCSS = buildFormattedCSS(stops, gradientType, angle, radialShape, radialPos);

  const regenerate = useCallback(() => {
    // Capture old gradient for crossfade
    prevGradientRef.current = buildGradientCSS(
      stateRef.current.stops, stateRef.current.gradientType,
      stateRef.current.angle, stateRef.current.radialShape, stateRef.current.radialPos
    );
    // Trigger fade-out of old, then swap in new
    setIsTransitioning(true);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => setIsTransitioning(false), 500);

    // If stop count is unlocked, pick a random count between 2 and 8
    const count = lockStopCount ? generateStopCount : 2 + Math.floor(Math.random() * 7);
    if (!lockStopCount) setGenerateStopCount(count);
    setStops(generateStopsFromPalette(count));
    // If angle is unlocked, randomize to one of the 8 standard angles
    if (!lockAngle) {
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      setAngle(angles[Math.floor(Math.random() * angles.length)]);
    }
  }, [generateStopCount, lockStopCount, lockAngle]);

  // Space bar → always regenerate, blur any focused button first
  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body) active.blur();
        e.preventDefault();
        if (!e.repeat) {
          setIsSpacePressed(true);
          regenerate();
        }
      }
    };
    const handleSpaceUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleSpace);
    window.addEventListener('keyup', handleSpaceUp);
    return () => {
      window.removeEventListener('keydown', handleSpace);
      window.removeEventListener('keyup', handleSpaceUp);
    };
  }, [regenerate]);

  const addStop = useCallback(() => {
    if (stops.length >= 8) return;
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    let maxGap = 0, insertPos = 50, insertHex = '#808080';
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        insertPos = Math.round((sorted[i].position + sorted[i + 1].position) / 2);
        const { r: r1, g: g1, b: b1 } = hexToRgb(sorted[i].hex);
        const { r: r2, g: g2, b: b2 } = hexToRgb(sorted[i + 1].hex);
        insertHex = rgbToHex(Math.round((r1+r2)/2), Math.round((g1+g2)/2), Math.round((b1+b2)/2)).toUpperCase();
      }
    }
    setStops(prev => [...prev, { id: uid(), hex: insertHex, position: insertPos }]);
  }, [stops]);

  const removeStop = useCallback((id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateColor = useCallback((id: string, hex: string) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, hex } : s));
  }, []);

  const updatePosition = useCallback((id: string, pos: number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, position: pos } : s));
  }, []);

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(formattedCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [formattedCSS]);

  const copyHexList = useCallback(() => {
    const hexList = [...stops].sort((a, b) => a.position - b.position).map(s => s.hex).join(', ');
    navigator.clipboard.writeText(hexList);
  }, [stops]);


  const linearBarCSS = buildGradientCSS(stops, 'linear', 90, radialShape, radialPos);

  return (

    <Layout>
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">

        {/* ── Main Two-Column Layout ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

          {/* ── LEFT: Fixed Controls Panel ───────────────────────────── */}
          {/* Width is locked — never changes regardless of gradient type or stop count */}
          <div
            className="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-black/50 backdrop-blur-md"
            style={{ minHeight: 0 }}
          >

            {/* Panel header */}
            <div className="shrink-0 px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-mono text-xs text-white tracking-widest uppercase">Gradient</span>
              <span className="font-mono text-[9px] text-white/20">グラデーション</span>
            </div>

            {/* Scrollable controls — all content lives inside this div */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-5 min-h-0">


              {/* ── Gradient Type ─────────────────────────────────────── */}
              <section>
                <label className="block font-mono text-[10px] text-white tracking-widest uppercase mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  <TypeBtn label="LINEAR"  sub="リニア"    active={gradientType === 'linear'} onClick={() => { saveHistory(); setGradientType('linear'); }} />
                  <TypeBtn label="RADIAL"  sub="ラジアル"  active={gradientType === 'radial'} onClick={() => { saveHistory(); setGradientType('radial'); }} />
                </div>
              </section>

              {/* ── Linear Presets — shown only for linear ──────────── */}
              {gradientType === 'linear' && (
                <section>
                  <label className="block font-mono text-[10px] text-white tracking-widest uppercase mb-2">
                    Linear Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LINEAR_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          saveHistory();
                          setAngle(preset.angle);
                          setStops(preset.stops.map(s => ({ ...s, id: uid() })));
                        }}
                        className="group relative h-10 rounded overflow-hidden border border-white/10 hover:border-white transition-colors shadow-lg"
                      >
                        <div 
                          className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ background: `linear-gradient(${preset.angle}deg, ${preset.stops.map(s => `${s.hex} ${s.position}%`).join(', ')})` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                          <span className="font-mono text-[9px] text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,1)] tracking-widest uppercase">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Angle control (linear only) — hidden for radial ───── */}
              {/* Using visibility:hidden keeps layout stable; the section space is always reserved */}
              <section style={{ visibility: gradientType === 'radial' ? 'hidden' : 'visible', height: gradientType === 'radial' ? 0 : 'auto', overflow: 'hidden', marginTop: gradientType === 'radial' ? 0 : undefined }}>
                <div className="flex items-center mb-3">
                  <label className="font-mono text-[10px] text-white tracking-widest uppercase">
                    Direction
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  {/* Preset degree buttons — 4 columns × 2 rows */}
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {([0, 45, 90, 135, 180, 225, 270, 315] as const).map(a => (
                      <button
                        key={a}
                        onClick={() => { saveHistory(); setAngle(a); }}
                        className={`px-1 py-1 rounded font-mono text-[9px] border transition-all text-center ${
                          angle === a
                            ? 'border-chroma-cyan/60 bg-chroma-cyan/10 text-chroma-cyan'
                            : 'border-white/10 bg-white/[0.02] text-white hover:border-white/30'
                        }`}
                      >
                        {a}°
                      </button>
                    ))}
                  </div>
                  {/* Volume knob (AngleWheel) on the right, lock icon inside wheel */}
                  <AngleWheel
                    angle={angle}
                    onChange={setAngle}
                    onDragStart={saveHistory}
                    isLocked={lockAngle}
                    onLockToggle={() => setLockAngle(prev => !prev)}
                  />
                </div>
              </section>

              {/* ── Radial Options — shown only for radial ──────────── */}
              {gradientType === 'radial' && (
                <section>
                  <label className="block font-mono text-[10px] text-white tracking-widest uppercase mb-2">
                    Radial Options
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="font-mono text-[10px] text-white/30 uppercase block mb-1.5">Shape</span>
                      <div className="flex gap-2">
                        {(['ellipse', 'circle'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => { saveHistory(); setRadialShape(s); }}
                            className={`flex-1 py-1.5 rounded font-mono text-[11px] border transition-all uppercase tracking-wide ${
                              radialShape === s
                                ? 'border-chroma-cyan/60 bg-chroma-cyan/10 text-chroma-cyan'
                                : 'border-white/10 bg-white/[0.02] text-white hover:border-white/30'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-white/30 uppercase block mb-1.5">Position</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['center','top','bottom','left','right','top left','top right','bottom left','bottom right'].map(p => (
                          <button
                            key={p}
                            onClick={() => { saveHistory(); setRadialPos(p); }}
                            className={`px-2 py-1 rounded font-mono text-[10px] border transition-all ${
                              radialPos === p
                                ? 'border-chroma-cyan/60 bg-chroma-cyan/10 text-chroma-cyan'
                                : 'border-white/10 bg-white/[0.02] text-white hover:border-white/30'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── Color Stops ───────────────────────────────────────── */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-[10px] text-white tracking-widest uppercase">
                    Color Stops
                  </label>
                  <button
                    onClick={copyHexList}
                    className="font-mono text-[9px] text-white hover:text-chroma-cyan transition-colors flex items-center gap-1"
                  >
                    <Copy size={10} /> HEX LIST
                  </button>
                </div>
                <div className="space-y-1.5">
                  {displayStops.map((stop, i) => (
                    <StopRow
                      key={stop.id}
                      stop={stop}
                      index={i}
                      canDelete={stops.length > 2}
                      onColorChange={updateColor}
                      onPositionChange={updatePosition}
                      onDelete={removeStop}
                      onDragStart={() => { saveHistory(); setIsDraggingNode(true); }}
                      onDragEnd={() => setIsDraggingNode(false)}
                    />
                  ))}
                </div>
                {stops.length < 8 && (
                  <button
                    onClick={addStop}
                    className="mt-2 w-full py-2 rounded-lg border border-dashed border-white/40 hover:border-white/80 text-white hover:text-white font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={12} /> Add Stop
                  </button>
                )}
              </section>

              {/* ── Generated CSS ─────────────────────────────────────── */}
              <section>
                <label className="block font-mono text-[10px] text-white tracking-widest uppercase mb-2">
                  Generated CSS
                </label>
                <div className="w-full shrink-0 border border-white/10 rounded-lg bg-black/60 p-4 flex items-start gap-3 relative group">
                  <pre className="flex-1 font-mono text-sm text-chroma-cyan/80 whitespace-pre overflow-x-auto min-w-0 select-text custom-scrollbar pb-1 leading-relaxed">
{formattedCSS}
                  </pre>
                  <button onClick={copyCSS} title="Copy CSS" className="absolute top-3 right-3 p-1.5 bg-white/5 hover:bg-white/10 rounded text-white/30 hover:text-chroma-cyan transition-colors shrink-0">
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </section>

            </div>
          </div>

          {/* ── RIGHT: Gradient Preview (16:9 — 1920×1080) ───────────── */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-chroma-black p-4 gap-3 min-h-0">

            <div className="relative w-full shrink min-h-0" style={{ aspectRatio: '16 / 9', maxHeight: 'calc(100% - 120px)' }}>
              {/* Previous gradient — fades out during transition */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-black/50"
                style={{
                  background: prevGradientRef.current || gradientCSS,
                  opacity: isTransitioning ? 1 : 0,
                  transition: isTransitioning ? 'none' : 'opacity 0.5s ease-in-out',
                  pointerEvents: 'none',
                }}
              />
              {/* Current gradient — always visible beneath */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{ background: gradientCSS }}
              />
            </div>

            {/* Interactive Gradient Bar */}
            <div className="w-full shrink-0 bg-black rounded-lg border border-white/10 px-6 py-5 flex items-center">
              <div className="relative h-4 w-full" ref={barRef}>
                {/* Previous bar — fades out during transition */}
                <div
                  className="absolute inset-y-1 left-0 right-0 rounded-full"
                  style={{
                    background: prevGradientRef.current ? `linear-gradient(90deg, ${[...stateRef.current.stops].sort((a,b)=>a.position-b.position).map(s=>`${s.hex} ${s.position}%`).join(', ')})` : linearBarCSS,
                    opacity: isTransitioning ? 1 : 0,
                    transition: isTransitioning ? 'none' : 'opacity 0.5s ease-in-out',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  className="absolute inset-y-1 left-0 right-0 rounded-full shadow-inner border border-black ring-1 ring-black/50 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                  style={{ background: linearBarCSS }}
                />
                {displayStops.map(stop => (
                  <DraggableStopMarker
                    key={stop.id}
                    stop={stop}
                    barRef={barRef}
                    onChange={updatePosition}
                    onDragStart={() => setIsDraggingNode(true)}
                    onDragEnd={() => setIsDraggingNode(false)}
                  />
                ))}
              </div>
            </div>

            {/* ── Main Actions (Generate & Stops Count) ── */}
            <div className="flex items-center justify-center gap-6 w-full shrink-0">
              <CyberButton onClick={regenerate} pressed={isSpacePressed} className="w-[280px] flex justify-center -translate-y-1">
                <RefreshCw size={16} />
                <span>GENERATE</span>
              </CyberButton>
              
              <div className="flex items-center gap-2 md:gap-3">
                <CyberButton
                  onClick={() => { setGenerateStopCount(prev => Math.max(2, prev - 1)); (document.activeElement as HTMLElement)?.blur(); }}
                  disabled={generateStopCount <= 2}
                  className="w-8 h-8 p-0 flex items-center justify-center rounded-full -translate-y-[3px]"
                  variant="dark"
                >
                  <Minus size={14} className="text-white/70" />
                </CyberButton>
                <div className="relative inline-flex items-center justify-center w-6">
                  <span className="absolute select-none font-mono font-bold text-lg text-center bg-[linear-gradient(90deg,#0B0F19,#0033FF,#00FFFF,#CCFF00,#FFFF00,#FFFFFF,#0B0F19)] bg-[length:600%_auto] animate-gradient-flow bg-clip-text text-transparent blur-[3px] opacity-40">
                    {generateStopCount}
                  </span>
                  <span className="relative select-none font-mono font-bold text-lg text-center bg-[linear-gradient(90deg,#0B0F19,#0033FF,#00FFFF,#CCFF00,#FFFF00,#FFFFFF,#0B0F19)] bg-[length:600%_auto] animate-gradient-flow bg-clip-text text-transparent">
                    {generateStopCount}
                  </span>
                </div>
                <CyberButton
                  onClick={() => { setGenerateStopCount(prev => Math.min(8, prev + 1)); (document.activeElement as HTMLElement)?.blur(); }}
                  disabled={generateStopCount >= 8}
                  className="w-8 h-8 p-0 flex items-center justify-center rounded-full -translate-y-[3px]"
                  variant="dark"
                >
                  <Plus size={14} className="text-white/70" />
                </CyberButton>
                {/* Lock toggle for stop count */}
                <button
                  onClick={(e) => { setLockStopCount(prev => !prev); (e.currentTarget as HTMLElement).blur(); }}
                  title={lockStopCount ? 'Unlock stops (randomizes on generate)' : 'Lock stops (keeps count on generate)'}
                  className={`-translate-y-[3px] w-7 h-7 flex items-center justify-center rounded-full border transition-all ${
                    lockStopCount
                      ? 'border-chroma-cyan/60 bg-chroma-cyan/10 text-chroma-cyan shadow-[0_0_6px_rgba(0,255,255,0.3)]'
                      : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'
                  }`}
                >
                  {lockStopCount ? <Lock size={11} /> : <Unlock size={11} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
