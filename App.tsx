
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Visualizer } from './components/Visualizer';
import { ControlPanel } from './components/ControlPanel';
import { AiAssistant } from './components/AiAssistant';
import { ALGORITHMS } from './lib/algorithms';
import { AlgorithmName, SimulationStep } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [selectedAlgoName, setSelectedAlgoName] = useState<AlgorithmName>(AlgorithmName.BubbleSort);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Simulation State
  const [inputDataStr, setInputDataStr] = useState<string>('');
  const [initialData, setInitialData] = useState<number[]>([]);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms delay

  // Use number for browser-based setInterval ID
  const timerRef = useRef<number | null>(null);

  // Initialize Algorithm
  const loadAlgorithm = useCallback((name: AlgorithmName, customData?: number[]) => {
    const algoDef = ALGORITHMS[name];
    const data = customData || [...algoDef.defaultData];
    
    setInitialData(data);
    setInputDataStr(data.join(', '));
    
    // Generate all steps upfront (deterministic)
    const generator = algoDef.generator(data);
    const generatedSteps: SimulationStep[] = [];
    let result = generator.next();
    while (!result.done) {
      generatedSteps.push(result.value);
      result = generator.next();
    }
    // Add final state if needed, but generator usually handles it.
    
    setSteps(generatedSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  // Initial Load
  useEffect(() => {
    loadAlgorithm(selectedAlgoName);
  }, [selectedAlgoName, loadAlgorithm]);

  // Playback Logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, steps.length, playbackSpeed]);

  const handleDataApply = () => {
    const newData = inputDataStr
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n))
      .slice(0, 20); // Limit to 20 items for visualization sanity

    if (newData.length > 0) {
      loadAlgorithm(selectedAlgoName, newData);
    }
  };

  const currentStep = steps[currentStepIndex] || null;
  const currentAlgoDef = ALGORITHMS[selectedAlgoName];
  const maxValue = Math.max(...(steps.length > 0 ? steps[0].data : initialData), 1);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 font-sans selection:bg-blue-500/30">
      <Sidebar 
        selectedAlgo={selectedAlgoName} 
        onSelect={setSelectedAlgoName} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Mobile Toggle + Title) */}
        <header className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-4">
             {!isSidebarOpen && (
               <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white">
                 <Menu size={24} />
               </button>
             )}
             <div>
               <h1 className="text-lg font-bold text-white">{currentAlgoDef.name}</h1>
               <p className="text-xs text-gray-500">{currentAlgoDef.category} • {currentAlgoDef.complexity.time}</p>
             </div>
           </div>
           
           <div className="hidden md:block">
              <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700 font-mono">
                {currentAlgoDef.complexity.time} Time
              </span>
           </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
            <div className="flex-1 relative p-4 md:p-8">
               <Visualizer 
                  step={currentStep} 
                  algorithm={selectedAlgoName}
                  category={currentAlgoDef.category} 
                  maxValue={maxValue}
               />
            </div>
            
            {/* Overlay Info (Description) */}
            <div className="absolute top-4 right-4 max-w-sm w-full pointer-events-none">
                <div className="bg-gray-900/80 backdrop-blur border border-gray-700 p-4 rounded-lg shadow-xl pointer-events-auto">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Operation</h3>
                    <p className="text-sm text-gray-200">
                        {currentStep?.description || "Ready to start..."}
                    </p>
                </div>
            </div>
        </main>

        {/* Controls */}
        <ControlPanel 
            isPlaying={isPlaying}
            togglePlay={() => setIsPlaying(!isPlaying)}
            reset={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
            }}
            stepForward={() => setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))}
            stepBackward={() => setCurrentStepIndex(prev => Math.max(prev - 1, 0))}
            speed={playbackSpeed}
            setSpeed={setPlaybackSpeed}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            dataInput={inputDataStr}
            onDataChange={setInputDataStr}
            onApplyData={handleDataApply}
        />
      </div>

      <AiAssistant algorithm={selectedAlgoName} currentStep={currentStep} />
    </div>
  );
};

export default App;
