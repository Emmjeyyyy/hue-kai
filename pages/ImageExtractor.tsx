import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Plus, Minus, Image as ImageIcon, Download, Eye, EyeOff } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ColorCard, CyberButton } from '../components/UI';
import { createColorData, rgbToHex } from '../utils/colorUtils';
import { ColorData } from '../types';
import { converter, differenceEuclidean } from 'culori';
import { jsPDF } from "jspdf";

const oklch = converter('oklch');
const diff = differenceEuclidean('oklch');

// Cache variables to preserve state when component unmounts (changing tabs)
let cachedImageSrc: string | null = null;
let cachedAllCandidates: ColorData[] = [];
let cachedColorCount: number = 5;

export const ImageExtractor: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(cachedImageSrc);
    const [palette, setPalette] = useState<ColorData[]>([]);
    const [allCandidates, setAllCandidates] = useState<ColorData[]>(cachedAllCandidates);
    const [colorCount, setColorCount] = useState(cachedColorCount);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [hoveredColorHex, setHoveredColorHex] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Sync state to cache
    useEffect(() => { cachedImageSrc = imageSrc; }, [imageSrc]);
    useEffect(() => { cachedAllCandidates = allCandidates; }, [allCandidates]);
    useEffect(() => { cachedColorCount = colorCount; }, [colorCount]);

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
        setShowSources(false); // Reset labels toggle for new image

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Reduce image size for performance while keeping enough detail
            // Bumped to 300 for higher physical coordinate accuracy
            const maxDim = 300;
            const scale = Math.min(maxDim / img.width, maxDim / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const totalPixels = imageData.length / 4;

            // 1. Initial Quantization (RGB Binning)
            // Group similar colors into small buckets to reduce processing load
            const quantizeSize = 10;
            const bins = new Map<string, { r: number, g: number, b: number, count: number, sumX: number, sumY: number, pixels: {x: number, y: number}[] }>();

            for (let i = 0; i < imageData.length; i += 4) {
                // Skip Transparent
                if (imageData[i + 3] < 128) continue;

                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];

                // Pixel coordinates
                const pixelIndex = i / 4;
                const px = pixelIndex % canvas.width;
                const py = Math.floor(pixelIndex / canvas.width);

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
                    bin.sumX += px;
                    bin.sumY += py;
                    bin.pixels.push({x: px, y: py});
                    bin.count++;
                } else {
                    bins.set(key, { r, g, b, count: 1, sumX: px, sumY: py, pixels: [{x: px, y: py}] });
                }
            }

            // 2. Convert to Analyzable Objects (Oklch)
            let colors = Array.from(bins.values()).map(bin => {
                // Average the color in the bin for precision
                const r = Math.round(bin.r / bin.count);
                const g = Math.round(bin.g / bin.count);
                const b = Math.round(bin.b / bin.count);

                const avgX = bin.sumX / bin.count;
                const hex = rgbToHex(r, g, b);
                // Culori takes 0-1 range for RGB
                const colorObj = { mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 };
                const ok = oklch(colorObj) || { mode: 'oklch', l: 0, c: 0, h: 0 };

                return {
                    hex,
                    r, g, b,
                    ok,
                    count: bin.count,
                    pixels: bin.pixels
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
                        for (let i = 0; i < c.pixels.length; i++) {
                            m.pixels.push(c.pixels[i]);
                        }
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
            const finalCandidates: (typeof scored[0] & { source?: { rx: number; ry: number } })[] = [];
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
                    let bestPx = c.pixels[0];
                    let maxDensity = -1;
                    
                    // Sample up to 100 pixels to find the densest area
                    const sampleSize = Math.min(100, c.pixels.length);
                    const step = Math.max(1, Math.floor(c.pixels.length / sampleSize));
                    const searchRadiusSq = 10 * 10;
                    
                    for (let i = 0; i < c.pixels.length; i += step) {
                        const candidate = c.pixels[i];
                        let density = 0;
                        const innerStep = Math.max(1, Math.floor(c.pixels.length / 500));
                        for (let j = 0; j < c.pixels.length; j += innerStep) {
                            const p = c.pixels[j];
                            const dx = p.x - candidate.x;
                            const dy = p.y - candidate.y;
                            if (dx * dx + dy * dy < searchRadiusSq) {
                                density++;
                            }
                        }
                        
                        if (density > maxDensity) {
                            maxDensity = density;
                            bestPx = candidate;
                        }
                    }
                    
                    const rx = bestPx.x / canvas.width;
                    const ry = bestPx.y / canvas.height;

                    finalCandidates.push({
                        ...c,
                        source: { rx, ry }
                    });
                }
                if (finalCandidates.length >= 20) break;
            }

            // Convert to app ColorData format
            const extracted: ColorData[] = finalCandidates.map(c => ({
                ...createColorData(c.hex),
                source: c.source
            }));

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
        const hexGroup = palette.map(color => color.hex).join(',');
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(hexGroup, 20, 42);

        const startY = 50;
        const margin = 20;
        const gutter = 10;

        // Layout Calculation
        // We'll use 2 columns if count > 5 to save vertical space, otherwise 1 column for big bold cards
        const useTwoColumns = palette.length > 5;
        const colCount = useTwoColumns ? 2 : 1;

        const availableWidth = pageWidth - (margin * 2) - ((colCount - 1) * gutter);
        const cardWidth = availableWidth / colCount;
        const rowGap = 10;

        const rowCount = Math.ceil(palette.length / colCount);
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxAvailableHeight = pageHeight - startY - margin;

        let cardHeight = useTwoColumns ? 35 : 50;
        if (rowCount * cardHeight + (rowCount - 1) * rowGap > maxAvailableHeight) {
            cardHeight = (maxAvailableHeight - (rowCount - 1) * rowGap) / rowCount;
        }

        palette.forEach((color, i) => {
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
            {/* Solid black background for Extractor page */}
            <div className="fixed inset-0 bg-chroma-black z-[-1]" />
            <div className="p-4 md:p-8 flex flex-col min-h-full w-full pb-32 md:pb-40 max-w-[1600px] mx-auto relative z-10">
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
                                    <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden">
                                        <div className="relative inline-block leading-none">
                                            <img src={imageSrc} alt="Analysis Target" className="max-w-full max-h-[600px] object-contain shadow-lg rounded-lg block" />
                                            {showSources && palette.map(color => {
                                                if (!color.source) return null;
                                                const isHovered = hoveredColorHex === color.hex;
                                                const isOtherHovered = hoveredColorHex && hoveredColorHex !== color.hex;
                                                
                                                return (
                                                    <div
                                                        key={color.hex}
                                                        className={`absolute w-0 h-0 z-40 transition-all duration-300 ${
                                                            isOtherHovered ? 'opacity-20 scale-75' : 
                                                            isHovered ? 'opacity-100 scale-125 z-50' : 
                                                            'opacity-100 scale-100'
                                                        }`}
                                                        style={{
                                                            left: `${color.source.rx * 100}%`,
                                                            top: `${color.source.ry * 100}%`,
                                                        }}
                                                    >
                                                        {/* Map Pin */}
                                                        <div 
                                                            className="absolute bottom-0 right-0 w-7 h-7 bg-[#111] rounded-full rounded-br-none rotate-45 origin-bottom-right flex items-center justify-center transition-all cursor-pointer hover:opacity-100"
                                                            style={{
                                                                boxShadow: isHovered ? `0 0 20px ${color.hex}` : 'none',
                                                                border: isHovered ? '2px solid white' : '2px solid #333'
                                                            }}
                                                            onMouseEnter={() => setHoveredColorHex(color.hex)}
                                                            onMouseLeave={() => setHoveredColorHex(null)}
                                                        >
                                                            {/* Inner Color */}
                                                            <div 
                                                                className="w-5 h-5 rounded-full border border-black/50"
                                                                style={{ backgroundColor: color.hex }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
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
                                <div className="flex flex-col md:flex-row items-center border-b border-white/10 pb-6 mb-8 gap-4">
                                    <div className="flex items-center gap-3 md:w-1/3">
                                        <div className="w-1 h-8 bg-gradient-to-b from-chroma-yellow to-chroma-accent"></div>
                                        <h2 className="text-2xl font-bold tracking-wide">
                                            EXTRACTED PALETTE
                                        </h2>
                                    </div>

                                    <div className="flex justify-center md:w-1/3">
                                        {!isAnalyzing ? (
                                            <div className="flex items-center gap-2 md:gap-4 bg-black/60 backdrop-blur-md px-4 py-3 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                                {allCandidates.length > 0 && (
                                                    <>
                                                        <div className="flex items-center gap-2 md:gap-3 border-r border-white/10 pr-4">
                                                            <CyberButton
                                                                onClick={() => adjustCount(-1)}
                                                                disabled={colorCount <= 2}
                                                                className="w-8 h-8 p-0 flex items-center justify-center rounded-full -translate-y-[3px]"
                                                                variant="dark"
                                                            >
                                                                <Minus size={14} />
                                                            </CyberButton>
                                                            <span className="select-none font-mono font-bold text-lg w-6 text-center bg-[linear-gradient(90deg,#FFFF00,#FFB347,#FF6961,#FF69B4,#DA70D6,#FFFF00)] bg-[length:200%_auto] animate-gradient-flow bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
                                                                {colorCount}
                                                            </span>
                                                            <CyberButton
                                                                onClick={() => adjustCount(1)}
                                                                disabled={colorCount >= maxAvailable}
                                                                className="w-8 h-8 p-0 flex items-center justify-center rounded-full -translate-y-[3px]"
                                                                variant="dark"
                                                            >
                                                                <Plus size={14} />
                                                            </CyberButton>
                                                        </div>
                                                    </>
                                                )}

                                                {palette.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <CyberButton
                                                            onClick={() => setShowSources(!showSources)}
                                                            className={`w-10 h-10 p-0 flex items-center justify-center rounded-full -translate-y-[3px] transition-colors ${showSources ? 'after:!border-chroma-cyan !text-chroma-cyan hover:!text-chroma-cyan' : 'text-gray-400 hover:text-white'}`}
                                                            variant="dark"
                                                            title="Toggle Source Markers"
                                                            pressed={showSources}
                                                        >
                                                            <Eye size={18} />
                                                        </CyberButton>
                                                        <CyberButton
                                                            onClick={exportToPDF}
                                                            className="w-10 h-10 p-0 flex items-center justify-center rounded-full -translate-y-[3px] text-gray-400 hover:text-white"
                                                            variant="dark"
                                                            title="Export to PDF"
                                                        >
                                                            <Download size={18} />
                                                        </CyberButton>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-chroma-cyan font-mono text-sm animate-pulse w-full">
                                                <Loader2 className="animate-spin" size={16} />
                                                PROCESSING_DATA...
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden md:block md:w-1/3"></div>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 pb-20">
                                    {palette.map((color, i) => (
                                        <div
                                            key={`${i}-${color.hex}`}
                                            className="animate-fadeIn opacity-0 fill-mode-forwards h-64 md:h-80"
                                            style={{ animationDelay: `${i * 100}ms`, animationName: 'fadeIn' }}
                                            onMouseEnter={() => setHoveredColorHex(color.hex)}
                                            onMouseLeave={() => setHoveredColorHex(null)}
                                        >
                                            <ColorCard color={color} fullHeight disableShades bordered />
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