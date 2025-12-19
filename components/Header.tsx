
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  activeView: AppView;
}

const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const getTitle = () => {
    switch (activeView) {
      case AppView.GENERATOR: return 'Automation Generator';
      case AppView.CHATBOT: return 'AI Assistant';
      case AppView.IMAGE_ANALYSIS: return 'Visual Analysis';
      case AppView.TTS: return 'Speech Synthesizer';
      default: return 'Dashboard';
    }
  };

  const getSubtitle = () => {
    switch (activeView) {
      case AppView.GENERATOR: return 'Design complex AI workflows for Zapier, n8n, and more.';
      case AppView.CHATBOT: return 'Get instant answers and architectural advice from Gemini.';
      case AppView.IMAGE_ANALYSIS: return 'Extract information and insights from any image.';
      case AppView.TTS: return 'Transform text into natural-sounding speech with high fidelity.';
      default: return '';
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 shrink-0">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">{getTitle()}</h1>
        <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{getSubtitle()}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          Gemini 3 Pro Active
        </span>
      </div>
    </header>
  );
};

export default Header;
