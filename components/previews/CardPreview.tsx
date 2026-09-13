import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { Heart, ShoppingBag, Star } from 'lucide-react';

export const CardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0f0f11' : '#fafafa';
  const cardBg = isDark ? '#1a1a1f' : '#ffffff';
  const borderCol = isDark ? '#2a2a30' : '#e4e4e7';
  const textMain = isDark ? '#ececef' : '#18181b';
  const textMuted = isDark ? '#71717a' : '#a1a1aa';

  return (
    <div
      className="w-full h-[600px] rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden"
      style={{ backgroundColor: bg, color: textMain, fontFamily: '"Product Sans", sans-serif' }}
    >
      {/* Card */}
      <div className="w-full max-w-[340px] mx-4 rounded-2xl border overflow-hidden shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderCol }}>
        {/* Product image area */}
        <div className="h-52 relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${c(0)}12, ${c(1)}20, ${c(0)}08)` }}>
          {/* Like button */}
          <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-sm transition-colors hover:opacity-80" style={{ borderColor: borderCol, backgroundColor: isDark ? '#1a1a1f99' : '#ffffff99' }}>
            <Heart size={14} style={{ color: c(0) }} />
          </button>

          {/* Badge */}
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide" style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}>
            NEW
          </div>

          {/* Abstract product shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div
                className="w-28 h-28 rounded-2xl rotate-6 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${c(0)}, ${c(Math.min(1, colors.length - 1))})` }}
              />
              <div
                className="w-16 h-16 rounded-xl absolute -bottom-2 -right-4 rotate-12 shadow-lg opacity-60"
                style={{ background: `linear-gradient(135deg, ${c(Math.min(1, colors.length - 1))}, ${c(Math.min(2, colors.length - 1))})` }}
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-1.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: c(0) }}>Accessories</p>
              <h3 className="text-base font-bold">Chroma Cube Pro</h3>
            </div>
            <span className="text-base font-bold" style={{ color: c(0) }}>$129</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={12} fill={c(Math.min(1, colors.length - 1))} color={c(Math.min(1, colors.length - 1))} />
            ))}
            <span className="text-[11px] ml-1.5" style={{ color: textMuted }}>4.9 (128)</span>
          </div>

          <p className="text-[12px] leading-relaxed mb-4" style={{ color: textMuted }}>
            Next-gen dimensional color tracking. Premium materials, precision engineering.
          </p>

          {/* Swatches */}
          <div className="flex items-center gap-2 mb-5">
            {colors.slice(0, 5).map((col, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full transition-transform hover:scale-110 cursor-pointer"
                style={{
                  backgroundColor: col.hex,
                  boxShadow: i === 0 ? `0 0 0 2px ${isDark ? '#1a1a1f' : '#fff'}, 0 0 0 3px ${col.hex}` : 'none',
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <button
            className="w-full py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
