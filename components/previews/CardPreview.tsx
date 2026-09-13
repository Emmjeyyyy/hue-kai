import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export const CardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const cPrimary = colors[0]?.hex || '#000000';
  const cSecondary = colors[1]?.hex || cPrimary;
  const cAccent = colors[2]?.hex || cSecondary;
  const cBg = isDark ? '#09090b' : '#ffffff';
  const cSurface = isDark ? '#18181b' : '#ffffff';
  
  const textPrimary = getTextColor(cPrimary);
  const textBg = isDark ? '#f9fafb' : '#111827';
  const textSurface = isDark ? '#f3f4f6' : '#111827';

  return (
    <div 
      className="w-full h-[600px] rounded-xl flex items-center justify-center p-6 font-sans shadow-2xl relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#111827' : '#f3f4f6', color: textBg }}
    >
      <div 
        className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        style={{ backgroundColor: cSurface, color: textSurface }}
      >
        {/* Product Image Area */}
        <div 
          className="h-64 w-full relative overflow-hidden flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${cPrimary}22, ${cSecondary}44)` }}
        >
          <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors" style={{ color: cPrimary }}>
            <Heart size={16} fill="currentColor" />
          </div>
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-md uppercase tracking-wider" style={{ backgroundColor: cAccent, color: getTextColor(cAccent) }}>
            New Arrival
          </div>
          
          {/* Abstract Mock Image */}
          <div 
            className="w-32 h-32 rounded-3xl shadow-2xl rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500"
            style={{ 
              background: `linear-gradient(45deg, ${cPrimary}, ${cSecondary})`,
              boxShadow: `0 20px 40px ${cPrimary}40`
            }}
          />
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1" style={{ color: cPrimary }}>Accessories</p>
              <h3 className="text-xl font-bold">Chroma Cube Pro</h3>
            </div>
            <span className="text-lg font-bold" style={{ color: cPrimary }}>$129</span>
          </div>

          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={14} fill={cSecondary} color={cSecondary} />
            ))}
            <span className="text-xs opacity-60 ml-2">(128 reviews)</span>
          </div>

          <p className="text-sm opacity-80 mb-6 leading-relaxed">
            Experience the next generation of dimensional color tracking. Designed with premium materials for the ultimate visual journey.
          </p>

          {/* Color Options */}
          <div className="flex items-start gap-3 mb-6">
            <span className="text-xs font-medium opacity-70 mt-1">Colors:</span>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c, i) => (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-2 transition-transform hover:scale-110 ${i === 0 ? 'ring-offset-transparent' : 'ring-transparent'}`}
                  style={{ backgroundColor: c.hex, borderColor: i === 0 ? cPrimary : 'transparent', ringColor: i === 0 ? cPrimary : 'transparent' }}
                />
              ))}
            </div>
          </div>

          <button 
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md group-hover:shadow-lg"
            style={{ backgroundColor: cPrimary, color: textPrimary }}
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
