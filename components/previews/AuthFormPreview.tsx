import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';

export const AuthFormPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const cPrimary = colors[0]?.hex || '#000000';
  const cAccent = colors[1]?.hex || cPrimary;
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
      {/* Decorative background elements */}
      {colors.map((c, i) => {
        const top = [ '-10%', '60%', '20%', '80%', '40%', '10%', '70%', '30%', '90%', '50%' ][i % 10];
        const left = [ '-10%', '80%', '50%', '10%', '70%', '30%', '90%', '60%', '20%', '40%' ][i % 10];
        return (
          <div 
            key={i}
            className="absolute w-[40%] h-[40%] rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-500" 
            style={{ backgroundColor: c.hex, top, left }} 
          />
        );
      })}

      {/* Login Card */}
      <div 
        className="w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-xl border z-10 relative"
        style={{ backgroundColor: cSurface + 'E6', borderColor: cPrimary + '40', color: textSurface }}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: cPrimary, color: textPrimary }}>
            <Lock size={24} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="opacity-70 text-sm">Please enter your details to sign in.</p>
        </div>

        <form className="space-y-5" onSubmit={e => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium opacity-80">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-colors"
                style={{ backgroundColor: cBg, borderColor: cPrimary + '33', color: textBg }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium opacity-80">Password</label>
              <a href="#" className="text-xs hover:underline" style={{ color: cPrimary }}>Forgot password?</a>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-colors"
                style={{ backgroundColor: cBg, borderColor: cPrimary + '33', color: textBg }}
              />
            </div>
          </div>

          <button 
            className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
            style={{ backgroundColor: cPrimary, color: textPrimary }}
          >
            Sign in
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: cPrimary + '22' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2" style={{ backgroundColor: cSurface + 'E6', color: textSurface }}>Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg hover:bg-black/5 transition-colors"
              style={{ borderColor: cPrimary + '33' }}
            >
              <Github size={18} />
              GitHub
            </button>
            <button 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg hover:bg-black/5 transition-colors"
              style={{ borderColor: cPrimary + '33' }}
            >
              <span className="font-bold font-serif">G</span>
              Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm opacity-70">
          Don't have an account? <a href="#" className="font-medium hover:underline" style={{ color: cPrimary }}>Sign up</a>
        </p>
      </div>
    </div>
  );
};
