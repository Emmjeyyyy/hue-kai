import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ColorCard } from '../components/UI';
import { hslToRgb, rgbToHex, createColorData, hexToRgb, rgbToHsl } from '../utils/colorUtils';
import { ColorData, PaletteMode } from '../types';

export const ColorWheel: React.FC = () => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [mode, setMode] = useState<PaletteMode>('complementary');
  const [palette, setPalette] = useState<ColorData[]>([]);
  const [manualHex, setManualHex] = useState('#FF0000');
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update palette when base parameters change using Strict Harmony Logic
  useEffect(() => {
    // Helper to generate ColorData from HSL
    const createFromHsl = (h: number, s: number, l: number): ColorData => {
        // Normalize
        h = h % 360;
        if (h < 0) h += 360;
        s = Math.max(0, Math.min(100, s));
        l = Math.max(0, Math.min(100, l));

        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        return createColorData(hex);
    };

    // Update manual hex input to match current wheel state
    // We do this here to ensure the input always reflects the actual generated color (snapping to HSL grid)
    const currentRgb = hslToRgb(hue, saturation, lightness);
    const currentHex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b).toUpperCase();
    setManualHex(currentHex);

    const newPalette: ColorData[] = [];

    // 1. Always place the Base Color (Selection) first
    newPalette.push(createFromHsl(hue, saturation, lightness));

    // 2. Generate remaining colors based on strict harmony rules with fixed counts and order
    switch (mode) {
        case 'monochromatic':
            // Exact 2 colors: Base + Variation
            // Fixed Logic: Use a moderate lightness shift (approx 15%) instead of a large jump (30%).
            // This ensures #2F17E8 (L=50) produces something close to #5945ED (L=60) rather than #B0A7F1 (L=80).
            // We also preserve saturation strictly to maintain vibrancy.
            
            let monoL = lightness > 75 ? lightness - 15 : lightness + 15;
            
            // Clamp lightness to ensure valid range (avoid sticking to pure black/white unless input is extreme)
            monoL = Math.max(5, Math.min(95, monoL));

            newPalette.push(createFromHsl(hue, saturation, monoL));
            break;

        case 'complementary':
            // Exact 2 colors: Base + Opposite
            newPalette.push(createFromHsl(hue + 180, saturation, lightness));
            break;

        case 'analogous':
            // Exact 3 colors: Base + 2 Neighbors
            newPalette.push(createFromHsl(hue + 30, saturation, lightness));
            newPalette.push(createFromHsl(hue + 60, saturation, lightness));
            break;

        case 'triadic':
            // Exact 3 colors: Base + 120 + 240
            newPalette.push(createFromHsl(hue + 120, saturation, lightness));
            newPalette.push(createFromHsl(hue + 240, saturation, lightness));
            break;

        case 'tetradic':
            // Exact 4 colors: Square Scheme to match requested output
            // Base, Base+90, Base+180, Base+270
            newPalette.push(createFromHsl(hue + 90, saturation, lightness));
            newPalette.push(createFromHsl(hue + 180, saturation, lightness));
            newPalette.push(createFromHsl(hue + 270, saturation, lightness));
            break;

        default:
            // Fallback to complementary
            newPalette.push(createFromHsl(hue + 180, saturation, lightness));
            break;
    }

    setPalette(newPalette);
  }, [hue, saturation, lightness, mode]);

  const calculateColorFromInput = useCallback((clientX: number, clientY: number) => {
     if (!wheelRef.current) return;
     const rect = wheelRef.current.getBoundingClientRect();
     const centerX = rect.width / 2;
     const centerY = rect.height / 2;
     
     const dx = clientX - rect.left - centerX;
     const dy = clientY - rect.top - centerY;
     
     // Calculate Angle (Hue)
     let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
     if (angle < 0) angle += 360;
     
     const distance = Math.sqrt(dx * dx + dy * dy);
     const radius = rect.width / 2;
     
     // Clamp saturation (0 at center, 100 at edge)
     const newSat = Math.min(100, Math.max(0, (distance / radius) * 100));
     
     setHue(Math.round(angle));
     setSaturation(Math.round(newSat));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    calculateColorFromInput(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    calculateColorFromInput(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
        calculateColorFromInput(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setManualHex(val);

      // Try to parse hex
      const clean = val.startsWith('#') ? val : '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
          const rgb = hexToRgb(clean);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          setHue(hsl.h);
          setSaturation(hsl.s);
          setLightness(hsl.l);
      }
  };

  // Window listeners for mouse drag
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            calculateColorFromInput(e.clientX, e.clientY);
        }
    };
    
    const handleWindowMouseUp = () => {
        if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, calculateColorFromInput]);

  const getHandleStyle = () => {
    // Convert Hue back to geometric angle for positioning
    const angleRad = (hue - 90) * (Math.PI / 180);
    const distPercent = saturation / 2; // Map 0-100 sat to 0-50% radius
    const left = 50 + (distPercent * Math.cos(angleRad));
    const top = 50 + (distPercent * Math.sin(angleRad));
    
    return {
        left: `${left}%`,
        top: `${top}%`,
        backgroundColor: palette[0]?.hex || '#fff',
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 0 2px white, 0 0 10px 2px ${palette[0]?.hex || '#000'}`,
    };
  };

  // Dynamic Wheel Background based on Lightness
  const conicStops = [
    `hsl(0, 100%, ${lightness}%)`,
    `hsl(60, 100%, ${lightness}%)`,
    `hsl(120, 100%, ${lightness}%)`,
    `hsl(180, 100%, ${lightness}%)`,
    `hsl(240, 100%, ${lightness}%)`,
    `hsl(300, 100%, ${lightness}%)`,
    `hsl(360, 100%, ${lightness}%)`,
  ].join(', ');

  const wheelBackground = `
    radial-gradient(circle closest-side, hsl(0, 0%, ${lightness}%) 0%, transparent 100%),
    conic-gradient(from 0deg, ${conicStops})
  `;

  const harmonyModes: PaletteMode[] = ['complementary', 'monochromatic', 'analogous', 'triadic', 'tetradic'];

  return (
    <Layout>
      {/* Hide cursor globally while dragging to improve immersion and precision feeling */}
      {isDragging && (
        <style>{`
          body, body * { cursor: none !important; }
        `}</style>
      )}

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left: Controls & Wheel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-900 to-black border-r border-white/10 overflow-y-auto md:overflow-hidden">
          
          <div className="absolute top-4 left-4 text-xs font-mono text-gray-500 pointer-events-none">
            INPUT_MATRIX // H:{hue} S:{saturation} L:{lightness}
          </div>

          {/* Hex Input Field */}
          <div className="mb-10 relative group mt-8">
             <input 
               type="text" 
               value={manualHex}
               onChange={handleHexInputChange}
               maxLength={7}
               className="bg-black/30 border border-gray-700 rounded px-4 py-2 font-mono text-xl text-chroma-cyan focus:border-chroma-cyan focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] w-40 text-center uppercase tracking-widest transition-all hover:border-gray-500"
               placeholder="#000000"
             />
          </div>

          {/* Color Wheel Implementation */}
          <div 
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-crosshair select-none group"
            style={{
              background: wheelBackground,
              touchAction: 'none'
            }}
            ref={wheelRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            {/* Grid Overlay */}
            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(transparent 90%, rgba(0,0,0,0.5) 90%)', backgroundSize: '20px 20px'}}></div>
            
            {/* Handle */}
            <div 
              className="absolute w-5 h-5 rounded-full pointer-events-none transition-transform duration-75"
              style={getHandleStyle()}
            />
          </div>

          {/* Lightness Slider */}
          <div className="w-full max-w-xs mt-8 relative">
            <div className="flex justify-between text-xs font-mono text-gray-400 mb-2 items-center">
               <span>DARKNESS</span>
               <button 
                 onClick={() => setLightness(50)}
                 className="text-[10px] text-gray-600 hover:text-chroma-cyan transition-colors flex items-center gap-1"
                 title="Reset to 50%"
               >
                 <RotateCcw size={10} /> RESET
               </button>
               <span>LIGHTNESS</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={lightness} 
              onChange={(e) => setLightness(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/20 transition-all border border-white/10"
              style={{
                background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 10%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 90%))`
              }}
            />
            <style>{`
              input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #ffffff;
                border: 3px solid #1a1a2e;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                transition: transform 0.1s, border-color 0.2s;
              }
              input[type=range]::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                border-color: #00ffff;
              }
              input[type=range]::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #ffffff;
                border: 3px solid #1a1a2e;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                transition: transform 0.1s, border-color 0.2s;
              }
              input[type=range]::-moz-range-thumb:hover {
                transform: scale(1.1);
                border-color: #00ffff;
              }
            `}</style>
          </div>

          {/* Harmony Mode Selector */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
             {harmonyModes.map(m => (
               <button
                 key={m}
                 onClick={() => setMode(m)}
                 className={`px-3 py-1 text-xs font-mono border transition-all uppercase
                   ${mode === m 
                     ? 'bg-chroma-accent text-black border-chroma-accent shadow-[0_0_10px_rgba(255,0,255,0.5)]' 
                     : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
                   }`}
               >
                 {m.replace('-', ' ')}
               </button>
             ))}
          </div>

        </div>

        {/* Right: Results */}
        <div className="w-full md:w-1/2 bg-black/50 overflow-y-auto p-4 md:p-8 custom-scrollbar">
           <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
             <span className="w-2 h-6 bg-chroma-yellow block"></span>
             GENERATED HARMONY
           </h3>
           
           <div className="flex flex-col gap-4">
             {palette.map((color, i) => (
               <div key={i} className="animate-fadeIn opacity-0 fill-mode-forwards" style={{ animationDelay: `${i * 100}ms`, animationName: 'fadeIn' }}>
                 <ColorCard color={color} />
               </div>
             ))}
           </div>
           
           <div className="mt-8 p-4 border border-white/10 rounded bg-white/5">
             <h4 className="font-mono text-sm text-gray-400 mb-2">CSS EXPORT</h4>
             <code className="text-xs text-chroma-cyan font-mono block whitespace-pre-wrap break-all">
               {`:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`}
             </code>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fill-mode-forwards { animation-fill-mode: forwards; }
      `}</style>
    </Layout>
  );
};
