import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Aperture, Palette, Image as ImageIcon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'GENERATOR', icon: Palette, sub: 'ジェネレーター' },
    { path: '/extract', label: 'EXTRACTOR', icon: ImageIcon, sub: 'エクストラクター' },
    { path: '/wheel', label: 'WHEEL', icon: Aperture, sub: 'ホイール' },
  ];

  return (
    <div className="h-screen bg-chroma-black text-white font-sans selection:bg-chroma-accent selection:text-white flex flex-col overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(26,26,46,0.5),rgba(5,5,5,1))]"></div>
        <div className="absolute inset-0 scanlines opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chroma-yellow via-chroma-accent to-chroma-cyan opacity-80"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-chroma-yellow to-chroma-accent rounded-sm"></div>
            <h1 className="text-2xl font-bold tracking-tighter italic">
              HUE<span className="text-chroma-accent">//</span>KAI
            </h1>
          </div>

          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative px-6 py-2 group overflow-hidden transition-all duration-300
                  ${isActive ? 'text-chroma-yellow' : 'text-gray-400 hover:text-white'}
                `}
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold tracking-widest text-sm z-10">{item.label}</span>
                  <span className="text-[10px] font-mono opacity-50 z-10">{item.sub}</span>
                </div>
                {/* Hover/Active Background */}
                <div className={`absolute inset-0 bg-white/5 transform skew-x-12 transition-transform duration-300 ${location.pathname === item.path ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}></div>
                {/* Active Indicator */}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-chroma-yellow shadow-[0_0_10px_rgba(255,255,0,0.8)]"></div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 border-t border-white/10 backdrop-blur-lg flex justify-around py-2">
         {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-chroma-accent' : 'text-gray-500'}`}
            >
              <item.icon size={20} />
              <span className="text-[10px] mt-1 font-mono">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
};