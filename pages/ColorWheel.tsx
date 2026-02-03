import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { ColorCard } from '../components/UI';
import { generatePalette, hslToRgb, rgbToHex } from '../utils/colorUtils';
import { ColorData, PaletteMode } from '../types';

export const ColorWheel: React.FC = () => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [mode, setMode] = useState<PaletteMode>('complementary');
  const [palette, setPalette] = useState<ColorData[]>([]);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update palette when base parameters change
  useEffect(() => {
    const rgb = hslToRgb(hue, saturation, lightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    // Determine exact count based on mode requirements
    let count = 5;
    switch (mode) {
        case 'complementary':
        case 'monochromatic':
            count = 2;
            break;
        case 'analogous':
        case 'triadic':
            count = 3;
            break;
        case 'tetradic':
            count = 4;
            break;
        default:
            count = 5;
    }

    const newPalette = generatePalette(mode, count, hex);
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
     // 0 deg at Top (CSS), but atan2 0 is Right.
     // Formula: degrees = rad * 180/PI + 90.
     let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
     if (angle < 0) angle += 360;
     
     const distance = Math.sqrt(dx * dx + dy * dy);
     const radius = rect.width / 2;
     
     // Clamp saturation
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
    const angleRad = (hue - 90) * (Math.PI / 180);
    const distPercent = saturation / 2; // Map 0-100 sat to 0-50% radius
    const left = 50 + (distPercent * Math.cos(angleRad));
    const top = 50 + (distPercent * Math.sin(angleRad));
    
    return {
        left: `${left}%`,
        top: `${top}%`,
        backgroundColor: palette[0]?.hex || '#fff',
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 10px 2px ${palette[0]?.hex || '#fff'}`,
    };
  };

  const harmonyModes: PaletteMode[] = ['complementary', 'monochromatic', 'analogous', 'triadic', 'tetradic'];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left: Controls & Wheel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-900 to-black border-r border-white/10 overflow-y-auto md:overflow-hidden">
          
          <div className="absolute top-4 left-4 text-xs font-mono text-gray-500 pointer-events-none">
            INPUT_MATRIX // H:{hue} S:{saturation} L:{lightness}
          </div>

          {/* Color Wheel Implementation */}
          <div 
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-crosshair select-none group"
            style={{
              background: `
                radial-gradient(circle, white 0%, transparent 70%),
                conic-gradient(
                  from 0deg,
                  red, yellow, lime, aqua, blue, magenta, red
                )
              `,
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
              className="absolute w-6 h-6 border-2 border-white rounded-full pointer-events-none"
              style={getHandleStyle()}
            />
          </div>

          {/* Lightness Slider */}
          <div className="w-full max-w-xs mt-8">
            <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
               <span>DARKNESS</span>
               <span>LIGHTNESS</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={lightness} 
              onChange={(e) => setLightness(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-chroma-cyan"
            />
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