
import React from 'react';
import { SimulationStep, AlgoCategory, AlgorithmName } from '../types';
import { ArrowRight, MoveRight, ArrowBigDownDash } from 'lucide-react';

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

  // Array Operations (Rotation) Visualizer
  if (category === AlgoCategory.Array) {
    const bufferValue = auxiliaryData && auxiliaryData.length > 0 ? auxiliaryData[0] : null;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-12">
        {/* Buffer Area */}
        <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Temp Buffer</span>
            <div className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300 ${bufferValue !== null ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 scale-110 shadow-lg shadow-indigo-500/20' : 'border-gray-800 bg-gray-900/50 text-gray-700'}`}>
                {bufferValue !== null ? (
                    <span className="text-xl font-bold font-mono">{bufferValue}</span>
                ) : (
                    <span className="text-xs">Empty</span>
                )}
            </div>
            {bufferValue !== null && <ArrowBigDownDash className="text-indigo-500/50 animate-bounce" size={16} />}
        </div>

        {/* Array Display */}
        <div className="flex items-center gap-3">
            {data.map((value, idx) => {
                const isActive = comparedIndices.includes(idx);
                const isSwapped = swappedIndices.includes(idx);
                
                let borderColor = 'border-gray-700';
                let bgColor = 'bg-gray-800/50';
                let textColor = 'text-gray-300';
                let scale = 'scale-100';

                if (isActive) {
                    borderColor = 'border-yellow-500';
                    bgColor = 'bg-yellow-500/10';
                    textColor = 'text-yellow-400';
                    scale = 'scale-110';
                } else if (isSwapped) {
                    borderColor = 'border-emerald-500';
                    bgColor = 'bg-emerald-500/10';
                    textColor = 'text-emerald-400';
                }

                return (
                    <div 
                        key={idx} 
                        className={`relative w-16 h-16 border-2 rounded-lg flex items-center justify-center font-mono font-bold text-xl transition-all duration-300 ${borderColor} ${bgColor} ${textColor} ${scale}`}
                    >
                        {value}
                        <span className="absolute -bottom-6 text-[10px] text-gray-600 font-medium">[{idx}]</span>
                    </div>
                );
            })}
        </div>
        
        <div className="text-gray-400 text-sm font-medium bg-gray-900/80 px-4 py-2 rounded-full border border-gray-800 animate-in fade-in slide-in-from-bottom-2">
            {step.description}
        </div>
      </div>
    );
  }

  // Tree Visualizer
  if (category === AlgoCategory.Tree) {
    const getCoords = (index: number, totalWidth: number, totalHeight: number) => {
        const level = Math.floor(Math.log2(index + 1));
        const nodesInLevel = Math.pow(2, level);
        const positionInLevel = index - (nodesInLevel - 1);
        const y = 50 + level * 80;
        const sliceWidth = totalWidth / nodesInLevel;
        const x = sliceWidth * positionInLevel + sliceWidth / 2;
        return { x, y };
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-between pb-4">
             <div className="flex-1 w-full relative overflow-auto flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
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
                    {data.map((val, idx) => {
                        const { x, y } = getCoords(idx, 800, 500);
                        let fillColor = '#1f2937', strokeColor = '#4b5563', textColor = '#9ca3af';
                        if (sortedIndices.includes(idx)) { fillColor = '#059669'; strokeColor = '#34d399'; textColor = '#ffffff'; }
                        else if (comparedIndices.includes(idx)) { fillColor = '#d97706'; strokeColor = '#fbbf24'; textColor = '#ffffff'; }
                        return (
                            <g key={idx}>
                                <circle cx={x} cy={y} r="20" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
                                <text x={x} y={y} dy=".3em" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">{val}</text>
                            </g>
                        );
                    })}
                </svg>
             </div>
             <div className="w-full max-w-2xl bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="flex gap-2 flex-wrap">
                    {auxiliaryData && auxiliaryData.length > 0 && auxiliaryData.map((val, i) => (
                        <span key={i} className="text-emerald-400 font-mono font-bold">{val}{i < auxiliaryData.length - 1 ? ' → ' : ''}</span>
                    ))}
                </div>
             </div>
        </div>
    );
  }

  // Graph Visualizer
  if (category === AlgoCategory.Graph) {
      const centerX = 400, centerY = 250, radius = 180, n = data.length;
      const getCoords = (idx: number) => {
          const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
          return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
      };
      return (
        <div className="w-full h-full flex flex-col items-center justify-between pb-4">
             <div className="flex-1 w-full relative overflow-auto flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
                    {graphAdjacency && graphAdjacency.map((neighbors, u) => {
                         const { x: x1, y: y1 } = getCoords(u);
                         // Fix: Calculate x2 and y2 for each neighbor node v
                         return neighbors.map(v => {
                             if (u < v) {
                                 const { x: x2, y: y2 } = getCoords(v);
                                 return <line key={`${u}-${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth="2" />;
                             }
                             return null;
                         });
                    })}
                    {data.map((val, idx) => {
                        const { x, y } = getCoords(idx);
                        let fillColor = '#1f2937', strokeColor = '#4b5563', textColor = '#9ca3af', scale = 1;
                        if (sortedIndices.includes(idx)) { fillColor = '#059669'; strokeColor = '#34d399'; textColor = '#ffffff'; }
                        if (comparedIndices.includes(idx)) { fillColor = '#d97706'; strokeColor = '#fbbf24'; textColor = '#ffffff'; scale = 1.1; }
                        return (
                            <g key={idx} style={{ transformOrigin: `${x}px ${y}px`, transform: `scale(${scale})` }}>
                                <circle cx={x} cy={y} r="24" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
                                <text x={x} y={y} dy=".3em" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">{val}</text>
                            </g>
                        );
                    })}
                </svg>
             </div>
        </div>
      );
  }

  // Data Structure Visualizer
  if (category === AlgoCategory.DataStructure) {
      if (algorithm === AlgorithmName.LinkedList) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center gap-12 overflow-x-auto">
                  <div className="flex items-center gap-2 p-8 min-w-full justify-center">
                      {data.map((val, idx) => (
                          <React.Fragment key={idx}>
                              <div className={`relative w-16 h-12 border-2 ${comparedIndices.includes(idx) ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-600 bg-gray-800'} rounded flex items-center justify-center font-mono font-bold`}>
                                  <span>{val}</span>
                              </div>
                              <MoveRight className="text-gray-600" size={24} />
                          </React.Fragment>
                      ))}
                      <div className="px-3 py-1 rounded border border-gray-700 bg-gray-900 text-gray-500 text-xs">NULL</div>
                  </div>
              </div>
          );
      }
      const structData = auxiliaryData || []; 
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8">
            <div className="border-l-4 border-r-4 border-b-4 border-gray-600 rounded-b-lg p-2 min-w-[120px] min-h-[200px] flex flex-col-reverse justify-start items-center gap-2 bg-gray-900/50">
                {structData.map((val, idx) => (
                    <div key={idx} className="w-24 h-12 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">{val}</div>
                ))}
            </div>
        </div>
      );
  }

  // Sorting Visualizer
  if (category === AlgoCategory.Sorting) {
    return (
      <div className="w-full h-full flex items-end justify-center gap-1 p-4 pb-12">
        {data.map((value, idx) => {
          let colorClass = 'bg-blue-500';
          if (sortedIndices.includes(idx)) colorClass = 'bg-green-500';
          else if (swappedIndices.includes(idx)) colorClass = 'bg-red-500';
          else if (comparedIndices.includes(idx)) colorClass = 'bg-yellow-400';
          return <div key={idx} className={`w-full max-w-[40px] rounded-t-sm transition-all duration-200 ${colorClass}`} style={{ height: `${Math.max((value / maxValue) * 100, 5)}%` }} />;
        })}
      </div>
    );
  }

  // Searching Visualizer
  if (category === AlgoCategory.Searching) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-8">
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
            {data.map((value, idx) => (
                <div key={idx} className={`w-12 h-12 flex items-center justify-center border-2 rounded font-mono font-bold text-lg transition-all ${sortedIndices.includes(idx) ? 'border-green-500 bg-green-500/20 text-green-400' : comparedIndices.includes(idx) ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' : 'border-gray-600 bg-gray-800 text-gray-300'}`}>
                    {value}
                </div>
            ))}
        </div>
      </div>
    );
  }

  return <div>Unknown Category</div>;
};
