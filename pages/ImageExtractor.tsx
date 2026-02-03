import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Plus, Minus } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ColorCard, CyberButton } from '../components/UI';
import { createColorData, rgbToHex } from '../utils/colorUtils';
import { ColorData } from '../types';

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

      // Resize for performance
      const maxDim = 150;
      const scale = Math.min(maxDim / img.width, maxDim / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts: { [key: string]: number } = {};
      
      // Simple quantization / frequency analysis
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue; // Skip transparent

        // Round to nearest 10 to group similar colors
        const round = (n: number) => Math.round(n / 20) * 20;
        const key = `${round(r)},${round(g)},${round(b)}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      
      // Take top 20 distinct colors to allow for adjustment up to max 10
      const extracted: ColorData[] = sorted.slice(0, 20).map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return createColorData(rgbToHex(r, g, b));
      });

      // Strict extraction: We rely solely on what was found in the image.
      // If fewer colors are found than expected, we handle it in the UI/State logic 
      // rather than injecting synthetic colors.

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
      <div className="p-4 md:p-8 flex flex-col min-h-full max-w-7xl mx-auto w-full pb-20 md:pb-8">
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Upload Area */}
            <div 
                className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden min-h-[300px] h-fit
                    ${imageSrc ? 'border-chroma-cyan/30 bg-black' : 'border-gray-700 bg-gray-900/50 hover:border-chroma-yellow hover:bg-gray-800'}
                `}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {imageSrc ? (
                    <>
                        <img src={imageSrc} alt="Analysis Target" className="max-w-full max-h-[500px] object-contain relative z-10" />
                        <button 
                            onClick={() => { setImageSrc(null); setPalette([]); setAllCandidates([]); }}
                            className="absolute top-4 right-4 z-20 bg-black/80 p-2 rounded-full text-white hover:text-red-500 border border-white/20"
                        >
                            <X size={20} />
                        </button>
                        {/* Scanning Effect Overlay */}
                        {isAnalyzing && (
                            <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-chroma-cyan/20 to-transparent h-[10%] w-full animate-scanline pointer-events-none" />
                        )}
                        <div className="absolute bottom-4 left-4 z-20 font-mono text-xs bg-black/60 px-2 py-1 rounded text-chroma-cyan border border-chroma-cyan/30">
                            TARGET_ACQUIRED
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8">
                        <Upload size={48} className="mx-auto text-gray-500 mb-4 animate-bounce" />
                        <p className="text-xl font-bold mb-2">DRAG IMAGE HERE</p>
                        <p className="text-sm text-gray-400 font-mono mb-6">OR UPLOAD FROM DEVICE</p>
                        <label className="cursor-pointer">
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            <span className="px-6 py-2 bg-chroma-violet border border-chroma-accent text-chroma-accent font-mono hover:bg-chroma-accent hover:text-black transition-colors">
                                SELECT FILE
                            </span>
                        </label>
                    </div>
                )}
            </div>

            {/* Right: Palette Display */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-chroma-yellow">///</span> ANALYSIS RESULT
                    </h2>
                    
                    {allCandidates.length > 0 && !isAnalyzing && (
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button 
                                onClick={() => adjustCount(-1)}
                                disabled={colorCount <= 2}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="font-mono text-sm w-8 text-center text-chroma-cyan">{colorCount}</span>
                            <button 
                                onClick={() => adjustCount(1)}
                                disabled={colorCount >= maxAvailable}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    )}
                    
                    {isAnalyzing && <Loader2 className="animate-spin text-chroma-cyan" />}
                </div>

                {palette.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {palette.map((color, i) => (
                            <div key={`${i}-${color.hex}`} className="animate-fadeIn opacity-0 fill-mode-forwards" style={{ animationDelay: `${i * 50}ms`, animationName: 'fadeIn' }}>
                                <ColorCard color={color} />
                            </div>
                        ))}
                     </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 font-mono text-sm border border-white/5 rounded-lg bg-white/5 min-h-[200px]">
                        <p>WAITING FOR INPUT STREAM...</p>
                        <div className="w-64 h-1 bg-gray-800 mt-4 overflow-hidden">
                            <div className="h-full bg-chroma-accent/50 w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fill-mode-forwards { animation-fill-mode: forwards; }
      `}</style>
    </Layout>
  );
};