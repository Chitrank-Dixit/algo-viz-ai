import React, { useState, useEffect, useRef } from 'react';
import { generateExplanation } from '../services/geminiService';
import { AlgorithmName, SimulationStep } from '../types';
import { Bot, Send, Sparkles, X, ChevronRight, Loader2 } from 'lucide-react';

interface AiAssistantProps {
  algorithm: AlgorithmName;
  currentStep: SimulationStep | null;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ algorithm, currentStep }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Hi! I'm your AI tutor. Ask me anything about ${algorithm} or the current simulation step!` }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat when algorithm changes
    setMessages([{ role: 'assistant', text: `Hi! I'm your AI tutor. Ask me anything about ${algorithm} or the current simulation step!` }]);
  }, [algorithm]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await generateExplanation(algorithm, currentStep, userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  const handleQuickAction = (action: string) => {
    let query = "";
    if (action === 'explain') query = "Explain what is happening in this specific step.";
    if (action === 'complexity') query = "What is the time and space complexity of this algorithm?";
    if (action === 'code') query = "Explain the pseudocode logic relevant to this step.";
    
    setInput(query);
    // Auto send for quick actions is often better UX, let's just populate for now or we can auto-call
    // Let's auto-call logic directly:
    const fakeEvent = { preventDefault: () => {} };
    // But we need to update state first. 
    // Simplified: just set input and let user press send, OR better:
    
    // We will execute it immediately:
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setLoading(true);
    generateExplanation(algorithm, currentStep, query).then(res => {
        setMessages(prev => [...prev, { role: 'assistant', text: res }]);
        setLoading(false);
    });
  };

  return (
    <>
      {/* Collapsed State Toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-2xl hover:bg-indigo-500 transition-all z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles size={24} />
      </button>

      {/* Main Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <div className="flex items-center gap-2">
                <Bot className="text-indigo-400" size={20} />
                <span className="font-bold text-gray-200">AI Tutor</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-800 text-gray-300 rounded-bl-none border border-gray-700'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-lg p-3 rounded-bl-none border border-gray-700 flex items-center gap-2 text-gray-400 text-sm">
                        <Loader2 className="animate-spin" size={14} />
                        Thinking...
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-2 px-4 flex gap-2 overflow-x-auto border-t border-gray-800 bg-gray-900">
            <button onClick={() => handleQuickAction('explain')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-xs text-indigo-400 hover:bg-gray-700 transition">
                Explain Step
            </button>
            <button onClick={() => handleQuickAction('complexity')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-xs text-indigo-400 hover:bg-gray-700 transition">
                Complexity
            </button>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="flex gap-2 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about the algorithm..."
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:text-indigo-400 disabled:opacity-50 hover:bg-gray-800 transition"
                >
                    <Send size={16} />
                </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
                AI can make mistakes. Check important info.
            </p>
        </div>
      </div>
    </>
  );
};
