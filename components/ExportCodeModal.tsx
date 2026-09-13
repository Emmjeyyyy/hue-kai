import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Code, List } from 'lucide-react';
import { ColorData } from '../types';

interface ExportCodeModalProps {
  colors: ColorData[];
  onClose: () => void;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({ colors, onClose }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'css'>('list');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      <div className="w-full max-w-4xl h-[600px] max-h-[90vh] bg-chroma-black border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        
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
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-0">
          {activeTab === 'list' ? (
            <div className="flex flex-col md:flex-row gap-4 h-full">
              {renderListSection('HEX', 'hex')}
              {renderListSection('RGB', 'rgb')}
              {renderListSection('HSL', 'hsl')}
            </div>
          ) : (
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
        </div>
      </div>
    </div>,
    document.body
  );
};
