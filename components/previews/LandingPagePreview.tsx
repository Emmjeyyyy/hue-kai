import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { ArrowRight, Zap, Shield, Globe, ChevronRight } from 'lucide-react';

export const LandingPagePreview: React.FC<{ colors: ColorData[], isDark: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0f0f11' : '#ffffff';
  const surfaceBg = isDark ? '#1a1a1f' : '#f7f7f8';
  const borderCol = isDark ? '#2a2a30' : '#e4e4e7';
  const textMain = isDark ? '#ececef' : '#18181b';
  const textMuted = isDark ? '#71717a' : '#a1a1aa';

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized from the ground up for speed.' },
    { icon: Shield, title: 'Secure by Default', desc: 'Enterprise-grade security built in.' },
    { icon: Globe, title: 'Global Scale', desc: 'Deploy anywhere with one click.' },
  ];

  return (
    <div
      className="w-full h-[600px] rounded-xl shadow-2xl overflow-hidden flex flex-col border"
      style={{ backgroundColor: bg, color: textMain, borderColor: borderCol, fontFamily: '"Product Sans", sans-serif' }}
    >
      <div className="flex-1 overflow-auto custom-scrollbar">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 h-14 border-b shrink-0" style={{ borderColor: borderCol }}>
          <div className="flex items-center gap-2 text-sm font-bold">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: c(0) }} />
            HUe
          </div>
          <div className="hidden sm:flex items-center gap-5 text-[12px] font-medium" style={{ color: textMuted }}>
            <span className="cursor-pointer">Product</span>
            <span className="cursor-pointer">Pricing</span>
            <span className="cursor-pointer">Docs</span>
            <button className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold" style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}>
              Get started
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="relative overflow-hidden" style={{ backgroundColor: c(1) + '10' }}>
          <div className="absolute top-0 inset-x-0 h-px opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${c(1)}, transparent)` }} />
          <div className="px-6 py-16 text-center max-w-lg mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-6 border bg-white/5 backdrop-blur-sm" style={{ borderColor: borderCol, color: c(0) }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c(0) }} />
              Now available
              <ChevronRight size={10} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-[1.15]">
              Build faster with{' '}
              <span style={{ color: c(0) }}>better</span> tools
            </h1>

            <p className="text-[13px] leading-relaxed mb-8 max-w-sm mx-auto" style={{ color: textMuted }}>
              Ship quality products 10× faster. Trusted by thousands of teams worldwide.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button className="px-5 py-2.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 shadow-lg" style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}>
                Start free <ArrowRight size={13} />
              </button>
              <button className="px-5 py-2.5 rounded-lg text-[12px] font-semibold border bg-white/5 backdrop-blur-sm" style={{ borderColor: borderCol, color: textMain }}>
                Learn more
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-12 border-t" style={{ backgroundColor: surfaceBg, borderColor: borderCol }}>
          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {features.map((f, i) => (
              <div key={f.title} className="text-center">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: c(i) + '14', color: c(i) }}>
                  <f.icon size={20} />
                </div>
                <h3 className="text-[13px] font-semibold mb-1">{f.title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: textMuted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
