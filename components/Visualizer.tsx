
import React from 'react';
import { SimulationStep, AlgoCategory, AlgorithmName } from '../types';
import { ArrowRight, MoveRight } from 'lucide-react';

interface VisualizerProps {
  step: SimulationStep | null;
  algorithm: AlgorithmName;
  category: AlgoCategory;
  maxValue: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ step, algorithm, category, maxValue }) => {
  if (!step) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Press Play to Start Simulation
      </div>
    );
  }

  const { data, comparedIndices, swappedIndices, sortedIndices, pivotIndex, auxiliaryData, graphAdjacency } = step;

  // Tree Visualizer
  if (category === AlgoCategory.Tree) {
    // Basic Layout calculation for a binary tree
    // We assume data is a level-order array
    const getCoords = (index: number, totalWidth: number, totalHeight: number) => {
        const level = Math.floor(Math.log2(index + 1));
        const nodesInLevel = Math.pow(2, level);
        const positionInLevel = index - (nodesInLevel - 1);
        
        // Simple fixed height levels or dynamic
        const y = 50 + level * 80;
        
        // Split width into 2^level parts
        const sliceWidth = totalWidth / nodesInLevel;
        const x = sliceWidth * positionInLevel + sliceWidth / 2;
        
        return { x, y };
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-between pb-4">
             {/* Tree SVG */}
             <div className="flex-1 w-full relative overflow-auto flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
                    {/* Edges */}
                    {data.map((_, idx) => {
                        const leftChildIdx = 2 * idx + 1;
                        const rightChildIdx = 2 * idx + 2;
                        const { x: x1, y: y1 } = getCoords(idx, 800, 500);
                        
                        const lines = [];
                        if (leftChildIdx < data.length) {
                             const { x: x2, y: y2 } = getCoords(leftChildIdx, 800, 500);
                             lines.push(<line key={`l-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4b5563" strokeWidth="2" />);
                        }
                        if (rightChildIdx < data.length) {
                             const { x: x2, y: y2 } = getCoords(rightChildIdx, 800, 500);
                             lines.push(<line key={`r-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4b5563" strokeWidth="2" />);
                        }
                        return lines;
                    })}

                    {/* Nodes */}
                    {data.map((val, idx) => {
                        const { x, y } = getCoords(idx, 800, 500);
                        let fillColor = '#1f2937'; // gray-900
                        let strokeColor = '#4b5563'; // gray-600
                        let textColor = '#9ca3af'; // gray-400
                        
                        if (sortedIndices.includes(idx)) {
                            fillColor = '#059669'; // emerald-600
                            strokeColor = '#34d399'; // emerald-400
                            textColor = '#ffffff';
                        } else if (comparedIndices.includes(idx)) {
                            fillColor = '#d97706'; // amber-600
                            strokeColor = '#fbbf24'; // amber-400
                            textColor = '#ffffff';
                        }
                        
                        return (
                            <g key={idx}>
                                <circle cx={x} cy={y} r="20" fill={fillColor} stroke={strokeColor} strokeWidth="2" className="transition-colors duration-300" />
                                <text x={x} y={y} dy=".3em" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold" className="pointer-events-none">{val}</text>
                            </g>
                        );
                    })}
                </svg>
             </div>
             
             {/* Traversal Output Display */}
             <div className="w-full max-w-2xl bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Traversal Output</h4>
                <div className="flex gap-2 flex-wrap">
                    {auxiliaryData && auxiliaryData.length > 0 ? (
                        auxiliaryData.map((val, i) => (
                            <span key={i} className="text-emerald-400 font-mono font-bold animate-in fade-in slide-in-from-bottom-2">
                                {val}{i < auxiliaryData.length - 1 ? ' → ' : ''}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-600 italic text-sm">Waiting to start...</span>
                    )}
                </div>
             </div>
        </div>
    );
  }

  // Graph Visualizer
  if (category === AlgoCategory.Graph) {
      // Circular Layout
      const centerX = 400;
      const centerY = 250;
      const radius = 180;
      const n = data.length;
      
      const getCoords = (index: number) => {
          const angle = (index / n) * 2 * Math.PI - Math.PI / 2; // Start from top
          return {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle)
          };
      };

      return (
        <div className="w-full h-full flex flex-col items-center justify-between pb-4">
             {/* Graph SVG */}
             <div className="flex-1 w-full relative overflow-auto flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
                    {/* Edges */}
                    {graphAdjacency && graphAdjacency.map((neighbors, u) => {
                         const { x: x1, y: y1 } = getCoords(u);
                         return neighbors.map(v => {
                             // Draw edge only if u < v to avoid duplicates in undirected graph drawing
                             if (u < v) {
                                 const { x: x2, y: y2 } = getCoords(v);
                                 return <line key={`${u}-${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth="2" />;
                             }
                             return null;
                         });
                    })}

                    {/* Nodes */}
                    {data.map((val, idx) => {
                        const { x, y } = getCoords(idx);
                        
                        let fillColor = '#1f2937'; // gray-900
                        let strokeColor = '#4b5563'; // gray-600
                        let textColor = '#9ca3af'; // gray-400
                        let scale = 1;

                        if (sortedIndices.includes(idx)) { // Using sortedIndices as 'Visited'
                            fillColor = '#059669'; // emerald-600
                            strokeColor = '#34d399'; // emerald-400
                            textColor = '#ffffff';
                        } 
                        
                        if (comparedIndices.includes(idx)) { // Using comparedIndices as 'Current/Active'
                            fillColor = '#d97706'; // amber-600
                            strokeColor = '#fbbf24'; // amber-400
                            textColor = '#ffffff';
                            scale = 1.1;
                        }
                        
                        return (
                            <g key={idx} className="transition-all duration-300" style={{ transformOrigin: `${x}px ${y}px`, transform: `scale(${scale})` }}>
                                <circle cx={x} cy={y} r="24" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
                                <text x={x} y={y} dy=".3em" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold" className="pointer-events-none">{val}</text>
                                {/* Index Label */}
                                <text x={x} y={y + 40} textAnchor="middle" fill="#4b5563" fontSize="10" className="pointer-events-none">idx: {idx}</text>
                            </g>
                        );
                    })}
                </svg>
             </div>

             {/* Queue/Stack State */}
             <div className="w-full max-w-2xl bg-gray-900/50 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Structure State</h4>
                    <div className="flex gap-2">
                        {auxiliaryData && auxiliaryData.length > 0 ? auxiliaryData.map((val, i) => (
                             <div key={i} className="bg-blue-900/50 border border-blue-700 text-blue-200 px-2 py-1 rounded text-xs font-mono">
                                 {data[val] ?? val}
                             </div>
                        )) : <span className="text-gray-600 text-sm">Empty</span>}
                    </div>
                </div>
                <div className="text-right">
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Visited Count</h4>
                    <span className="text-xl font-bold text-gray-300">{sortedIndices.length} / {data.length}</span>
                </div>
             </div>
        </div>
      );
  }

  // Data Structure Visualizer (Stack / Queue / Linked List)
  if (category === AlgoCategory.DataStructure) {
      if (algorithm === AlgorithmName.LinkedList) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center gap-12 overflow-x-auto">
                  <div className="text-gray-400 font-mono text-sm">{step.description}</div>
                  <div className="flex items-center gap-2 p-8 min-w-full justify-center">
                      <div className="text-xs text-gray-500 uppercase tracking-widest mr-4">Head</div>
                      {data.map((val, idx) => {
                          const isActive = comparedIndices.includes(idx);
                          const isModified = swappedIndices.includes(idx);
                          
                          let borderColor = 'border-gray-600';
                          let bgColor = 'bg-gray-800';
                          let textColor = 'text-white';
                          
                          if (isActive) {
                              borderColor = 'border-yellow-500';
                              bgColor = 'bg-yellow-500/20';
                          } else if (isModified) {
                              borderColor = 'border-green-500';
                              bgColor = 'bg-green-500/20';
                          }

                          return (
                              <React.Fragment key={idx}>
                                  <div className={`relative w-16 h-12 border-2 ${borderColor} ${bgColor} rounded flex items-center justify-center font-mono font-bold transition-all duration-300 shadow-lg`}>
                                      <span className={textColor}>{val}</span>
                                      <span className="absolute -bottom-5 text-[10px] text-gray-500">Node</span>
                                  </div>
                                  <MoveRight className="text-gray-600" size={24} />
                              </React.Fragment>
                          );
                      })}
                      <div className="px-3 py-1 rounded border border-gray-700 bg-gray-900 text-gray-500 text-xs font-mono">NULL</div>
                  </div>
              </div>
          );
      }

      const isStack = algorithm === AlgorithmName.StackOps;
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
