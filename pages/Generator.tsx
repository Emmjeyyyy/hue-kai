import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Plus, Minus, SlidersHorizontal, Check, Download } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ColorCard, CyberButton } from '../components/UI';
import { generatePalette, sortColorsByVisualProgression } from '../utils/colorUtils';
import { ColorData, PaletteMode } from '../types';
import { jsPDF } from "jspdf";

// Define all available modes for the filter
const ALL_MODES: { value: PaletteMode; label: string }[] = [
    { value: 'random', label: 'Random Mix' },
    { value: 'smooth-gradient', label: 'Smooth Gradient' },
    { value: 'iridescent-flow', label: 'Iridescent Flow' },
    { value: 'neon-maximalist', label: 'Neon Maximalist' },
    { value: 'obsidian-highlight', label: 'Obsidian Highlight' },
    { value: 'noir-accent', label: 'Noir Accent' },
    { value: 'autumn-retro', label: 'Autumn Retro' },
    { value: 'industrial-concrete', label: 'Industrial Concrete' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'modern-ui', label: 'Modern UI' },
    { value: 'retro-future', label: 'Retro Future' },
    { value: 'warm-earth', label: 'Warm Earth' },
    { value: 'hyper-warm', label: 'Hyper Warm' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'monochromatic', label: 'Monochromatic' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'complementary', label: 'Complementary' },
    { value: 'split-complementary', label: 'Split Comp.' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'compound', label: 'Compound' },
    { value: 'shades', label: 'Shades' },
    { value: 'vaporwave', label: 'Vaporwave' },
    { value: 'synthwave', label: 'Synthwave' },
    { value: 'aurora', label: 'Aurora' },
    { value: 'neo-brutalist', label: 'Neo-Brutalist' },
    { value: 'glass-neon', label: 'Glass Neon' },
    { value: 'liquid-metal', label: 'Liquid Metal' },
    { value: 'forest-canopy', label: 'Forest Canopy' },
    { value: 'ocean-depths', label: 'Ocean Depths' },
    { value: 'royal-gold', label: 'Royal Gold' },
    { value: 'colorblind-safe', label: 'Colorblind Safe' },
    { value: 'high-contrast', label: 'High Contrast' },
    { value: 'deep-space', label: 'Deep Space' },
    { value: 'holographic', label: 'Holographic' },
    { value: 'midnight', label: 'Midnight' },
    { value: 'pastel-dream', label: 'Pastel Dream' },
    { value: 'nature-landscape', label: 'Nature Landscape' },
    { value: 'earth-and-sky', label: 'Earth & Sky' },
];

let cachedColors: ColorData[] = [];

export const Generator: React.FC = () => {
  const [colors, setColors] = useState<ColorData[]>(cachedColors);
  const [loading, setLoading] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [count, setCount] = useState(cachedColors.length > 0 ? cachedColors.length : 5);
  const [generationCount, setGenerationCount] = useState(0);
  
  // Filter State
  const [activeModes, setActiveModes] = useState<PaletteMode[]>(ALL_MODES.map(m => m.value));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cachedColors = colors;
  }, [colors]);

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMode = (mode: PaletteMode) => {
    setActiveModes(prev => {
        if (prev.includes(mode)) {
            // Prevent deselecting the last mode
            if (prev.length === 1) return prev;
            return prev.filter(m => m !== mode);
        } else {
            return [...prev, mode];
        }
    });
  };

  const toggleAllModes = () => {
      if (activeModes.length === ALL_MODES.length) {
          // If all selected, select only 'random'
          setActiveModes(['random']);
      } else {
          // Select all
          setActiveModes(ALL_MODES.map(m => m.value));
      }
  };

  const generateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(() => {
    setLoading(true);
    setGenerationCount(prev => prev + 1);
    
    if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current);
    }

    // Simulate slight calculation delay for "heavy machinery" feel
    generateTimeoutRef.current = setTimeout(() => {
        setColors(prev => {
            // 1. Identify Locked Colors to Keep
            const lockedColors = prev.slice(0, count).filter(c => c.locked);
            
            // 2. Calculate how many fresh colors we need
            const needed = count - lockedColors.length;
            
            // 3. Select Mode from Active Modes
            let selectedMode: PaletteMode = 'random';
            if (activeModes.length > 0) {
                const pool = [...activeModes];
                if (pool.includes('random')) {
                    pool.push('random', 'random');
                }
                selectedMode = pool[Math.floor(Math.random() * pool.length)];
            }

            // 4. Generate New Colors
            let generatedPalette = generatePalette(selectedMode, count);
            let newColors = generatedPalette.slice(0, needed);
            
            // Sort only the newly generated colors for visual coherence
            newColors = sortColorsByVisualProgression(newColors);
            
            // 5. Combine Locked + New while preserving exact positions
            const combined: ColorData[] = new Array(count);
            let newColorIndex = 0;
            
            for (let i = 0; i < count; i++) {
                if (prev[i] && prev[i].locked) {
                    combined[i] = prev[i];
                } else {
                    combined[i] = newColors[newColorIndex++];
                }
            }
            
            return combined;
        });
        setLoading(false);
    }, 150);
  }, [count, activeModes]);

  const isInitialMount = useRef(true);
  const prevCount = useRef(count);
  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        if (cachedColors.length === 0) {
            generate();
        }
    } else if (prevCount.current !== count) {
        prevCount.current = count;
        generate();
    }
  }, [count, generate]);

  // Spacebar shortcut with visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
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

  const handleColorChange = (index: number, newColor: ColorData) => {
    setColors(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...newColor, locked: copy[index].locked };
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HUEKAI // PALETTE", 20, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on ${date}`, 20, 32);

    // Hex Code Group String
    const hexGroup = colors.map(color => color.hex).join(',');
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(hexGroup, 20, 42);

    const startY = 50;
    const margin = 20;
    const gutter = 10;
    
    // Layout Calculation
    // We'll use 2 columns if count > 5 to save vertical space, otherwise 1 column for big bold cards
    const useTwoColumns = colors.length > 5;
    const colCount = useTwoColumns ? 2 : 1;
    
    const availableWidth = pageWidth - (margin * 2) - ((colCount - 1) * gutter);
    const cardWidth = availableWidth / colCount;
    const rowGap = 10;
    
    const rowCount = Math.ceil(colors.length / colCount);
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxAvailableHeight = pageHeight - startY - margin;
    
    let cardHeight = useTwoColumns ? 35 : 50;
    if (rowCount * cardHeight + (rowCount - 1) * rowGap > maxAvailableHeight) {
        cardHeight = (maxAvailableHeight - (rowCount - 1) * rowGap) / rowCount;
    }

    colors.forEach((color, i) => {
        const colIndex = i % colCount;
        const rowIndex = Math.floor(i / colCount);
        
        const x = margin + (colIndex * (cardWidth + gutter));
        const y = startY + (rowIndex * (cardHeight + rowGap));
        
        // Color Box
        doc.setFillColor(color.hex);
        doc.rect(x, y, cardWidth, cardHeight, "F");
        
        // White overlay for text area at the bottom of the card
        const textAreaHeight = useTwoColumns ? 12 : 16;
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y + cardHeight - textAreaHeight, cardWidth, textAreaHeight, "F");
        
        // Text
        doc.setTextColor(0);
        doc.setFont("courier", "bold");
        doc.setFontSize(useTwoColumns ? 10 : 12);
        
        // Hex Code
        doc.text(color.hex, x + 5, y + cardHeight - textAreaHeight + (useTwoColumns ? 8 : 11));
        
        // RGB (Right aligned)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(useTwoColumns ? 8 : 9);
        doc.setTextColor(80);
        const rgbText = `RGB: ${color.rgb}`;
        const rgbWidth = doc.getTextWidth(rgbText);
        doc.text(rgbText, x + cardWidth - rgbWidth - 5, y + cardHeight - textAreaHeight + (useTwoColumns ? 8 : 11));
    });
    
    doc.save("huekai-palette.pdf");
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full w-full">
        
        {/* Controls Bar */}
        <div className="w-full flex justify-center py-6 bg-chroma-black border-b border-white/10 z-20 relative">
            <div className="flex items-center gap-4 md:gap-6 bg-black/60 backdrop-blur-md px-4 py-3 pr-4 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                
                {/* Filter Button */}
                <div className="relative" ref={filterRef}>
                    <CyberButton
                         onClick={() => setIsFilterOpen(!isFilterOpen)}
                         className={`w-10 h-10 p-0 flex items-center justify-center rounded-full -translate-y-[3px] ${isFilterOpen ? 'after:!border-chroma-cyan text-chroma-cyan hover:text-chroma-cyan' : 'text-gray-400'}`}
                         variant="dark"
                         pressed={isFilterOpen}
                    >
                        <SlidersHorizontal size={18} />
                    </CyberButton>
                    
                    {/* Filter Popover */}
                    {isFilterOpen && (
                        <div className="absolute top-14 left-0 w-[350px] md:w-[600px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                             <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                 <span className="font-mono text-sm text-chroma-cyan tracking-widest">ACTIVE MODES</span>
                                 <button onClick={toggleAllModes} className="text-xs text-gray-400 hover:text-white underline">
                                     {activeModes.length === ALL_MODES.length ? 'RESET' : 'SELECT ALL'}
                                 </button>
                             </div>

                             <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                 <button
                                     onClick={() => toggleMode('random')}
                                     className={`
                                         col-span-3 flex items-center justify-between px-3 py-2 text-xs font-mono border rounded transition-all
                                         ${activeModes.includes('random') 
                                             ? 'bg-chroma-violet/50 border-chroma-cyan/50 text-white shadow-[0_0_5px_rgba(0,255,255,0.2)]' 
                                             : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'}
                                     `}
                                 >
                                     <span>Random Mix</span>
                                     {activeModes.includes('random') && <Check size={12} className="text-chroma-cyan" />}
                                 </button>
                                 {ALL_MODES.filter(m => m.value !== 'random').sort((a, b) => a.label.localeCompare(b.label)).map((mode) => (
                                     <button
                                         key={mode.value}
                                         onClick={() => toggleMode(mode.value)}
                                         className={`
                                             flex items-center justify-between px-3 py-2 text-xs font-mono border rounded transition-all
                                             ${activeModes.includes(mode.value) 
                                                 ? 'bg-chroma-violet/50 border-chroma-cyan/50 text-white shadow-[0_0_5px_rgba(0,255,255,0.2)]' 
                                                 : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'}
                                         `}
                                     >
                                         <span>{mode.label}</span>
                                         {activeModes.includes(mode.value) && <Check size={12} className="text-chroma-cyan" />}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* Count Controls */}
                <div className="flex items-center gap-2 md:gap-3 border-r border-l border-white/10 px-4 md:px-6">
                    <CyberButton 
                        onClick={() => handleCountChange(-1)}
                        disabled={count <= 1}
                        className="w-8 h-8 p-0 flex items-center justify-center rounded-full -translate-y-[3px]"
                        variant="dark"
                    >
                        <Minus size={14} />
                    </CyberButton>
                    <span className="select-none font-mono font-bold text-lg w-6 text-center bg-[linear-gradient(90deg,#FFFF00,#FFB347,#FF6961,#FF69B4,#DA70D6,#FFFF00)] bg-[length:200%_auto] animate-gradient-flow bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
                        {count}
                    </span>
                    <CyberButton 
                        onClick={() => handleCountChange(1)}
                        disabled={count >= 10}
                        className="w-8 h-8 p-0 flex items-center justify-center rounded-full -translate-y-[3px]"
                        variant="dark"
                    >
                        <Plus size={14} />
                    </CyberButton>
                </div>
                
                <CyberButton 
                    onClick={() => generate()} 
                    pressed={isSpacePressed}
                    className={`mb-2 ${loading ? 'animate-pulse' : ''}`}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">GENERATE</span>
                </CyberButton>

                {/* Export Button */}
                <CyberButton 
                    onClick={exportToPDF}
                    className="w-10 h-10 p-0 flex items-center justify-center rounded-full -translate-y-[3px] text-gray-400 hover:text-white"
                    variant="dark"
                >
                    <Download size={18} />
                </CyberButton>

            </div>
        </div>

        {/* Color Columns */}
        <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden relative">
          {colors.map((color, index) => (
            <div 
                key={index} 
                className="flex-1 w-full md:w-auto h-full relative transition-all duration-300"
                style={{ transitionDelay: `${index * 50}ms` }}
            >
               <ColorCard 
                 color={color} 
                 onLock={() => toggleLock(index)}
                 onColorChange={(newColor) => handleColorChange(index, newColor)}
                 fullHeight
                 resetTrigger={generationCount}
                 squareCorners
               />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};