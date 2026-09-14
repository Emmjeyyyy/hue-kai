import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LayoutDashboard, LogIn, CreditCard, Box, RefreshCw, Moon, Sun, LayoutTemplate, Contact, Shapes, Smile } from 'lucide-react';
import { ColorData } from '../types';

import { DashboardPreview } from './previews/DashboardPreview';
import { AuthFormPreview } from './previews/AuthFormPreview';
import { PricingCardPreview } from './previews/PricingCardPreview';
import { CardPreview } from './previews/CardPreview';
import { LandingPagePreview } from './previews/LandingPagePreview';
import { BusinessCardPreview } from './previews/BusinessCardPreview';
import { ArtPreview } from './previews/ArtPreview';
import { AbstractFacesPreview } from './previews/AbstractFacesPreview';
import { MascotPreview } from './previews/MascotPreview';
import { Palette } from 'lucide-react';

interface PalettePreviewModalProps {
  colors: ColorData[];
  onClose: () => void;
}

const PREVIEWS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: DashboardPreview },
  { id: 'landing', label: 'Landing Page', icon: LayoutTemplate, component: LandingPagePreview },
  { id: 'business-card', label: 'Business Card', icon: Contact, component: BusinessCardPreview },
  { id: 'art', label: 'Geometric Art', icon: Palette, component: ArtPreview },
  { id: 'abstract-faces', label: 'Abstract Faces', icon: Shapes, component: AbstractFacesPreview },
  { id: 'mascot', label: 'Monster Mascot', icon: Smile, component: MascotPreview },
  { id: 'auth', label: 'Login Form', icon: LogIn, component: AuthFormPreview },
  { id: 'pricing', label: 'Pricing Cards', icon: CreditCard, component: PricingCardPreview },
  { id: 'card', label: 'Product Card', icon: Box, component: CardPreview },
];

export const getTextColor = (hex: string) => {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
};

export const PalettePreviewModal: React.FC<PalettePreviewModalProps> = ({ colors, onClose }) => {
  const [activePreview, setActivePreview] = useState(PREVIEWS[0].id);
  const [colorOffset, setColorOffset] = useState(0);
  const [isDark, setIsDark] = useState(false);
  
  const displayColors = [...colors.slice(colorOffset), ...colors.slice(0, colorOffset)];
  
  const ActiveComponent = PREVIEWS.find(p => p.id === activePreview)?.component || PREVIEWS[0].component;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-chroma-black border border-white/10 rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Left Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] flex flex-col">
          <div className="p-5 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="font-mono text-sm tracking-widest text-chroma-cyan uppercase">UI Preview</h2>
              <p className="text-xs text-white/50 mt-1">See your palette in action</p>
            </div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 rounded-full border border-white/10 bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto space-y-1">
            {PREVIEWS.map(preview => (
              <button
                key={preview.id}
                onClick={() => setActivePreview(preview.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono transition-all ${
                  activePreview === preview.id
                    ? 'bg-chroma-cyan/10 border-chroma-cyan/50 text-chroma-cyan'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                } border`}
              >
                <preview.icon size={16} />
                {preview.label}
              </button>
            ))}
          </div>

          {/* Mini palette strip at bottom of sidebar */}
          <div className="p-4 border-t border-white/10 flex items-center gap-3">
            <div className="flex h-6 w-full rounded-md overflow-hidden border border-white/10 flex-1">
              {displayColors.map((c, i) => (
                <div key={i} className="flex-1 transition-colors duration-300" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
            <button 
              onClick={() => setColorOffset(prev => (prev + 1) % colors.length)}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Rotate Colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Right Preview Area */}
        <div className="flex-1 relative bg-black/50">
           {/* Checkerboard subtle background */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} 
           />
           
           <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 md:p-12 relative z-10">
             <div className="w-full max-w-5xl shadow-2xl transition-all duration-500 ease-out animate-in zoom-in-95 fade-in">
               <ActiveComponent colors={displayColors} isDark={isDark} />
             </div>
           </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
