import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { Check, Zap } from 'lucide-react';

export const PricingCardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const cPrimary = colors[0]?.hex || '#000000';
  const cSecondary = colors[1]?.hex || cPrimary;
  const cAccent = colors[2]?.hex || cSecondary;
  const cBg = isDark ? '#09090b' : '#ffffff';
  const cSurface = isDark ? '#18181b' : '#ffffff';
  
  const textPrimary = getTextColor(cPrimary);
  const textSecondary = getTextColor(cSecondary);
  const textBg = isDark ? '#f9fafb' : '#111827';
  const textSurface = isDark ? '#f3f4f6' : '#111827';

  const plans = colors.map((c, i) => {
    const isPopular = i === Math.floor(colors.length / 2);
    const names = ['Starter', 'Basic', 'Standard', 'Pro', 'Plus', 'Premium', 'Elite', 'Ultimate', 'Enterprise', 'Max'];
    return {
      name: names[i % names.length],
      price: `$${19 + i * 20}`,
      desc: `Perfect for ${names[i % names.length].toLowerCase()} usage`,
      color: c.hex,
      textColor: getTextColor(c.hex),
      isPopular
    };
  });

  return (
    <div 
      className="w-full h-[600px] rounded-xl p-8 flex flex-col items-center font-sans shadow-2xl relative overflow-y-auto"
      style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', color: textBg, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="text-center mb-10 max-w-xl shrink-0 mt-8">
        <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-lg opacity-80">Choose the perfect plan for your needs. No hidden fees.</p>
      </div>

      <div className="flex flex-row flex-wrap gap-6 w-full max-w-6xl justify-center items-stretch pb-10">
        {plans.map((plan, i) => (
          <div 
            key={plan.name + i}
            className={`w-[280px] shrink-0 rounded-2xl flex flex-col p-8 relative transition-transform hover:-translate-y-2 duration-300 ${plan.isPopular ? 'shadow-2xl scale-105 z-10' : 'shadow-lg border'}`}
            style={
              plan.isPopular 
                ? { backgroundColor: plan.color, color: plan.textColor, border: `2px solid ${plan.color}` }
                : { backgroundColor: cSurface, borderColor: cPrimary + '33', color: textSurface }
            }
          >
            {plan.isPopular && (
              <div 
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg whitespace-nowrap"
                style={{ backgroundColor: cBg, color: textBg }}
              >
                <Zap size={14} style={{ color: plan.color }} />
                MOST POPULAR
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className={`text-sm mb-6 ${plan.isPopular ? 'opacity-90' : 'opacity-70'}`}>{plan.desc}</p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
              <span className={`text-sm ${plan.isPopular ? 'opacity-90' : 'opacity-70'}`}>/month</span>
            </div>
            
            <button 
              className={`w-full py-3 rounded-lg font-bold mb-8 transition-colors ${plan.isPopular ? 'shadow-lg' : ''}`}
              style={
                plan.isPopular 
                  ? { backgroundColor: cBg, color: textBg }
                  : { backgroundColor: plan.color, color: plan.textColor }
              }
            >
              Get Started
            </button>
            
            <div className="flex-1">
              <p className={`text-sm font-semibold mb-4 ${plan.isPopular ? 'opacity-95' : 'opacity-80'}`}>What's included:</p>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm">
                    <Check size={16} className={plan.isPopular ? 'opacity-100' : 'opacity-70'} style={{ color: plan.isPopular ? plan.textColor : plan.color }} />
                    <span className={plan.isPopular ? 'opacity-90' : 'opacity-80'}>
                      Feature number {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
