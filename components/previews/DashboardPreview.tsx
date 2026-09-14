import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { LayoutDashboard, Pipette, Palette, PieChart, Settings, Code, LogOut, ChevronDown, Circle, Search, Globe2, Sparkles } from 'lucide-react';

export const DashboardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0a0a0c' : '#f0f2f5';
  const cardBg = isDark ? '#141417' : '#ffffff';
  const textMain = isDark ? '#ececef' : '#000000';
  const textMuted = isDark ? '#71717a' : '#555555';
  const borderCol = isDark ? '#222228' : '#e5e7eb';

  // Sidebar background uses c(0)
  const sidebarBg = c(0);
  const sidebarText = getTextColor(c(0));

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl flex" style={{ backgroundColor: bg, fontFamily: '"Product Sans", sans-serif' }}>

      {/* Sidebar */}
      <div className="w-[160px] flex flex-col shrink-0" style={{ backgroundColor: sidebarBg, color: sidebarText }}>
        <div className="h-16 flex flex-col items-center justify-center mt-2 relative">
          <div className="absolute bottom-0 w-3/4 h-px bg-black/10" />
          <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: isDark ? '#fff' : '#000' }}>
            <Pipette size={18} style={{ color: isDark ? '#000' : '#fff' }} />
          </div>
          <span className="font-extrabold text-sm tracking-wide">Huekai</span>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-1 px-3">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Generator', icon: Sparkles },
            { name: 'Extractor', icon: Pipette },
            { name: 'Wheel', icon: Circle },
            { name: 'Gradient', icon: Palette },
          ].map((item, i) => (
            <div key={item.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/10 cursor-pointer text-[12px] font-semibold transition-colors" style={{ backgroundColor: i === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
              <item.icon size={15} />
              {item.name}
            </div>
          ))}
        </div>
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/10 rounded-lg cursor-pointer text-[12px] font-semibold">
            <LogOut size={15} />
            Log out
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between px-6 bg-white/50 backdrop-blur-sm border-b shrink-0" style={{ borderColor: borderCol, backgroundColor: cardBg }}>
          <h2 className="text-xl font-bold" style={{ color: textMain }}>Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors">
                <Search size={12} style={{ color: c(2) }} className="opacity-70 group-focus-within:opacity-100" />
              </div>
              <input
                type="text"
                placeholder="Search palettes, hex codes, keywords"
                className="pl-8 pr-4 py-1.5 text-[11px] font-medium rounded-full w-[260px] outline-none transition-all placeholder:opacity-60"
                style={{
                  backgroundColor: isDark ? '#222' : '#f3f4f6',
                  color: c(2),
                  border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`
                }}
              />
            </div>
            <div className="flex items-center">
              <Settings size={18} style={{ color: textMuted }} className="cursor-pointer hover:opacity-80 transition-opacity" />
              <div className="h-4 w-px mx-4" style={{ backgroundColor: borderCol }} />
              <div className="flex items-center gap-1.5 cursor-pointer">
                <div className="w-7 h-7 rounded-full shadow-sm" style={{ background: `linear-gradient(135deg, ${c(0)}, ${c(1) || c(0)})` }}>
                </div>
                <ChevronDown size={14} style={{ color: textMain }} />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden p-4">

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Palettes Gen', value: '1.2M', col: c(1) },
              { label: 'Colors Extracted', value: '8,402', col: c(2) },
              { label: 'Active Creators', value: '12k', col: c(3) },
              { label: 'Export Rate', value: '86%', col: c(4) || c(0) },
              { label: 'Pro Users', value: '3.4k', col: c(5) || c(1) },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-2.5 rounded-xl flex flex-col justify-center shadow-sm" style={{ backgroundColor: stat.col, color: getTextColor(stat.col) }}>
                <div className="text-[11px] font-bold mb-0.5 opacity-90">{stat.label}</div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Middle Row (Swapped Layout) */}
          <div className="grid grid-cols-12 gap-4 h-[210px] shrink-0">
            {/* Color Distribution Donut */}
            <div className="col-span-3 rounded-xl p-3 flex flex-col border shadow-sm items-center relative bg-white overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderCol }}>
              <div className="w-full flex justify-between items-center mb-2">
                <span className="text-[14px] font-extrabold" style={{ color: textMain }}>Distribution</span>
              </div>

              <div className="relative w-[110px] h-[110px] shrink-0 rounded-full mt-1" style={{
                background: `conic-gradient(${c(2)} 0% 45%, ${c(1)} 45% 75%, ${c(3)} 75% 85%, ${c(0)} 85% 100%)`
              }}>
                <div className="absolute inset-5 rounded-full flex flex-col items-center justify-center shadow-inner" style={{ backgroundColor: cardBg }}>
                  <span className="text-lg font-black leading-tight" style={{ color: textMain }}>RGB</span>
                  <span className="text-[9px] font-bold tracking-wider mt-0.5" style={{ color: textMuted }}>MODEL</span>
                </div>
              </div>

              <div className="mt-auto w-full grid grid-cols-2 gap-y-1 gap-x-2 text-[8px] font-bold tracking-wide" style={{ color: textMuted }}>
                <div className="flex items-center gap-1"><Circle size={5} fill={c(0)} stroke="none" /> WARM</div>
                <div className="flex items-center gap-1"><Circle size={5} fill={c(1)} stroke="none" /> COOL</div>
                <div className="flex items-center gap-1"><Circle size={5} fill={c(2)} stroke="none" /> NEUTRAL</div>
                <div className="flex items-center gap-1"><Circle size={5} fill={c(3)} stroke="none" /> ACCENT</div>
              </div>
            </div>

            {/* Transactions List -> Recent Exports */}
            <div className="col-span-4 rounded-xl p-3 flex flex-col border shadow-sm bg-white overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderCol }}>
              <span className="text-[14px] font-extrabold mb-3" style={{ color: textMain }}>Recent Exports</span>
              <div className="flex-1 flex flex-col gap-2">
                {[
                  { name: 'Neon Dreams', type: 'CSS', col: c(3), ext: '2m ago' },
                  { name: 'Forest Walk', type: 'TAILWIND', col: c(2), ext: '5m ago' },
                  { name: 'Ocean Breeze', type: 'JSON', col: c(1), ext: '15m ago' },
                  { name: 'Cyberpunk', type: 'CSS', col: c(3), ext: '1h ago' },
                  { name: 'Pastel Sunset', type: 'SCSS', col: c(0), ext: '3h ago' },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="font-bold" style={{ color: textMain }}>{tx.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="py-0.5 rounded text-[8px] font-black tracking-wider w-[52px] text-center shrink-0" style={{ backgroundColor: tx.col, color: getTextColor(tx.col) }}>{tx.type}</span>
                      <span className="font-semibold text-right w-10" style={{ color: textMuted }}>{tx.ext}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend -> Generation Trend */}
            <div className="col-span-5 rounded-xl p-3 flex flex-col border shadow-sm bg-white overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderCol }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[14px] font-extrabold" style={{ color: textMain }}>Gen Trend</span>
                <div className="flex gap-2 text-[8px] font-bold tracking-wider" style={{ color: textMuted }}>
                  <div className="flex items-center gap-1"><Circle size={6} fill={c(3)} stroke="none" /> AI</div>
                  <div className="flex items-center gap-1"><Circle size={6} fill={c(2)} stroke="none" /> EXTRACT</div>
                  <div className="flex items-center gap-1"><Circle size={6} fill={c(0)} stroke="none" /> MANUAL</div>
                </div>
              </div>

              <div className="flex-1 flex justify-between px-1 mt-auto pb-3 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-3">
                  {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full h-px" style={{ backgroundColor: isDark ? '#ffffff10' : '#00000008' }} />)}
                </div>
                {/* Bars */}
                {[
                  [45, 25, 15], [60, 40, 20], [50, 30, 15], [30, 20, 10], [55, 45, 25], [65, 50, 35], [40, 30, 15]
                ].map((bar, idx) => (
                  <div key={idx} className="flex gap-[2px] items-end h-[90px] relative z-10">
                    <div className="w-2 rounded-t-sm" style={{ height: `${bar[0]}%`, backgroundColor: c(3) }} />
                    <div className="w-2 rounded-t-sm" style={{ height: `${bar[1]}%`, backgroundColor: c(2) }} />
                    <div className="w-2 rounded-t-sm" style={{ height: `${bar[2]}%`, backgroundColor: c(0) }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 text-[10px] font-semibold" style={{ color: textMuted }}>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-4 h-[190px] shrink-0">
            {/* Global Usage */}
            <div className="rounded-xl p-3 flex flex-col border shadow-sm relative overflow-hidden bg-white" style={{ backgroundColor: cardBg, borderColor: borderCol }}>
              <div className="flex justify-between items-center z-10 mb-2">
                <span className="text-[14px] font-extrabold" style={{ color: textMain }}>Global Usage</span>
                <div className="flex gap-4 text-[8px] font-bold tracking-wider" style={{ color: textMuted }}>
                  <div className="flex items-center gap-1.5"><Circle size={6} fill={c(3)} stroke="none" /> WEB</div>
                  <div className="flex items-center gap-1.5"><Circle size={6} fill={c(1)} stroke="none" /> API</div>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col mt-2">
                <div className="flex-1 flex w-full">
                  {/* Y-Axis Labels */}
                  <div className="flex flex-col justify-between text-[8px] font-semibold pr-2 py-1 w-6 shrink-0 text-right" style={{ color: textMuted }}>
                    <span>10k</span>
                    <span>5k</span>
                    <span>0</span>
                  </div>
                  {/* Graph Area & X-Axis */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 relative border-l border-b" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                        {/* Web Line */}
                        <path
                          d="M 5 30 C 12.5 30, 12.5 20, 20 20 C 27.5 20, 27.5 25, 35 25 C 42.5 25, 42.5 8, 50 8 C 57.5 8, 57.5 28, 65 28 C 72.5 28, 72.5 12, 80 12 C 87.5 12, 87.5 22, 95 22"
                          fill="none"
                          stroke={c(3)}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-sm opacity-90"
                        />
                        {/* API Line */}
                        <path
                          d="M 5 25 C 12.5 25, 12.5 28, 20 28 C 27.5 28, 27.5 18, 35 18 C 42.5 18, 42.5 15, 50 15 C 57.5 15, 57.5 22, 65 22 C 72.5 22, 72.5 28, 80 28 C 87.5 28, 87.5 10, 95 10"
                          fill="none"
                          stroke={c(1)}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-sm opacity-80"
                        />
                        {/* Web Dots (Peaks only) */}
                        {[
                          [50, 8]
                        ].map((pt, i) => (
                          <circle key={`w-${i}`} cx={pt[0]} cy={pt[1]} r="1.5" fill={cardBg} stroke={c(3)} strokeWidth="1" />
                        ))}
                        {/* API Dots (Peaks only) */}
                        {[
                          [95, 10]
                        ].map((pt, i) => (
                          <circle key={`a-${i}`} cx={pt[0]} cy={pt[1]} r="1.5" fill={cardBg} stroke={c(1)} strokeWidth="1" />
                        ))}
                      </svg>
                    </div>
                    {/* X-Axis Labels */}
                    <div className="relative w-full h-3 mt-1.5">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <span key={day} className="absolute text-[8px] font-semibold -translate-x-1/2" style={{ left: `${5 + i * 15}%`, color: textMuted }}>
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Logs */}
            <div className="rounded-xl p-3 flex flex-col border shadow-sm bg-white overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderCol }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[14px] font-extrabold" style={{ color: textMain }}>System Logs</span>
              </div>
              <div className="flex gap-2 mb-3 text-[10px] font-bold">
                <span className="px-2.5 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: c(3), color: getTextColor(c(3)) }}>All</span>
                <span className="px-2.5 py-0.5 rounded-full border transition-colors hover:bg-black/5 cursor-pointer" style={{ borderColor: c(1), color: c(1) }}>Errors</span>
                <span className="px-2.5 py-0.5 rounded-full border transition-colors hover:bg-black/5 cursor-pointer" style={{ borderColor: c(2), color: c(2) }}>Warnings</span>
                <span className="px-2.5 py-0.5 rounded-full border transition-colors hover:bg-black/5 cursor-pointer" style={{ borderColor: c(0), color: c(0) }}>Info</span>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                {[
                  { user: 'api.huekai.com', issue: 'Rate limit exceeded', status: 'WARN', col: c(2) },
                  { user: 'worker-01', issue: 'Model inference', status: 'ERROR', col: c(1) },
                  { user: 'web-client', issue: 'Cache invalidated', status: 'INFO', col: c(0) },
                  { user: 'api.huekai.com', issue: 'High latency', status: 'WARN', col: c(2) },
                ].map((ticket, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <Circle size={8} fill={c(3)} stroke="none" />
                      <span className="font-medium" style={{ color: textMuted }}>{ticket.user}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold w-[110px]" style={{ color: textMain }}>{ticket.issue}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide w-[40px] inline-flex items-center justify-center" style={{ backgroundColor: ticket.col, color: getTextColor(ticket.col) }}>{ticket.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
