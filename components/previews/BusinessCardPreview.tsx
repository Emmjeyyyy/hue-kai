import React from 'react';
import { ColorData } from '../../types';

export const BusinessCardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0f0f11' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1f' : '#ffffff';
  const textMain = isDark ? '#ffffff' : '#000000';
  const textMuted = isDark ? '#a1a1aa' : '#111111';

  return (
    <div
      className="w-full h-[600px] rounded-xl flex overflow-hidden shadow-2xl"
      style={{ backgroundColor: cardBg, fontFamily: '"Product Sans", sans-serif' }}
    >
      {/* Left Typography Side */}
      <div className="w-1/2 p-16 flex flex-col justify-center z-10 relative">
        <div className="mb-20">
          <h1 className="text-[72px] font-extrabold leading-[1.05] tracking-tight" style={{ color: textMain }}>
            Huekai<br />Labs
          </h1>
        </div>
        
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: textMain }}>Color Engine</h2>
          <p className="text-[14px] font-bold tracking-[0.2em] uppercase mt-2.5" style={{ color: c(0) }}>Algorithmic Palettes</p>
        </div>
        
        <div className="text-[15px] font-medium tracking-wide leading-relaxed" style={{ color: textMuted }}>
          github.com/huekai<br />
          hello@huekai.app
        </div>
      </div>
      
      {/* Right Graphic Side (Pop Art Faces) */}
      <div className="w-1/2 relative overflow-hidden h-full z-0 bg-[#f4f4f5]">
        
        {/* Top Left Blue Block */}
        <div className="absolute top-0 left-0 w-[58%] h-[48.33%] flex items-center justify-center">
          <div className="absolute inset-[-2px] -z-10" style={{ backgroundColor: c(1) }} />
          <svg viewBox="0 0 100 50" className="w-[100px] overflow-visible">
            {/* Left Eye */}
            <path d="M 0 0 C 0 30, 40 30, 40 0 Z" fill="#ffffff" />
            <path d="M 5 0 A 10 10 0 0 0 25 0 Z" fill="#111111" />
            {/* Right Eye */}
            <path d="M 60 0 C 60 30, 100 30, 100 0 Z" fill="#ffffff" />
            <path d="M 65 0 A 10 10 0 0 0 85 0 Z" fill="#111111" />
            {/* Mouth */}
            <line x1="10" y1="45" x2="90" y2="45" stroke="#111111" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom Left Pink Block */}
        <div className="absolute top-[48.33%] left-0 w-[58%] h-[31.67%] flex items-center justify-center">
          <div className="absolute inset-[-2px] -z-10" style={{ backgroundColor: c(2) }} />
          <svg viewBox="0 0 100 70" className="w-[100px] overflow-visible">
            {/* Left Eye */}
            <path d="M 15 0 Q 30 20 45 0" stroke="#111111" strokeWidth="8" fill="none" strokeLinecap="round" />
            {/* Right Eye */}
            <path d="M 55 0 Q 70 20 85 0" stroke="#111111" strokeWidth="8" fill="none" strokeLinecap="round" />
            {/* Happy Mouth */}
            <path d="M 0 30 Q 50 70 100 30" stroke="#111111" strokeWidth="8" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Right Yellow Block */}
        <div className="absolute top-0 right-0 w-[42%] h-[80%] flex items-center justify-center">
          <div className="absolute inset-[-2px] -z-10" style={{ backgroundColor: c(0) }} />
          <svg viewBox="0 0 120 50" className="w-[120px] overflow-visible">
            {/* Left Eye */}
            <circle cx="25" cy="25" r="25" fill="#ffffff" />
            <circle cx="13" cy="20" r="12" fill="#111111" />
            {/* Right Eye */}
            <circle cx="95" cy="25" r="25" fill="#ffffff" />
            <circle cx="83" cy="20" r="12" fill="#111111" />
          </svg>
        </div>

        {/* Bottom Orange Block */}
        <div className="absolute bottom-0 left-0 w-full h-[20%] flex items-center justify-center">
          <div className="absolute inset-[-2px] -z-10" style={{ backgroundColor: c(3) }} />
          <svg viewBox="0 0 90 60" className="w-[90px] overflow-visible">
            {/* Left Eye (>) */}
            <polyline points="10,0 30,15 10,30" stroke="#111111" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="rotate(20, 20, 15)" />
            {/* Right Eye (<) */}
            <polyline points="80,0 60,15 80,30" stroke="#111111" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-20, 70, 15)" />
            {/* Neutral Mouth */}
            <line x1="25" y1="50" x2="65" y2="50" stroke="#111111" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>
        
      </div>
    </div>
  );
};
