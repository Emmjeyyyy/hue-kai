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
      
      {/* Right Graphic Side */}
      <div className="w-1/2 relative overflow-hidden h-full z-0" style={{ backgroundColor: c(0) }}>
        
        {/* Developer Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.12]" style={{ 
          backgroundImage: `radial-gradient(circle at center, ${isDark ? '#ffffff' : '#000000'} 1.5px, transparent 1.5px)`, 
          backgroundSize: '24px 24px' 
        }} />

        {/* Large sweeping angled block */}
        <div 
          className="absolute -top-20 -right-10 w-[150%] h-[120%] origin-top-right shadow-2xl"
          style={{ backgroundColor: c(1), transform: 'rotate(-25deg)' }}
        />

        {/* Giant Circle */}
        <div 
          className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full shadow-2xl"
          style={{ backgroundColor: c(2) }}
        />

        {/* Floating Pill Accent */}
        <div 
          className="absolute top-[80px] right-[40px] w-[140px] h-[60px] rounded-full shadow-lg"
          style={{ backgroundColor: c(3) || c(0), transform: 'rotate(15deg)' }}
        />
        
        {/* Frosted Glassmorphism Cube */}
        <div 
          className="absolute bottom-[60px] right-[40px] w-[160px] h-[160px] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 backdrop-blur-md flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', transform: 'rotate(-12deg)' }}
        >
          {/* Inner accent ring */}
          <div className="w-20 h-20 rounded-full border-[6px] opacity-60" style={{ borderColor: c(0) }} />
        </div>
      </div>
    </div>
  );
};
