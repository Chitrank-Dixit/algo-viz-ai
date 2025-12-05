import React from 'react';
import { ALGORITHMS } from '../lib/algorithms';
import { AlgorithmName, AlgoCategory } from '../types';
import { Activity, Search, BarChart2, Layers, Network, Share2 } from 'lucide-react';

interface SidebarProps {
  selectedAlgo: AlgorithmName;
  onSelect: (algo: AlgorithmName) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedAlgo, onSelect, isOpen, toggleSidebar }) => {
  return (
    <div 
      className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col h-full z-20`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-800 h-16">
        {isOpen && <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">AlgoViz</span>}
        <button onClick={toggleSidebar} className="p-1 rounded hover:bg-gray-800 text-gray-400">
           <Activity size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {Object.values(ALGORITHMS).map((algo: any) => {
             let Icon = BarChart2;
             if (algo.category === AlgoCategory.Searching) Icon = Search;
             if (algo.category === AlgoCategory.DataStructure) Icon = Layers;
             if (algo.category === AlgoCategory.Tree) Icon = Network;
             if (algo.category === AlgoCategory.Graph) Icon = Share2;

             return (
              <button
                key={algo.name}
                onClick={() => onSelect(algo.name)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  selectedAlgo === algo.name 
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon size={20} />
                {isOpen && <span className="truncate">{algo.name}</span>}
              </button>
            );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
            {isOpen ? "v1.2.0 • Powered by Gemini" : "v1.2"}
        </div>
      </div>
    </div>
  );
};