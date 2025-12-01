import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Shuffle } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  togglePlay: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  currentStepIndex: number;
  totalSteps: number;
  dataInput: string;
  onDataChange: (val: string) => void;
  onApplyData: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  togglePlay,
  reset,
  stepForward,
  stepBackward,
  speed,
  setSpeed,
  currentStepIndex,
  totalSteps,
  dataInput,
  onDataChange,
  onApplyData
}) => {
  const generateRandom = () => {
      const count = 10;
      const randomData = Array.from({length: count}, () => Math.floor(Math.random() * 99) + 1);
      onDataChange(randomData.join(', '));
      // Small timeout to allow state to settle before applying? 
      // Actually parent needs to handle apply after change if we want immediate effect, 
      // but let's just populate input for user to click Set or we can expose a random handler.
      // For now, populate input is safest.
  };

  return (
    <div className="h-48 bg-gray-900 border-t border-gray-800 flex flex-col md:flex-row">
        {/* Left: Playback Controls */}
        <div className="flex-1 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-800">
            <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={reset} className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition" title="Reset">
                    <RotateCcw size={20} />
                </button>
                <button onClick={stepBackward} disabled={isPlaying || currentStepIndex <= 0} className="p-2 rounded-full hover:bg-gray-800 text-gray-400 disabled:opacity-30 hover:text-white transition">
                    <SkipBack size={20} />
                </button>
                <button 
                    onClick={togglePlay} 
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105 active:scale-95"
                >
                    {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1"/>}
                </button>
                <button onClick={stepForward} disabled={isPlaying || currentStepIndex >= totalSteps - 1} className="p-2 rounded-full hover:bg-gray-800 text-gray-400 disabled:opacity-30 hover:text-white transition">
                    <SkipForward size={20} />
                </button>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Slow</span>
                    <span>Speed: {speed}x</span>
                    <span>Fast</span>
                </div>
                <input 
                    type="range" 
                    min="100" 
                    max="1000" 
                    step="100"
                    // Reverse value because lower delay = faster speed
                    value={1100 - speed} 
                    onChange={(e) => setSpeed(1100 - parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>
        </div>

        {/* Center: Progress & Info */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800">
            <div className="text-center space-y-2 w-full max-w-xs">
                <div className="flex justify-between text-sm text-gray-400 font-mono">
                    <span>Step</span>
                    <span>{currentStepIndex} / {Math.max(0, totalSteps - 1)}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0}%` }}
                    />
                </div>
            </div>
        </div>

        {/* Right: Data Input */}
        <div className="flex-1 p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <label className="text-xs font-semibold text-gray-500 uppercase">Input Data</label>
               <button onClick={generateRandom} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                  <Shuffle size={12} /> Random
               </button>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={dataInput}
                    onChange={(e) => onDataChange(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="e.g. 10, 5, 8, 3"
                />
                <button 
                    onClick={onApplyData}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors border border-gray-700"
                >
                    Set
                </button>
            </div>
            <p className="text-[10px] text-gray-600">
                Note: Non-numeric values will be filtered out. Max 20 items.
            </p>
        </div>
    </div>
  );
};