import React from 'react';
import { ColorData } from '../../types';
import { getTextColor } from '../PalettePreviewModal';
import { BarChart3, Users, DollarSign, Activity, Bell, Search, Menu } from 'lucide-react';

export const DashboardPreview: React.FC<{ colors: ColorData[], isDark?: boolean }> = ({ colors, isDark }) => {
  const cPrimary = colors[0]?.hex || '#000000';
  const cSecondary = colors[1]?.hex || cPrimary;
  const cAccent = colors[2]?.hex || cSecondary;
  const cBg = isDark ? '#09090b' : '#ffffff';
  const cSurface = isDark ? '#18181b' : '#f8f9fa';
  
  const textPrimary = getTextColor(cPrimary);
  const textBg = isDark ? '#f9fafb' : '#111827';
  const textSurface = isDark ? '#f3f4f6' : '#111827';

  return (
    <div 
      className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl flex font-sans"
      style={{ backgroundColor: cBg, color: textBg }}
    >
      {/* Sidebar */}
      <div 
        className="w-64 hidden md:flex flex-col border-r opacity-95"
        style={{ backgroundColor: cSurface, borderColor: cPrimary + '33' }}
      >
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: cPrimary + '33' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold" style={{ backgroundColor: cPrimary, color: textPrimary }}>
            H
          </div>
          <span className="ml-3 font-bold text-lg" style={{ color: textSurface }}>HueDashboard</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          {['Analytics', 'Customers', 'Orders', 'Settings'].map((item, i) => (
            <div 
              key={item}
              className={`px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-1 ${i === 0 ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
              style={{ 
                backgroundColor: i === 0 ? colors[i % colors.length]?.hex + '22' : 'transparent', 
                color: i === 0 ? colors[i % colors.length]?.hex : textSurface, 
                fontWeight: i === 0 ? 'bold' : 'normal' 
              }}
            >
              {i === 0 && <BarChart3 size={18} />}
              {i === 1 && <Users size={18} />}
              {i === 2 && <DollarSign size={18} />}
              {i === 3 && <Activity size={18} />}
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: cPrimary + '22', backgroundColor: cBg }}>
          <div className="flex items-center gap-4">
            <Menu className="md:hidden" size={20} />
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-full outline-none text-sm"
                style={{ backgroundColor: cSurface, color: textSurface }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={20} className="opacity-70" />
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: cAccent }} />
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">Overview</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign },
              { label: 'Active Users', value: '2,350', change: '+180.1%', icon: Users },
              { label: 'Sales', value: '+12,234', change: '+19%', icon: Activity },
            ].map((stat, i) => (
              <div 
                key={stat.label}
                className="p-6 rounded-xl border"
                style={{ backgroundColor: cSurface, borderColor: cPrimary + '22', color: textSurface }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="opacity-70 text-sm">{stat.label}</div>
                  <stat.icon size={20} style={{ color: colors[(i + 1) % colors.length]?.hex || cSecondary }} />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm font-medium" style={{ color: cAccent }}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="w-full h-64 rounded-xl border p-6 flex flex-col" style={{ backgroundColor: cSurface, borderColor: cPrimary + '22' }}>
            <h3 className="font-bold mb-4" style={{ color: textSurface }}>Performance</h3>
            <div className="flex-1 flex items-end gap-2">
              {[40, 70, 45, 90, 65, 85, 100, 60, 45, 80, 50, 95].map((height, i) => (
                <div key={i} className="flex-1 group relative rounded-t-sm" style={{ height: `${height}%`, backgroundColor: colors[i % colors.length]?.hex || cPrimary }}>
                   <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
