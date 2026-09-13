import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Code, List, FileText, Download } from 'lucide-react';
import { ColorData } from '../types';
import { jsPDF } from 'jspdf';
import namer from 'color-namer';

interface ExportCodeModalProps {
  colors: ColorData[];
  onClose: () => void;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({ colors, onClose }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'css' | 'pdf'>('list');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const generatePdfDoc = () => {
    const doc = new jsPDF({ format: [216, 384] });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const margin = 20;
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HUEKAI // PALETTE", margin, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on ${date}`, margin, 32);

    // Hex Code Group String
    const hexGroup = colors.map(color => color.hex).join(',');
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(hexGroup, margin, 42);

    const startY = 55;
    const gutter = 10;
    
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
        
        // Hex Code and Name
        const nameAndHex = `${color.hex} | ${namer(color.hex).ntc[0].name}`;
        doc.text(nameAndHex, x + 5, y + cardHeight - textAreaHeight + (useTwoColumns ? 8 : 11));
        
        // RGB
        doc.setFont("helvetica", "normal");
        doc.setFontSize(useTwoColumns ? 8 : 9);
        doc.setTextColor(80);
        const rgbText = `RGB: ${color.rgb}`;
        const rgbWidth = doc.getTextWidth(rgbText);
        doc.text(rgbText, x + cardWidth - rgbWidth - 5, y + cardHeight - textAreaHeight + (useTwoColumns ? 8 : 11));
    });
    
    return doc;
  };

  React.useEffect(() => {
    if (activeTab === 'pdf') {
      const doc = generatePdfDoc();
      setPdfUri(doc.output('datauristring'));
    }
  }, [activeTab, colors]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCssCode = () => {
    const lines = colors.map((c, i) => {
      const varName = c.name ? c.name.toLowerCase().replace(/\s+/g, '-') : `color-${i + 1}`;
      return `  --color-${varName}: ${c.hex};`;
    });
    return `:root {\n${lines.join('\n')}\n}`;
  };

  const renderListSection = (title: string, format: 'hex' | 'rgb' | 'hsl') => {
    const values = colors.map(c => c[format]);
    const listText = values.join('\n');
    return (
      <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm tracking-wider">{title}</h3>
          <button
            onClick={() => handleCopy(listText, `all-${format}`)}
            className="text-xs flex items-center justify-center text-gray-400 hover:text-white transition-colors w-8 h-8 bg-white/5 rounded-md"
            title={`Copy all ${format.toUpperCase()}`}
          >
            {copiedId === `all-${format}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                <span className="font-mono text-sm">{c[format]}</span>
              </div>
              <button
                onClick={() => handleCopy(c[format], `${format}-${i}`)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all"
              >
                {copiedId === `${format}-${i}` ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[800px] max-h-[90vh] bg-chroma-black border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="font-mono text-sm tracking-widest text-chroma-cyan uppercase">Export Palette</h2>
            <p className="text-xs text-white/50 mt-1">Copy colors to your clipboard</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6 pt-4 gap-6 bg-white/[0.02]">
          <button 
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'list' ? 'border-chroma-cyan text-chroma-cyan' : 'border-transparent text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('list')}
          >
            <List size={16} /> List
          </button>
          <button 
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'css' ? 'border-chroma-yellow text-chroma-yellow' : 'border-transparent text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('css')}
          >
            <Code size={16} /> CSS
          </button>
          <button 
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pdf' ? 'border-chroma-magenta text-chroma-magenta' : 'border-transparent text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('pdf')}
          >
            <FileText size={16} /> PDF
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-0">
          {activeTab === 'list' && (
            <div className="flex flex-col md:flex-row gap-4 h-full">
              {renderListSection('HEX', 'hex')}
              {renderListSection('RGB', 'rgb')}
              {renderListSection('HSL', 'hsl')}
            </div>
          )}
          
          {activeTab === 'css' && (
            <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden shadow-inner flex flex-col h-full">
              <div className="flex justify-between items-center p-3 border-b border-white/10 bg-white/5">
                <span className="text-xs font-mono text-gray-400">variables.css</span>
                <button
                  onClick={() => handleCopy(getCssCode(), 'css-all')}
                  className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-md border border-white/10 hover:border-white/30"
                >
                  {copiedId === 'css-all' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  Copy Code
                </button>
              </div>
              <div className="p-6 overflow-auto custom-scrollbar flex-1">
                <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                  <span className="text-chroma-magenta">:root</span> {'{\n'}
                  {colors.map((c, i) => {
                    const varName = c.name ? c.name.toLowerCase().replace(/\s+/g, '-') : `color-${i + 1}`;
                    return (
                      <div key={i}>
                        <span className="text-chroma-cyan">  --color-{varName}</span>: 
                        <span className="text-chroma-yellow"> {c.hex}</span>;
                      </div>
                    );
                  })}
                  {'}'}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden shadow-inner flex flex-col h-full">
              <div className="flex-1 overflow-hidden bg-white/10 flex items-center justify-center">
                {pdfUri ? (
                  <iframe src={pdfUri} className="w-full h-full border-none" title="PDF Preview" />
                ) : (
                  <div className="animate-pulse text-white/50 text-sm">Generating Preview...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
