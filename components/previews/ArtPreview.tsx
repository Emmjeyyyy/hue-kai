import React from 'react';
import { ColorData } from '../../types';

export const ArtPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0f0f11' : '#f0f0f0';
  const textMain = isDark ? '#ffffff' : '#000000';

  return (
    <div
      className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <div className="w-[400px] h-[600px] relative">
        <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl">
          <g transform="translate(10, 40)">
            {/* Top Right Blue Circle */}
            <circle cx="260" cy="220" r="100" fill={c(1)} />
            
            {/* Left Red Semi-circle */}
            <path d="M 160 120 A 100 100 0 0 0 160 320 Z" fill={c(0)} />
            
            {/* Left Yellow Semi-circle */}
            <path d="M 160 260 A 100 100 0 0 0 160 460 Z" fill={c(2)} />

            {/* Main Diagonal cut (Background color triangle) to hide part of blue and form the skull face */}
            <polygon points="160,120 340,360 160,360" fill={bg} />

            {/* Top left black triangle */}
            <polygon points="160,120 160,40 210,120" fill={textMain} />
            
            {/* Small black triangle pointing down (resting on the diagonal) */}
            <polygon points="190,160 220,160 220,200" fill={textMain} />

            {/* Bottom Left Blue Triangle */}
            <polygon points="160,460 160,360 60,460" fill={c(1)} />

            {/* Eye (Black Ellipse) */}
            <ellipse cx="230" cy="300" rx="40" ry="35" fill={textMain} />

            {/* Nose (Black Triangle) */}
            <polygon points="160,290 190,340 160,340" fill={textMain} />

            {/* Teeth (Vertical Black Lines) */}
            <g fill={textMain}>
              <rect x="160" y="370" width="8" height="80" />
              <rect x="175" y="370" width="8" height="80" />
              <rect x="190" y="370" width="8" height="80" />
              <rect x="205" y="370" width="8" height="80" />
              <rect x="220" y="370" width="8" height="80" />
              <rect x="235" y="370" width="8" height="80" />
            </g>

            {/* Right bottom black shape (Rounded corner block) */}
            <path d="M 290 370 A 40 40 0 0 0 250 410 L 250 450 L 340 450 L 340 370 Z" fill={textMain} />
            
            {/* Right bottom red triangle */}
            <polygon points="340,370 340,450 390,450" fill={c(0)} />

            {/* Right Yellow Pill */}
            <rect x="270" y="275" width="100" height="50" rx="25" fill={c(2)} />

            {/* Thin black lines */}
            {/* Line from eye to right yellow pill */}
            <path d="M 270 300 L 360 300" stroke={textMain} strokeWidth="2" fill="none" />
            
            {/* Looping line on the left */}
            <path d="M 160 230 L 70 230 A 50 50 0 0 0 70 330 L 160 330" stroke={textMain} strokeWidth="2" fill="none" />
            
            {/* Curved Line from center to top right black dot */}
            <path d="M 220 240 C 330 240 330 120 330 70" stroke={textMain} strokeWidth="2" fill="none" />
            
            {/* Top right black dot */}
            <circle cx="330" cy="65" r="16" fill={textMain} />
          </g>
        </svg>
      </div>
    </div>
  );
};
