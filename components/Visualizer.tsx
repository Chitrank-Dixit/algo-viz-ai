import React from 'react';
import { SimulationStep, AlgoCategory } from '../types';

interface VisualizerProps {
  step: SimulationStep | null;
  category: AlgoCategory;
  maxValue: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ step, category, maxValue }) => {
  if (!step) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Press Play to Start Simulation
      </div>
    );
  }

  const { data, comparedIndices, swappedIndices, sortedIndices, pivotIndex, auxiliaryData } = step;

  // Data Structure Visualizer (Stack / Queue)
  if (category === AlgoCategory.DataStructure) {
      const isStack = step.description.includes('Stack') || step.description.includes('Push') || step.description.includes('Pop');
      // For Stack/Queue, we mostly care about 'auxiliaryData' which holds the actual structure state in our generator
      const structData = auxiliaryData || []; 

      if (isStack) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-end pb-12 gap-4">
                  <div className="text-gray-400 mb-4 font-mono">{step.description}</div>
                  <div className="border-l-4 border-r-4 border-b-4 border-gray-600 rounded-b-lg p-2 min-w-[120px] min-h-[200px] flex flex-col-reverse justify-start items-center gap-2 bg-gray-900/50">
                      {structData.map((val, idx) => (
                          <div key={idx} className="w-24 h-12 bg-indigo-600 rounded flex items-center justify-center text-white font-bold shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                              {val}
                          </div>
                      ))}
                      {structData.length === 0 && <div className="text-gray-600 my-auto text-sm">Empty</div>}
                  </div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest mt-2">Stack (Top)</div>
              </div>
          );
      } else {
          // Queue
          return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                <div className="text-gray-400 font-mono">{step.description}</div>
                <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 uppercase tracking-widest -rotate-90">Front</div>
                    <div className="flex items-center gap-2 border-t-2 border-b-2 border-dashed border-gray-700 p-4 min-h-[80px] min-w-[300px] overflow-x-auto bg-gray-900/30">
                        {structData.map((val, idx) => (
                            <div key={idx} className="min-w-[48px] h-12 bg-emerald-600 rounded flex items-center justify-center text-white font-bold shadow-lg animate-in fade-in slide-in-from-right-4 duration-300">
                                {val}
                            </div>
                        ))}
                         {structData.length === 0 && <div className="text-gray-600 mx-auto text-sm">Empty Queue</div>}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest -rotate-90">Back</div>
                </div>
            </div>
          );
      }
  }

  // Sorting Visualizer (Bar Chart style)
  if (category === AlgoCategory.Sorting) {
    return (
      <div className="w-full h-full flex items-end justify-center gap-1 p-4 pb-12">
        {data.map((value, idx) => {
          let colorClass = 'bg-blue-500'; // Default
          
          if (sortedIndices.includes(idx)) colorClass = 'bg-green-500';
          else if (swappedIndices.includes(idx)) colorClass = 'bg-red-500';
          else if (comparedIndices.includes(idx)) colorClass = 'bg-yellow-400';
          if (idx === pivotIndex) colorClass = 'bg-purple-500';

          const heightPercent = Math.max((value / maxValue) * 100, 5); // Ensure at least 5% height

          return (
            <div
              key={idx}
              className={`w-full max-w-[40px] rounded-t-sm transition-all duration-200 ease-in-out relative group ${colorClass}`}
              style={{ height: `${heightPercent}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Searching Visualizer (Box style)
  if (category === AlgoCategory.Searching) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-8">
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
            {data.map((value, idx) => {
                let borderColor = 'border-gray-600';
                let bgColor = 'bg-gray-800';
                let textColor = 'text-gray-300';

                // Check mid/found
                const isFound = sortedIndices.includes(idx); // reusing sortedIndices for 'found'
                const isActive = comparedIndices.includes(idx); 
                
                // Specific logic for our Binary Search generator mapping
                const isMid = comparedIndices.length >= 3 && comparedIndices[2] === idx;
                const isRange = comparedIndices.length >= 2 && idx >= comparedIndices[0] && idx <= comparedIndices[1];
                
                // Linear Search uses comparedIndices[0] for current check
                const isLinearCheck = comparedIndices.length === 1 && comparedIndices[0] === idx;

                if (isFound) {
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-500/20';
                    textColor = 'text-green-400';
                } else if (isMid) {
                    borderColor = 'border-yellow-500';
                    bgColor = 'bg-yellow-500/20';
                    textColor = 'text-yellow-400';
                } else if (isLinearCheck) {
                     borderColor = 'border-yellow-500';
                     bgColor = 'bg-yellow-500/20';
                } else if (isRange) {
                    borderColor = 'border-blue-500';
                    bgColor = 'bg-blue-900/20';
                } else {
                    // Dim out elements outside range if in binary search
                    if (comparedIndices.length > 1 && !isFound && !isRange && pivotIndex /* using pivotIndex arg for passing 'mid' context sometimes, but simpler to just check indices */) {
                       // Logic relies on generator passing correct range
                    }
                }

                return (
                    <div 
                        key={idx} 
                        className={`w-12 h-12 flex items-center justify-center border-2 rounded font-mono font-bold text-lg transition-all duration-300 ${borderColor} ${bgColor} ${textColor}`}
                    >
                        {value}
                        <span className="absolute -bottom-6 text-[10px] text-gray-500 border-none">{idx}</span>
                    </div>
                );
            })}
        </div>
        <div className="text-gray-400 text-sm mt-8">
            {step.description}
        </div>
      </div>
    );
  }

  return <div>Unknown Category</div>;
};