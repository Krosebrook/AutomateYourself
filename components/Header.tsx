
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  activeView: AppView;
}

const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const getTitle = () => {
    switch (activeView) {
      case AppView.GENERATOR: return 'Automation Generator';
      case AppView.CHATBOT: return 'Advisor AI';
      case AppView.IMAGE_ANALYSIS: return 'Vision Extract';
      case AppView.TTS: return 'Voice Lab';
      case AppView.LIVE_CONSULTANT: return 'Live Architect';
      case AppView.LOGIC_SANDBOX: return 'Logic Sandbox';
      default: return 'Architect Console';
    }
  };

  const getSubtitle = () => {
    switch (activeView) {
      case AppView.GENERATOR: return 'Synthesize high-fidelity automation blueprints for any ecosystem.';
      case AppView.CHATBOT: return 'Interact with a fine-tuned Gemini model on automation patterns.';
      case AppView.IMAGE_ANALYSIS: return 'Reverse-engineer workflows from visual UI documentation.';
      case AppView.TTS: return 'Generate high-fidelity audio instructions for standard procedures.';
      case AppView.LIVE_CONSULTANT: return 'Engage in low-latency voice brainstorming with Gemini Native Audio.';
      case AppView.LOGIC_SANDBOX: return 'Stress-test logical branches and data payloads in a dry-run environment.';
      default: return '';
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 shrink-0">
      <div>
        <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">{getTitle()}</h1>
        <p className="text-[11px] md:text-xs text-gray-500 font-medium hidden sm:block uppercase tracking-widest">{getSubtitle()}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Gemini 3 Powered</span>
           <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Multi-Agent Protocol</span>
        </div>
        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
           <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
};

export default Header;
