import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Minus } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ColorCard, CyberButton } from '../components/UI';
import { generatePalette } from '../utils/colorUtils';
import { ColorData, PaletteMode } from '../types';

export const Generator: React.FC = () => {
  const [colors, setColors] = useState<ColorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [count, setCount] = useState(5);

  const generate = useCallback(() => {
    setLoading(true);
    // Simulate slight calculation delay for "heavy machinery" feel
    setTimeout(() => {
        setColors(prev => {
            const modes: PaletteMode[] = ['complementary', 'monochromatic', 'analogous', 'random', 'cyberpunk', 'modern-ui', 'retro-future'];
            const selectedMode = modes[Math.floor(Math.random() * modes.length)];

            // Generate enough colors for the requested count
            const newPalette = generatePalette(selectedMode, count);
            
            // Merge logic: Preserve locked colors if they exist within the new count range
            const newColors: ColorData[] = [];
            for (let i = 0; i < count; i++) {
                if (i < prev.length && prev[i].locked) {
                    newColors.push(prev[i]);
                } else {
                    // Fill with new generated color
                    newColors.push(newPalette[i] || newPalette[0]);
                }
            }
            return newColors;
        });
        setLoading(false);
    }, 150);
  }, [count]);

  // Initial generation and auto-regeneration when count changes
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
      if (copy[index]) {
        copy[index] = { ...copy[index], locked: !copy[index].locked };
      }
      return copy;
    });
  };

  const handleCountChange = (delta: number) => {
      setCount(prev => {
          const next = prev + delta;
          if (next < 1) return 1;
          if (next > 10) return 10;
          return next;
      });
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full w-full">
        
        {/* Controls Bar - Dedicated row to prevent overlap */}
        <div className="w-full flex justify-center py-6 bg-chroma-black border-b border-white/10 z-20">
            <div className="flex items-center gap-4 md:gap-6 bg-black/60 backdrop-blur-md px-4 py-3 pr-4 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                
                {/* Count Controls */}
                <div className="flex items-center gap-2 md:gap-3 border-r border-white/10 pr-4 md:pr-6">
                    <button 
                        onClick={() => handleCountChange(-1)}
                        disabled={count <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors border border-white/5"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="font-mono font-bold text-lg w-6 text-center bg-[linear-gradient(135deg,#FFD700,#EF4444,#EC4899,#A855F7)] bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
                        {count}
                    </span>
                    <button 
                        onClick={() => handleCountChange(1)}
                        disabled={count >= 10}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors border border-white/5"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <span className="hidden lg:flex items-center justify-center text-xs font-mono text-gray-400 tracking-widest uppercase h-full pt-1 whitespace-nowrap">
                    PRESS SPACEBAR
                </span>
                
                <CyberButton 
                    onClick={() => generate()} 
                    pressed={isSpacePressed}
                    className={`mb-2 ${loading ? 'animate-pulse' : ''}`}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">GENERATE</span>
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