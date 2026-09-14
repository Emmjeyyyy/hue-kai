import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { Check, Sparkles } from 'lucide-react';

export const PricingCardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0f0f11' : '#fafafa';
  const cardBg = isDark ? '#1a1a1f' : '#ffffff';
  const borderCol = isDark ? '#2a2a30' : '#e4e4e7';
  const textMain = isDark ? '#ececef' : '#18181b';
  const textMuted = isDark ? '#71717a' : '#a1a1aa';

  const tiers = [
    { name: 'Starter', price: '$9', desc: 'For color enthusiasts', features: ['Unlimited palettes', 'Basic extraction', 'Standard exports', 'Community access'] },
    { name: 'Pro', price: '$29', desc: 'For creative professionals', features: ['AI color generation', 'Advanced extraction', 'Tailwind & CSS exports', 'Custom gradients', 'Priority support'] },
    { name: 'Enterprise', price: '$99', desc: 'For design teams', features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom integrations', 'Dedicated manager', 'SSO'] },
  ];

  // The middle card (Pro) is the "featured" one
  const featuredIdx = 1;

  return (
    <div
      className="w-full h-[600px] rounded-xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden px-6"
      style={{ backgroundColor: bg, color: textMain, fontFamily: '"Product Sans", sans-serif' }}
    >
      {/* Header */}
      <div className="text-center mb-8 z-10">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Simple pricing</h2>
        <p className="text-sm" style={{ color: textMuted }}>No hidden fees. Change plans anytime.</p>
      </div>

      {/* Cards */}
      <div className="flex gap-6 items-stretch z-10 w-full max-w-5xl justify-center px-4">
        {tiers.map((tier, i) => {
          const isFeatured = i === featuredIdx;
          const accentColor = c(i);

          return (
            <div
              key={tier.name}
              className={`flex-1 max-w-[300px] rounded-2xl flex flex-col relative transition-all ${
                isFeatured ? 'scale-105 z-20' : 'z-10'
              } ${!isDark ? (isFeatured ? 'shadow-2xl' : 'shadow-lg') : 'shadow-none'}`}
              style={{
                backgroundColor: isFeatured ? accentColor : cardBg,
                color: isFeatured ? getTextColor(accentColor) : textMain,
                border: isFeatured ? 'none' : `1px solid ${borderCol}`,
              }}
            >
              {/* Curved Header Background for non-featured only */}
              {!isFeatured && (
                <div className="absolute top-0 left-0 w-full h-[110px] z-0 overflow-hidden rounded-t-2xl">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-sm">
                    <path d="M0,0 L100,0 L100,65 C65,100 35,45 0,75 Z" fill={accentColor} />
                  </svg>
                </div>
              )}

              {isFeatured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-md z-30"
                  style={{ backgroundColor: cardBg, color: textMain }}
                >
                  <Sparkles size={10} style={{ color: accentColor }} /> POPULAR
                </div>
              )}

              {/* Header Content */}
              <div className="p-6 pb-2 relative z-10 flex justify-between items-start gap-2" style={{ color: getTextColor(accentColor) }}>
                <div className="min-w-0">
                  <h3 className={`text-sm font-semibold mb-0.5 ${isFeatured ? 'text-xl' : ''} truncate`}>{tier.name}</h3>
                  <p className="text-[11px] opacity-90 whitespace-nowrap">{tier.desc}</p>
                </div>
                <div className="text-right flex items-baseline gap-1 shrink-0 whitespace-nowrap">
                  <span className={`${isFeatured ? 'text-4xl' : 'text-3xl'} font-bold tracking-tight leading-none`}>{tier.price}</span>
                  <span className="text-[10px] font-semibold opacity-80 uppercase tracking-widest whitespace-nowrap">/ mo</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="px-6 pb-6 pt-4 relative z-10 flex-1 flex flex-col mt-4">
                <ul className="space-y-3 flex-1 mb-6 font-medium">
                  {tier.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2 text-[12px]">
                      <Check size={13} style={{ color: isFeatured ? getTextColor(accentColor) : textMain }} strokeWidth={3} />
                      <span style={{ color: isFeatured ? getTextColor(accentColor) : textMain, opacity: isFeatured ? 0.9 : 0.85 }}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className="w-full py-2.5 rounded-lg text-[12px] font-bold transition-transform hover:scale-[1.02] active:scale-100 shadow-md mt-auto"
                  style={{
                    backgroundColor: isFeatured ? (getTextColor(accentColor) === '#000000' ? '#ffffff' : '#111111') : accentColor,
                    color: isFeatured ? (getTextColor(accentColor) === '#000000' ? '#000000' : '#ffffff') : getTextColor(accentColor),
                  }}
                >
                  Get started
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
