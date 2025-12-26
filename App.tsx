
import React, { useState } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AutomationGeneratorView from './views/AutomationGeneratorView';
import ChatbotView from './views/ChatbotView';
import ImageAnalysisView from './views/ImageAnalysisView';
import TTSView from './views/TTSView';
import LiveArchitectView from './views/LiveArchitectView';
import LogicSandboxView from './views/LogicSandboxView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.GENERATOR);

  const renderView = () => {
    switch (currentView) {
      case AppView.GENERATOR: return <AutomationGeneratorView />;
      case AppView.CHATBOT: return <ChatbotView />;
      case AppView.IMAGE_ANALYSIS: return <ImageAnalysisView />;
      case AppView.TTS: return <TTSView />;
      case AppView.LIVE_CONSULTANT: return <LiveArchitectView />;
      case AppView.LOGIC_SANDBOX: return <LogicSandboxView />;
      default: return <AutomationGeneratorView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFF] text-gray-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <Sidebar activeView={currentView} onNavigate={setCurrentView} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header activeView={currentView} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full relative">
            {renderView()}
          </div>
        </main>

        <footer className="px-10 py-3 border-t border-gray-50 bg-white/80 backdrop-blur-md flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] hidden sm:flex shrink-0">
          <span>AI Automation Architect • Enterprise Edition 2.5</span>
          <div className="flex gap-4">
             <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Logic Engine Online
             </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
