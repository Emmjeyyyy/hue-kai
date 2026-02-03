import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ColorCard, CyberButton } from '../components/UI';
import { generatePalette } from '../utils/colorUtils';
import { ColorData, PaletteMode } from '../types';

export const Generator: React.FC = () => {
  const [colors, setColors] = useState<ColorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const generate = useCallback(() => {
    setLoading(true);
    // Simulate slight calculation delay for "heavy machinery" feel
    setTimeout(() => {
        setColors(prev => {
        // Define allowed modes for the generator
        const modes: PaletteMode[] = ['complementary', 'monochromatic', 'analogous', 'random'];
        const selectedMode = modes[Math.floor(Math.random() * modes.length)];

        const newPalette = generatePalette(selectedMode, 5);
        
        if (prev.length === 0) return newPalette;
        
        return prev.map((c, i) => {
            if (c.locked) return c;
            // Handle case where new palette might be shorter than current (though strictly 5 here)
            return newPalette[i] || newPalette[0]; 
        });
        });
        setLoading(false);
    }, 150);
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  // Spacebar shortcut with visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        // Prevent repeated calls if key is held down, but ensure visual state is set
        if (!e.repeat) {
          setIsSpacePressed(true);
          generate();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [generate]);

  const toggleLock = (index: number) => {
    setColors(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], locked: !copy[index].locked };
      return copy;
    });
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full w-full">
        
        {/* Controls Bar - Dedicated row to prevent overlap */}
        <div className="w-full flex justify-center py-6 bg-chroma-black border-b border-white/10 z-20">
            <div className="flex items-center gap-6 bg-black/60 backdrop-blur-md px-3 py-3 pr-4 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="hidden md:flex items-center justify-center text-xs font-mono text-gray-400 px-4 tracking-widest uppercase h-full pt-1">PRESS SPACEBAR</span>
            <CyberButton 
              onClick={generate} 
              pressed={isSpacePressed}
              className={`mb-2 ${loading ? 'animate-pulse' : ''}`}
            >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                GENERATE
            </CyberButton>
            </div>
        </div>

        {/* Color Columns */}
        <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden relative pb-4">
          {colors.map((color, index) => (
            <div 
                key={index} 
                className="flex-1 w-full md:w-auto h-full relative transition-all duration-300"
                style={{ transitionDelay: `${index * 50}ms` }}
            >
               <ColorCard 
                 color={color} 
                 onLock={() => toggleLock(index)}
                 fullHeight
               />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};