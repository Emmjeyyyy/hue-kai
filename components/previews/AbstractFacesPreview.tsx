import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';

interface PreviewProps {
  colors: ColorData[];
  isDark?: boolean;
}

export const AbstractFacesPreview: React.FC<PreviewProps> = ({ colors, isDark }) => {
  // Wrap around palette if needed
  const c = (index: number) => colors[index % colors.length]?.hex || '#000000';
  
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: isDark ? '#111111' : '#ffffff' }}>
      <svg viewBox="0 0 500 600" className="w-full h-full overflow-visible">
        
        {/* 1. Blue Zig-Zag (Top-Left) */}
        <g>
          <path d="M 90 280 L 160 150 L 230 250 L 300 150" stroke={c(1)} strokeWidth="60" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* White Square Eye */}
          <rect x="150" y="170" width="35" height="35" fill="#ffffff" />
          <circle cx="172" cy="182" r="6" fill="#111111" />
          {/* White Circle Eye */}
          <circle cx="120" cy="220" r="22" fill="#ffffff" />
          <circle cx="115" cy="220" r="7" fill="#111111" />
        </g>

        {/* 2. Black Pill (Top-Right) */}
        <g>
          <rect x="290" y="140" rx="45" ry="45" width="90" height="150" fill={c(3)} />
          {/* Face */}
          <g transform="translate(-5, -25)">
            <path d="M 305 210 Q 320 225 335 210" stroke="#111111" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 345 210 Q 360 225 375 210" stroke="#111111" strokeWidth="5" fill="none" strokeLinecap="round" />
            <line x1="330" y1="235" x2="350" y2="235" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>

        {/* 3. Green Circle (Bottom-Left) */}
        <g>
          <circle cx="160" cy="390" r="75" fill={c(4)} />
          {/* Eyes Rectangle */}
          <rect x="90" y="375" width="70" height="20" rx="4" fill="#ffffff" />
          <circle cx="123" cy="381" r="6" fill="#111111" />
          <circle cx="153" cy="381" r="6" fill="#111111" />
        </g>

        {/* 4. Orange Circle (Center) */}
        <g>
          <circle cx="230" cy="300" r="105" fill={c(2)} />
          {/* Face */}
          <path d="M 185 270 Q 200 285 215 270" stroke="#111111" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 245 270 Q 260 285 275 270" stroke="#111111" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 190 300 Q 230 335 270 300" stroke="#111111" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>

        {/* 5. Pink Curve (Bottom-Right) */}
        <g transform="translate(40, 50)">
          {/* Since c(5) doesn't exist, we'll wrap to c(0) or just use c(5) since the helper wraps it */}
          <path d="M 270 450 A 110 110 0 0 1 420 300" stroke={c(5)} strokeWidth="90" fill="none" strokeLinecap="butt" />
          {/* Face and Sparkle */}
          <g transform="translate(0, -20)">
            <path d="M 300 310 Q 310 295 320 310" stroke="#111111" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="345" cy="305" r="14" fill="#ffffff" />
            <circle cx="345" cy="305" r="6" fill="#111111" />
            <path d="M 300 335 Q 330 350 355 330" stroke="#111111" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        </g>

      </svg>
    </div>
  );
};
