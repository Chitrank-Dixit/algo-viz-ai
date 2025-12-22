
import React, { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';

interface PseudocodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  algorithmName: string;
  pseudoCode: string;
}

export const PseudocodeModal: React.FC<PseudocodeModalProps> = ({ isOpen, onClose, algorithmName, pseudoCode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pseudoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
          <div className="flex items-center gap-2">
            <Code className="text-blue-400" size={20} />
            <h2 className="font-bold text-gray-100">{algorithmName} Pseudocode</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copied 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-950 font-mono text-sm leading-relaxed text-blue-100 selection:bg-blue-500/30">
          <pre className="whitespace-pre-wrap">
            {pseudoCode.trim().split('\n').map((line, i) => (
              <div key={i} className="group flex">
                <span className="w-8 text-gray-600 text-right mr-4 select-none group-hover:text-gray-400 transition-colors">
                  {i + 1}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 text-right">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700"
          >
            Close
          </button>
        </div>
      </div>

      {/* Backdrop Click */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
