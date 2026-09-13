import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { BarChart3, Users, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, Search, Bell } from 'lucide-react';

export const DashboardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const c = (i: number) => colors[i % colors.length]?.hex || '#888';
  const bg = isDark ? '#0f0f11' : '#ffffff';
  const surface = isDark ? '#1a1a1f' : '#f7f7f8';
  const surfaceBorder = isDark ? '#2a2a30' : '#ebebee';
  const textMain = isDark ? '#ececef' : '#18181b';
  const textMuted = isDark ? '#71717a' : '#a1a1aa';
  const textSub = isDark ? '#a1a1aa' : '#71717a';

  const stats = [
    { label: 'Revenue', value: '$48.2K', change: '+12.5%', up: true, icon: TrendingUp },
    { label: 'Users', value: '2,847', change: '+8.1%', up: true, icon: Users },
    { label: 'Conversion', value: '3.24%', change: '-0.4%', up: false, icon: BarChart3 },
  ];

  const chartBars = [35, 58, 42, 78, 62, 90, 72, 85, 55, 68, 48, 92];

  const transactions = [
    { name: 'Sarah Chen', type: 'Payment', amount: '+$840.00', time: '2m ago' },
    { name: 'Alex Rivera', type: 'Refund', amount: '-$120.00', time: '15m ago' },
    { name: 'Jordan Lee', type: 'Payment', amount: '+$2,400.00', time: '1h ago' },
    { name: 'Maria Kim', type: 'Payment', amount: '+$380.00', time: '3h ago' },
  ];

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl flex" style={{ backgroundColor: bg, color: textMain, fontFamily: '"Product Sans", sans-serif' }}>
      {/* Sidebar */}
      <div className="w-56 hidden md:flex flex-col shrink-0 border-r" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
        <div className="h-14 flex items-center gap-2.5 px-5 border-b" style={{ borderColor: surfaceBorder }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ backgroundColor: c(0), color: getTextColor(c(0)) }}>H</div>
          <span className="font-semibold text-sm" style={{ color: textMain }}>Workspace</span>
        </div>
        <div className="flex-1 py-3 px-3 space-y-0.5">
          {['Overview', 'Analytics', 'Customers', 'Settings'].map((item, i) => (
            <div
              key={item}
              className="px-3 py-2 rounded-lg flex items-center gap-2.5 text-[13px] cursor-pointer transition-all"
              style={{
                backgroundColor: i === 0 ? c(0) + '14' : 'transparent',
                color: i === 0 ? c(0) : textSub,
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b shrink-0" style={{ borderColor: surfaceBorder }}>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none border"
              style={{ backgroundColor: surface, borderColor: surfaceBorder, color: textMain }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Bell size={16} style={{ color: textMuted }} />
            <div className="w-7 h-7 rounded-full" style={{ background: `linear-gradient(135deg, ${c(0)}, ${c(1)})` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="p-4 rounded-xl border" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: textMuted }}>{stat.label}</span>
                  <stat.icon size={14} style={{ color: c(i) }} />
                </div>
                <div className="text-2xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: stat.up ? c(0) : '#ef4444' }}>
                  {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                  <span style={{ color: textMuted }}> vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-sm font-semibold">Revenue Overview</div>
                <div className="text-[11px] mt-0.5" style={{ color: textMuted }}>Monthly performance</div>
              </div>
              <MoreHorizontal size={16} style={{ color: textMuted }} />
            </div>
            <div className="flex items-end gap-[6px] h-32">
              {chartBars.map((h, i) => (
                <div key={i} className="flex-1 rounded-t-[3px] transition-all hover:opacity-80" style={{ height: `${h}%`, backgroundColor: c(i), opacity: 0.85 }} />
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: surfaceBorder }}>
              <span className="text-sm font-semibold">Recent Transactions</span>
              <span className="text-[11px] font-medium" style={{ color: c(0) }}>View all</span>
            </div>
            {transactions.map((tx, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between border-b last:border-b-0" style={{ borderColor: surfaceBorder }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: c(i) + '18', color: c(i) }}>
                    {tx.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{tx.name}</div>
                    <div className="text-[11px]" style={{ color: textMuted }}>{tx.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-semibold" style={{ color: tx.amount.startsWith('+') ? c(0) : '#ef4444' }}>{tx.amount}</div>
                  <div className="text-[10px]" style={{ color: textMuted }}>{tx.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
