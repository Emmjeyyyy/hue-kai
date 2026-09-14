import React from 'react';
import { ColorData } from '../../types';

interface PreviewProps {
  colors: ColorData[];
  isDark?: boolean;
}

export const MascotPreview: React.FC<PreviewProps> = ({ colors, isDark }) => {
  // Wrap around palette if needed
  const c = (index: number) => colors[index % colors.length]?.hex || '#000000';
  
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: isDark ? '#111111' : '#f5f2eb' }}>
      <svg viewBox="0 0 500 600" className="w-full h-full overflow-visible">
        
        <defs>
          <clipPath id="mouth-clip">
            <path d="M 210 370 L 260 370 L 260 400 A 25 25 0 0 1 210 400 Z" />
          </clipPath>
        </defs>

        {/* 1. Pink Face Background (Behind everything) */}
        <path d="M 50 170 L 320 170 Q 410 170 410 260 L 410 420 Q 410 510 320 510 L 150 510 Q 50 510 50 410 Z" fill={c(2)} />

        {/* 2. White Teeth (Drawn before Blue Head so they tuck behind the gums) */}
        <path d="M 100 150 L 100 180 A 30 35 0 0 0 160 180 A 30 35 0 0 0 220 180 A 30 35 0 0 0 280 180 A 30 35 0 0 0 340 180 L 340 150 Z" fill="#f5f2eb" />

        {/* 3. Base Blue Shape with Mouth Hole (Overlay) */}
        <g>
          <path fillRule="evenodd" d="
            M 50 120 L 350 120 Q 450 120 450 220 L 450 450 Q 450 550 350 550 L 150 550 Q 50 550 50 450 Z
            M 50 180 L 320 180 Q 400 180 400 260 L 400 420 Q 400 500 320 500 L 150 500 Q 50 500 50 400 Z
          " fill={c(1)} />
          {/* Top Bumps */}
          <circle cx="100" cy="120" r="50" fill={c(1)} />
          <circle cx="220" cy="120" r="50" fill={c(1)} />
          <circle cx="100" cy="100" r="16" fill="#111111" />
          <circle cx="220" cy="100" r="16" fill="#111111" />
          {/* Top Right Yellow Eye */}
          <circle cx="390" cy="110" r="55" fill={c(0)} />
          <circle cx="390" cy="110" r="35" fill="#111111" />
        </g>

        {/* 4. Pink Face Features */}
        <g>
          
          {/* Left Eye */}
          <circle cx="150" cy="320" r="55" fill="#f5f2eb" />
          <circle cx="150" cy="320" r="40" fill="#111111" />
          
          {/* Right Eye */}
          <circle cx="310" cy="320" r="55" fill="#f5f2eb" />
          <circle cx="310" cy="320" r="40" fill="#111111" />

          {/* Nose */}
          <path d="M 215 310 L 215 350 L 235 350" stroke="#111111" strokeWidth="12" fill="none" strokeLinecap="square" strokeLinejoin="miter" />

          {/* Mouth */}
          <g>
            <path d="M 210 370 L 260 370 L 260 400 A 25 25 0 0 1 210 400 Z" fill="#111111" />
            <g clipPath="url(#mouth-clip)">
              <circle cx="260" cy="425" r="30" fill={c(3)} />
            </g>
          </g>

          {/* Freckles */}
          {/* Left Cheek */}
          <circle cx="100" cy="420" r="4" fill="#111111" />
          <circle cx="120" cy="445" r="5" fill="#111111" />
          <circle cx="145" cy="430" r="4" fill="#111111" />
          {/* Right Cheek */}
          <circle cx="305" cy="430" r="4" fill="#111111" />
          <circle cx="330" cy="445" r="5" fill="#111111" />
          <circle cx="355" cy="420" r="4" fill="#111111" />
        </g>

      </svg>
    </div>
  );
};
