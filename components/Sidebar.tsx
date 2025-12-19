
import React from 'react';
import { AppView } from '../types';
import { 
  Workflow, 
  MessageCircle, 
  Eye, 
  Mic2, 
  Layers 
} from 'lucide-react';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: AppView.GENERATOR, label: 'Generator', icon: Workflow, color: 'text-blue-600' },
    { id: AppView.CHATBOT, label: 'Assistant', icon: MessageCircle, color: 'text-purple-600' },
    { id: AppView.IMAGE_ANALYSIS, label: 'Vision Scan', icon: Eye, color: 'text-green-600' },
    { id: AppView.TTS, label: 'Voice AI', icon: Mic2, color: 'text-orange-600' },
  ];

  return (
    <aside className="w-20 lg:w-72 bg-white border-r border-gray-100 flex flex-col h-full z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-indigo-100 shadow-lg text-white">
          <Layers size={22} />
        </div>
        <div className="hidden lg:block">
          <h2 className="font-bold text-xl text-gray-900 leading-none">AutoArchitect</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">v2.0 Beta</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 relative ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50/50' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full" />
              )}
              <Icon size={22} className={`${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className={`hidden lg:block font-semibold ${isActive ? 'translate-x-1' : ''} transition-transform`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-gray-50 rounded-2xl p-4 hidden lg:block border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">All Systems Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
