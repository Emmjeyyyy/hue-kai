import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Lock, Unlock, Check, Blend } from 'lucide-react';
import { ColorData } from '../types';
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, createColorData } from '../utils/colorUtils';

export const CyberButton: React.FC<{ 
  onClick?: () => void; 
  children: React.ReactNode; 
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'dark';
  pressed?: boolean;
  disabled?: boolean;
  title?: string;
}> = ({ onClick, children, className = '', variant = 'primary', pressed = false, disabled = false, title }) => {
  
  // REFACTOR NOTE:
  // We have moved the inner content (text/icon) movement logic from the parent's CSS (using [&>span])
  // to the span itself using `group-hover` and `group-active`. 
  // This ensures reliability and fixes issues where the text remained static.
  
  const baseStyle = "relative font-mono font-bold uppercase tracking-wider group isolate disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed focus:outline-none";
  
  const variants = {
    primary: `
      bg-transparent text-white
      
      /* DEPTH LAYER (Static Anchor) */
      before:content-[''] before:absolute before:inset-0 before:z-[-2] before:rounded-full
      before:bg-[linear-gradient(95deg,#FFD700_0%,#F97316_20%,#EF4444_40%,#EC4899_60%,#A855F7_80%,#581C87_100%)]
      before:brightness-[0.6] before:saturate-[1.2]
      before:translate-y-[6px]
      
      /* FACE LAYER (Moving Surface) */
      after:content-[''] after:absolute after:inset-0 after:z-[-1] after:rounded-full
      after:bg-[linear-gradient(95deg,#FFD700_0%,#F97316_20%,#EF4444_40%,#EC4899_60%,#A855F7_80%,#581C87_100%)]
      after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.3)]
      after:transition-transform after:duration-100 after:ease-out
      
      /* HOVER STATE (Face Only) */
      hover:after:-translate-y-[2px]
      hover:after:brightness-110 
      hover:after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_0_12px_rgba(236,72,153,0.5)]
      
      /* ACTIVE STATE (Face Only) */
      active:after:translate-y-[4px]
      active:after:brightness-100
      active:after:shadow-none
    `,
    
    secondary: "bg-chroma-violet border border-chroma-cyan/50 text-chroma-cyan hover:bg-chroma-cyan/10 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] shadow-lg active:scale-95 transition-all duration-200",
    
    danger: "bg-red-600 text-white border-b-4 border-r-4 border-red-900 hover:bg-red-500 shadow-lg active:scale-95 transition-all duration-200",
    
    dark: `
      bg-transparent text-gray-400
      
      /* DEPTH LAYER (Static Anchor) */
      before:content-[''] before:absolute before:inset-0 before:z-[-2] before:rounded-full
      before:bg-[#111111]
      before:border-b before:border-l before:border-r before:border-white/10
      before:translate-y-[6px]
      
      /* FACE LAYER (Moving Surface) */
      after:content-[''] after:absolute after:inset-0 after:z-[-1] after:rounded-full
      after:bg-[#1f1f22]
      after:border after:border-white/10
      after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_5px_rgba(0,0,0,0.5)]
      after:transition-transform after:duration-100 after:ease-out

      /* HOVER STATE (Face Only) */
      hover:after:-translate-y-[2px]
      hover:text-white
      hover:after:bg-[#27272a]
      hover:after:border-white/20
      hover:after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_0_10px_rgba(255,255,255,0.05)]
      
      /* ACTIVE STATE (Face Only) */
      active:after:translate-y-[4px]
      active:after:bg-[#1f1f22]
      active:after:shadow-none
      active:after:border-white/10
    `
  };

  // Styles that mimic the 'active' state for the Button/Face when pressed={true}
  const pressedStyles = {
    primary: `
      after:translate-y-[4px] after:brightness-100 after:shadow-none
      hover:after:translate-y-[4px] hover:after:brightness-100 hover:after:shadow-none
    `,
    secondary: "scale-95 shadow-none hover:scale-95 hover:shadow-none",
    danger: "scale-95 shadow-none hover:scale-95 hover:shadow-none",
    dark: `
      after:translate-y-[4px] after:bg-[#1f1f22] after:shadow-none after:border-white/10
      hover:after:translate-y-[4px] hover:after:bg-[#1f1f22] hover:after:shadow-none
    `
  };

  // Determine classes for the inner content (text/icon)
  const is3D = variant === 'primary' || variant === 'dark';
  let contentClasses = "relative z-10 flex items-center justify-center gap-2 drop-shadow-md select-none transition-transform duration-100 ease-out";
  
  if (is3D) {
    if (pressed) {
      // Locked in pressed state
      contentClasses += " translate-y-[4px]";
    } else {
      // Normal interactive state: Up on Hover, Down on Active
      contentClasses += " group-hover:-translate-y-[2px] group-active:translate-y-[4px]";
    }
  }

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyle} ${variants[variant]} ${pressed ? pressedStyles[variant] : ''} px-8 py-3 ${className}`}
    >
      <span className={contentClasses}>{children}</span>
    </button>
  );
};

export const ColorCard: React.FC<{
  color: ColorData;
  onLock?: () => void;
  onColorChange?: (newColor: ColorData) => void;
  fullHeight?: boolean;
  resetTrigger?: number;
  disableShades?: boolean;
}> = ({ color, onLock, onColorChange, fullHeight = false, resetTrigger, disableShades = false }) => {
  const [copied, setCopied] = useState(false);
  const [showShades, setShowShades] = useState(false);

  useEffect(() => {
     setShowShades(false);
  }, [resetTrigger]);

  const shades = useMemo(() => {
    if (!showShades) return [];
    const { r, g, b } = hexToRgb(color.hex);
    const { h, s, l: originalL } = rgbToHsl(r, g, b);
    const result = [];
    for (let i = 15; i >= 0; i--) {
        const l = Math.max(2, Math.min(98, i * (100 / 15))); 
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        result.push({ hex, l, isOriginal: false });
    }
    
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < result.length; i++) {
       const diff = Math.abs(result[i].l - originalL);
       if (diff < minDiff) {
           minDiff = diff;
           closestIdx = i;
       }
    }
    
    result[closestIdx] = { hex: color.hex.toUpperCase(), l: originalL, isOriginal: true };
    return result;
  }, [color.hex, showShades]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div 
      className={`relative group transition-all duration-500 ease-out overflow-hidden flex flex-col ${fullHeight ? 'h-full flex-1 min-h-[120px]' : 'h-64 w-full rounded-lg'}`}
      style={{ backgroundColor: color.hex }}
    >
      {showShades && (
        <div className="absolute inset-0 flex flex-col z-30 animate-in fade-in zoom-in-95 duration-200">
          {shades.map((shade, i) => {
            const isLight = shade.l > 55;
            const textColor = isLight ? 'text-black/80' : 'text-white';
            const dotColor = isLight ? 'bg-black/80' : 'bg-white';
            
            return (
            <div 
              key={i} 
              className="flex-1 w-full cursor-pointer hover:z-10 hover:scale-[1.05] transition-transform flex items-center justify-center group/shade"
              style={{ backgroundColor: shade.hex }}
              onClick={(e) => {
                  e.stopPropagation();
                  if (onColorChange) {
                      onColorChange(createColorData(shade.hex));
                  }
                  setShowShades(false);
              }}
            >
              {shade.isOriginal ? (
                <div className="flex flex-col items-center">
                   <div className={`w-2 h-2 rounded-full ${dotColor} mb-1 shadow-sm`}></div>
                   <span className={`${textColor} text-xs font-bold tracking-wider`}>{shade.hex.replace('#', '')}</span>
                </div>
              ) : (
                <span className={`${textColor} text-xs font-bold tracking-wider opacity-0 group-hover/shade:opacity-100 transition-opacity`}>
                  {shade.hex.replace('#', '')}
                </span>
              )}
            </div>
          )})}
        </div>
      )}


      
      {/* Content Container - Info at Top */}
      <div className={`p-4 backdrop-blur-md bg-black/40 border-b border-white/10 transition-transform duration-300`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span 
              className="font-mono text-2xl font-bold tracking-widest text-white cursor-pointer hover:text-chroma-yellow transition-colors drop-shadow-md"
              onClick={handleCopy}
            >
              {copied ? <span className="text-green-400 flex items-center gap-1"><Check size={20}/> COPIED</span> : color.hex}
            </span>
            <div className="flex flex-col text-xs font-mono text-gray-300 opacity-80 gap-0.5">
              <span>RGB: {color.rgb}</span>
              <span>HSL: {color.hsl}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
             {onLock && (
              <button 
                onClick={(e) => { e.stopPropagation(); onLock(); }}
                className="text-white/70 hover:text-white hover:scale-110 transition-all active:scale-95"
              >
                {color.locked ? <Lock size={20} className="text-chroma-accent drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]" /> : <Unlock size={20} />}
              </button>
            )}
            <button 
              onClick={handleCopy}
              className="text-white/70 hover:text-white hover:scale-110 transition-all active:scale-95"
            >
               <Copy size={20} />
            </button>
            {!disableShades && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowShades(!showShades); }}
                className="text-white/70 hover:text-white hover:scale-110 transition-all active:scale-95"
              >
                 <Blend size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vertical Japanese decorative text - Moved to bottom right */}
      <div className="absolute bottom-4 right-2 text-white/10 font-bold writing-vertical-rl select-none pointer-events-none text-xs">
        カラーコード // {color.hex.replace('#', '')}
      </div>
    </div>
  );
};