import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ColorCard } from '../components/UI';
import { createColorData, rgbToHex } from '../utils/colorUtils';
import { ColorData } from '../types';
import { converter, differenceEuclidean } from 'culori';

const oklch = converter('oklch');
const diff = differenceEuclidean('oklch');

export const ImageExtractor: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorData[]>([]);
  const [allCandidates, setAllCandidates] = useState<ColorData[]>([]);
  const [colorCount, setColorCount] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update palette whenever the count or candidates change
  useEffect(() => {
    if (allCandidates.length > 0) {
      setPalette(allCandidates.slice(0, colorCount));
    } else {
      setPalette([]);
    }
  }, [colorCount, allCandidates]);

  const processImage = (src: string) => {
    setIsAnalyzing(true);
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resize for performance (keep max dimension manageable)
      const maxDim = 150;
      const scale = Math.min(maxDim / img.width, maxDim / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const totalPixels = imageData.length / 4;
      
      // 1. Initial Quantization (RGB Binning)
      // Group similar colors into small buckets to reduce processing load
      const quantizeSize = 10; 
      const bins = new Map<string, {r:number, g:number, b:number, count:number}>();
      
      for (let i = 0; i < imageData.length; i += 4) {
        // Skip Transparent
        if (imageData[i + 3] < 128) continue;

        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        // Quantize
        const rQ = Math.round(r / quantizeSize) * quantizeSize;
        const gQ = Math.round(g / quantizeSize) * quantizeSize;
        const bQ = Math.round(b / quantizeSize) * quantizeSize;

        const key = `${rQ},${gQ},${bQ}`;
        const bin = bins.get(key);
        if (bin) {
            bin.r += r;
            bin.g += g;
            bin.b += b;
            bin.count++;
        } else {
            bins.set(key, { r, g, b, count: 1 });
        }
      }

      // 2. Convert to Analyzable Objects (Oklch)
      let colors = Array.from(bins.values()).map(bin => {
        // Average the color in the bin for precision
        const r = Math.round(bin.r / bin.count);
        const g = Math.round(bin.g / bin.count);
        const b = Math.round(bin.b / bin.count);
        
        const hex = rgbToHex(r, g, b);
        // Culori takes 0-1 range for RGB
        const colorObj = { mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 };
        const ok = oklch(colorObj) || { mode: 'oklch', l: 0, c: 0, h: 0 };
        
        return {
            hex,
            r, g, b,
            ok,
            count: bin.count
        };
      });

      // 3. Perceptual Clustering (Merging)
      // Sort by count first so we merge smaller clusters into larger dominant ones
      colors.sort((a, b) => b.count - a.count);

      const merged: typeof colors = [];
      const mergeThreshold = 0.08; // Oklch Euclidean distance threshold

      for (const c of colors) {
        let absorbed = false;
        for (const m of merged) {
            const d = diff(c.ok, m.ok);
            if (d < mergeThreshold) {
                m.count += c.count;
                // Keep the dominant color as the representative
                absorbed = true;
                break;
            }
        }
        if (!absorbed) merged.push(c);
      }

      // 4. Scoring Algorithm
      // Prioritize: 
      // - Frequency (Dominance)
      // - Saturation/Chroma (Visual Interest)
      // - Penalize extremely washed out or dark colors slightly to prefer "colors"
      const scored = merged.map(c => {
         const frequency = c.count / totalPixels;
         
         // Chroma Bonus: Boost score significantly for more colorful items
         // Oklch chroma typically ranges 0.0 - 0.3+
         const chromaBonus = 1 + (c.ok.c * 8); 
         
         // Lightness Penalty: Slight penalty for extreme black/white to favor mid-tones/colors
         let lightnessPenalty = 1;
         if (c.ok.l < 0.05 || c.ok.l > 0.98) lightnessPenalty = 0.6;
         
         const score = frequency * chromaBonus * lightnessPenalty;
         return { ...c, score };
      });

      // Sort by score
      scored.sort((a, b) => b.score - a.score);

      // 5. Distinct Selection
      // Ensure the final list doesn't have two colors that look too similar,
      // even if they were distinct enough to survive the initial merge.
      const finalCandidates: typeof scored = [];
      const outputThreshold = 0.12; // Stricter threshold for final display

      for (const c of scored) {
          let tooClose = false;
          for (const existing of finalCandidates) {
              if (diff(c.ok, existing.ok) < outputThreshold) {
                  tooClose = true;
                  break;
              }
          }
          if (!tooClose) {
              finalCandidates.push(c);
          }
          if (finalCandidates.length >= 20) break;
      }

      // Convert to app ColorData format
      const extracted: ColorData[] = finalCandidates.map(c => createColorData(c.hex));

      setAllCandidates(extracted);
      
      // Reset color count to default 5, or clamp to number of found colors if fewer
      const safeCount = Math.max(2, Math.min(5, extracted.length));
      setColorCount(safeCount);
      
      setIsAnalyzing(false);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageSrc(ev.target.result as string);
          processImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setImageSrc(ev.target.result as string);
                processImage(ev.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const maxAvailable = Math.min(10, allCandidates.length);

  const adjustCount = (delta: number) => {
    setColorCount(prev => {
        const next = prev + delta;
        // Clamp between 2 and max available (capped at 10)
        return Math.max(2, Math.min(maxAvailable, next));
    });
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 flex flex-col min-h-full w-full pb-20 md:pb-12 max-w-[1600px] mx-auto">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Title / Intro */}
        <div className="mb-8 text-center animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                IMAGE <span className="text-chroma-cyan">///</span> EXTRACTOR
            </h1>
            <p className="text-gray-400 font-mono text-sm">
                UPLOAD AN IMAGE TO EXTRACT ITS CHROMATIC DNA
            </p>
        </div>

        <div className="flex flex-col gap-12 w-full">
            
            {/* Primary Area: Upload / Image Preview */}
            <div className="w-full max-w-4xl mx-auto">
                <div 
                    className={`relative group border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-500 overflow-hidden min-h-[400px] w-full shadow-2xl
                        ${imageSrc 
                            ? 'border-chroma-cyan/30 bg-black/40' 
                            : 'border-white/10 bg-white/5 hover:border-chroma-accent/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,0,255,0.1)]'}
                    `}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {imageSrc ? (
                        <>
                            <div className="relative w-full h-full flex items-center justify-center p-8">
                                <img src={imageSrc} alt="Analysis Target" className="max-w-full max-h-[600px] object-contain shadow-lg rounded-lg" />
                            </div>
                            
                            <button 
                                onClick={() => { setImageSrc(null); setPalette([]); setAllCandidates([]); }}
                                className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md p-2 rounded-full text-white hover:text-red-500 border border-white/10 hover:border-red-500/50 transition-all"
                            >
                                <X size={20} />
                            </button>
                            
                            {/* Scanning Effect Overlay */}
                            {isAnalyzing && (
                                <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-chroma-cyan/20 to-transparent h-[10%] w-full animate-scanline pointer-events-none" />
                            )}
                            
                            <div className="absolute bottom-4 left-4 z-20 font-mono text-xs bg-black/80 backdrop-blur px-3 py-1.5 rounded text-chroma-cyan border border-chroma-cyan/30 flex items-center gap-2">
                                <div className="w-2 h-2 bg-chroma-cyan rounded-full animate-pulse"></div>
                                TARGET_LOCKED
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-12 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-chroma-accent/30">
                                <ImageIcon size={32} className="text-gray-400 group-hover:text-chroma-accent transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-chroma-accent transition-colors">DRAG & DROP IMAGE</h3>
                            <p className="text-sm text-gray-500 font-mono mb-8 max-w-xs mx-auto">
                                SUPPORTED FORMATS: JPG, PNG, WEBP
                            </p>
                            <label className="cursor-pointer relative overflow-hidden group/btn">
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <div className="px-8 py-3 bg-chroma-violet border border-chroma-accent/50 text-chroma-accent font-mono font-bold tracking-wider hover:bg-chroma-accent hover:text-black transition-all shadow-[0_0_15px_rgba(255,0,255,0.2)] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)] rounded-sm">
                                    BROWSE FILES
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Secondary Area: Results */}
            <div className={`w-full max-w-6xl mx-auto transition-all duration-700 ease-out ${palette.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {palette.length > 0 && (
                    <>
                        {/* Controls Bar for Results */}
                        <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-chroma-yellow to-chroma-accent"></div>
                                <h2 className="text-2xl font-bold tracking-wide">
                                    EXTRACTED PALETTE
                                </h2>
                            </div>
                            
                            {allCandidates.length > 0 && !isAnalyzing && (
                                <div className="flex items-center gap-4 bg-black/40 backdrop-blur rounded-full px-4 py-2 border border-white/10">
                                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest mr-2">Color Count</span>
                                    <button 
                                        onClick={() => adjustCount(-1)}
                                        disabled={colorCount <= 2}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="font-mono text-lg font-bold w-6 text-center text-chroma-cyan">{colorCount}</span>
                                    <button 
                                        onClick={() => adjustCount(1)}
                                        disabled={colorCount >= maxAvailable}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            )}
                            
                            {isAnalyzing && (
                                <div className="flex items-center gap-2 text-chroma-cyan font-mono text-sm animate-pulse">
                                    <Loader2 className="animate-spin" size={16} />
                                    PROCESSING_DATA...
                                </div>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {palette.map((color, i) => (
                                <div 
                                    key={`${i}-${color.hex}`} 
                                    className="animate-fadeIn opacity-0 fill-mode-forwards h-64 md:h-80" 
                                    style={{ animationDelay: `${i * 100}ms`, animationName: 'fadeIn' }}
                                >
                                    <ColorCard color={color} fullHeight />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fill-mode-forwards { animation-fill-mode: forwards; }
      `}</style>
    </Layout>
  );
};