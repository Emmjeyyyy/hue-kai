import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { ArrowRight, Sparkles, Palette, Layers, Cloud } from 'lucide-react';

export const LandingPagePreview: React.FC<{ colors: ColorData[], isDark: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const surfaceBg = isDark ? '#121215' : '#ffffff';
  const cardBg = isDark ? '#1c1c21' : '#f8f9fa';
  const textMain = isDark ? '#ececef' : '#18181b';
  
  // Hero section background uses c(0)
  const heroBg = c(0);
  const heroText = getTextColor(heroBg);
  const accentCol = c(1);
  const accentText = getTextColor(accentCol);

  const features = [
    { icon: Sparkles, title: 'AI-Powered Palettes', desc: 'Instantly generate cohesive color schemes with our advanced algorithms.' },
    { icon: Layers, title: 'Smart Extraction', desc: 'Pull dominant and vibrant colors directly from your favorite images.' },
    { icon: Palette, title: 'Seamless Export', desc: 'Copy variables for CSS, Tailwind, or JSON with a single click.' },
  ];

  return (
    <div
      className="w-full h-[600px] rounded-xl shadow-2xl overflow-hidden flex flex-col font-['Product_Sans',sans-serif]"
      style={{ backgroundColor: surfaceBg, color: textMain }}
    >
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        
        {/* Hero Section */}
        <div className="relative pb-24 transition-colors duration-500" style={{ backgroundColor: heroBg, color: heroText }}>
          


          {/* Nav */}
          <nav className="flex items-center justify-between px-8 h-16 relative z-20">
            <div className="font-extrabold text-lg flex items-center gap-1 tracking-tight">
              Huekai<span style={{ color: accentCol }}>.</span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-[11px] font-semibold tracking-wide opacity-80 hover:opacity-100">
              <span className="cursor-pointer">Product</span>
              <span className="cursor-pointer">Showcase</span>
              <span className="cursor-pointer">Community</span>
              <span className="cursor-pointer">Pricing</span>
              <span className="cursor-pointer">Sign in</span>
            </div>
            <button 
              className="px-4 py-1.5 rounded-md text-[11px] font-bold shadow-sm transition-transform hover:scale-105" 
              style={{ backgroundColor: accentCol, color: accentText }}
            >
              Start Creating
            </button>
          </nav>

          {/* Hero Content */}
          <div className="flex flex-col md:flex-row items-center px-8 py-10 max-w-5xl mx-auto relative z-20">
            {/* Left Text */}
            <div className="flex-1 w-full text-center md:text-left pt-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-[1.2] mb-4 tracking-tight">
                Design smarter with<br className="hidden md:block" /> algorithmic colors
              </h1>
              <p className="text-[12px] opacity-80 mb-6 max-w-sm mx-auto md:mx-0 leading-relaxed font-medium">
                Generate, extract, and export stunning palettes in seconds.<br/>
                Built for modern creative teams.
              </p>
              <button 
                className="px-6 py-2.5 rounded-md text-[12px] font-bold shadow-lg transition-transform hover:-translate-y-1" 
                style={{ backgroundColor: accentCol, color: accentText }}
              >
                Generate Palette <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>

            {/* Right Graphic (Isometric Blocks) */}
            <div className="flex-1 w-full relative h-[240px] mt-10 md:mt-0 hidden sm:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[180px] h-[180px] -mt-16">
                  {/* Decorative clouds surrounding the blocks */}
                  <div className="absolute top-[-30px] left-[-60px] opacity-20"><Cloud size={50} fill="currentColor" stroke="none" /></div>
                  <div className="absolute top-[40px] right-[-80px] opacity-15"><Cloud size={70} fill="currentColor" stroke="none" /></div>
                  <div className="absolute bottom-[-50px] left-[-20px] opacity-25"><Cloud size={40} fill="currentColor" stroke="none" /></div>
                  <div className="absolute bottom-[20px] left-[-90px] opacity-10"><Cloud size={30} fill="currentColor" stroke="none" /></div>
                  
                  {/* Bottom right clouds */}
                  <div className="absolute bottom-[-30px] right-[-50px] opacity-20"><Cloud size={45} fill="currentColor" stroke="none" /></div>
                  <div className="absolute bottom-[10px] right-[-90px] opacity-15"><Cloud size={35} fill="currentColor" stroke="none" /></div>

                  {/* Isometric Stack */}
                  {[2, 1, 0].map(i => (
                    <div 
                      key={i}
                      className="absolute w-full h-[120px] rounded-xl shadow-2xl transition-all duration-700"
                      style={{
                        top: `${i * 35}px`,
                        backgroundColor: c(i + 1) || '#fff',
                        transform: 'rotateX(60deg) rotateZ(-45deg)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {/* Faux details on the blocks */}
                      <div className="absolute right-3 bottom-3 flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      </div>
                      <div className="absolute left-3 top-3 w-1/3 h-1/2 rounded bg-black/5" />
                    </div>
                  ))}
                  

                </div>
              </div>
            </div>
          </div>

          {/* Wavy bottom divider */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-[60px] sm:h-[80px]" style={{ fill: surfaceBg }}>
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C60.27,24.89,141.5,48.78,206.8,55.22,246,59.13,284.7,59.8,321.39,56.44Z"></path>
            </svg>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-8 py-16 transition-colors duration-500" style={{ backgroundColor: surfaceBg }}>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold mb-2 tracking-tight">The ultimate color toolkit</h2>
            <p className="text-[13px] opacity-60 font-medium">Everything you need to craft the perfect brand identity.</p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <div 
                key={f.title} 
                className="text-left p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1 group relative overflow-hidden"
                style={{ backgroundColor: cardBg, borderColor: isDark ? '#333' : '#e5e7eb' }}
              >
                {/* Subtle gradient hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, transparent, ${c(i)})` }} />
                
                <div 
                  className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center shadow-inner relative z-10" 
                  style={{ backgroundColor: c(i), color: getTextColor(c(i)) }}
                >
                  <f.icon size={18} />
                </div>
                <h3 className="text-[14px] font-bold mb-2 relative z-10">{f.title}</h3>
                <p className="text-[11px] opacity-70 leading-relaxed font-medium relative z-10">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
