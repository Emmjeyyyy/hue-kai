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
    { name: 'Starter', price: '$9', desc: 'For individuals', features: ['5 projects', '1GB storage', 'Basic analytics', 'Email support'] },
    { name: 'Pro', price: '$29', desc: 'For growing teams', features: ['Unlimited projects', '50GB storage', 'Advanced analytics', 'Priority support', 'API access'] },
    { name: 'Enterprise', price: '$99', desc: 'For organizations', features: ['Everything in Pro', '500GB storage', 'Custom integrations', 'Dedicated manager', 'SSO & SAML', 'SLA guarantee'] },
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
      <div className="flex gap-4 items-stretch z-10 w-full max-w-3xl justify-center">
        {tiers.map((tier, i) => {
          const isFeatured = i === featuredIdx;
          const accentColor = c(i);

          return (
            <div
              key={tier.name}
              className={`flex-1 max-w-[240px] rounded-2xl flex flex-col p-6 relative transition-all ${isFeatured ? 'shadow-xl -translate-y-2' : 'shadow-sm'}`}
              style={{
                backgroundColor: isFeatured ? accentColor : cardBg,
                color: isFeatured ? getTextColor(accentColor) : textMain,
                border: isFeatured ? 'none' : `1px solid ${borderCol}`,
              }}
            >
              {isFeatured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-md"
                  style={{ backgroundColor: cardBg, color: accentColor }}
                >
                  <Sparkles size={10} /> POPULAR
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-sm font-semibold mb-0.5">{tier.name}</h3>
                <p className={`text-[11px] ${isFeatured ? 'opacity-80' : ''}`} style={{ color: isFeatured ? undefined : textMuted }}>{tier.desc}</p>
              </div>

              <div className="mb-5">
                <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
                <span className={`text-[12px] ${isFeatured ? 'opacity-70' : ''}`} style={{ color: isFeatured ? undefined : textMuted }}>/mo</span>
              </div>

              <button
                className="w-full py-2 rounded-lg text-[12px] font-semibold mb-5 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: isFeatured ? (isDark ? '#fff' : '#18181b') : accentColor,
                  color: isFeatured ? (isDark ? '#18181b' : '#fff') : getTextColor(accentColor),
                }}
              >
                Get started
              </button>

              <ul className="space-y-2.5 flex-1">
                {tier.features.map(feat => (
                  <li key={feat} className="flex items-center gap-2 text-[12px]">
                    <Check size={13} className={isFeatured ? 'opacity-90' : ''} style={{ color: isFeatured ? getTextColor(accentColor) : accentColor }} />
                    <span className={isFeatured ? 'opacity-90' : ''} style={{ color: isFeatured ? undefined : textMuted }}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
