import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';

export const AuthFormPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0f0f11' : '#fafafa';
  const cardBg = isDark ? '#1a1a1f' : '#ffffff';
  const inputBg = isDark ? '#111114' : '#f7f7f8';
  const borderCol = isDark ? '#2a2a30' : '#e4e4e7';
  const textMain = isDark ? '#ececef' : '#18181b';
  const textMuted = isDark ? '#71717a' : '#a1a1aa';

  return (
    <div
      className="w-full h-[600px] rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden"
      style={{ backgroundColor: bg, color: textMain, fontFamily: '"Product Sans", sans-serif' }}
    >
      {/* Subtle gradient orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] -top-40 -right-40 pointer-events-none" style={{ backgroundColor: c(0) }} />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.06] -bottom-32 -left-32 pointer-events-none" style={{ backgroundColor: c(1) }} />

      <div className="w-full max-w-[380px] mx-4 z-10">
        {/* Card */}
        <div className="rounded-2xl border p-8 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderCol }}>
          {/* Header */}
          <div className="mb-7">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}>
              <Lock size={18} />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Welcome back</h2>
            <p className="text-[13px]" style={{ color: textMuted }}>Sign in to your account to continue</p>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[13px] font-medium transition-colors hover:opacity-80" style={{ borderColor: borderCol, color: textMain, backgroundColor: inputBg }}>
              <Github size={15} /> GitHub
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[13px] font-medium transition-colors hover:opacity-80" style={{ borderColor: borderCol, color: textMain, backgroundColor: inputBg }}>
              <Chrome size={15} /> Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: borderCol }} /></div>
            <div className="relative flex justify-center"><span className="text-[11px] px-3 font-medium" style={{ backgroundColor: cardBg, color: textMuted }}>or continue with email</span></div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="text-[12px] font-medium mb-1.5 block" style={{ color: textMuted }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-[13px] outline-none transition-colors"
                  style={{ backgroundColor: inputBg, borderColor: borderCol, color: textMain }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12px] font-medium" style={{ color: textMuted }}>Password</label>
                <a href="#" className="text-[11px] font-medium hover:underline" style={{ color: c(0) }}>Forgot?</a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-[13px] outline-none transition-colors"
                  style={{ backgroundColor: inputBg, borderColor: borderCol, color: textMain }}
                />
              </div>
            </div>

            <button
              className="w-full py-2.5 rounded-lg font-semibold text-[13px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-2"
              style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}
            >
              Sign in <ArrowRight size={15} />
            </button>
          </form>

          <p className="mt-6 text-center text-[12px]" style={{ color: textMuted }}>
            No account? <a href="#" className="font-semibold hover:underline" style={{ color: c(0) }}>Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
};
