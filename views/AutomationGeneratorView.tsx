
import React, { useState, useMemo } from 'react';
import { generateAutomation } from '../services/geminiService';
import { AutomationResult, Platform, AsyncState } from '../types';
import { Card } from '../components/ui/Card';
import { 
  Sparkles, 
  Loader2, 
  Play, 
  Code, 
  CheckCircle2, 
  Copy, 
  AlertCircle, 
  X,
  Info,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

const MIN_DESCRIPTION_LENGTH = 20;

const AutomationGeneratorView: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('zapier');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<AsyncState<AutomationResult>>({
    data: null,
    loading: false,
    error: null
  });

  const platforms: { id: Platform; label: string; tagline: string; logo: string; color: string; tooltip: string }[] = [
    { 
      id: 'zapier', 
      label: 'Zapier', 
      tagline: 'Simple SaaS triggers & actions',
      logo: 'https://placehold.co/80x80/FF4A00/FFF?text=Z', 
      color: 'bg-[#FF4A00]', 
      tooltip: 'The gold standard for simple app-to-app triggers and actions.' 
    },
    { 
      id: 'n8n', 
      label: 'n8n.io', 
      tagline: 'Complex node-based custom logic',
      logo: 'https://placehold.co/80x80/FF6D5A/FFF?text=n8n', 
      color: 'bg-[#FF6D5A]', 
      tooltip: 'Powerful node-based workflow automation for technical users.' 
    },
    { 
      id: 'make', 
      label: 'Make', 
      tagline: 'Visual mapping & branching',
      logo: 'https://placehold.co/80x80/8A2BE2/FFF?text=M', 
      color: 'bg-[#8A2BE2]', 
      tooltip: 'Visual automation with complex branching and sophisticated mapping.' 
    },
    { 
      id: 'langchain', 
      label: 'LangChain', 
      tagline: 'AI agents & LLM orchestration',
      logo: 'https://placehold.co/80x80/00A67E/FFF?text=LC', 
      color: 'bg-[#00A67E]', 
      tooltip: 'Framework for building advanced LLM-powered applications.' 
    },
    { 
      id: 'pipedream', 
      label: 'Pipedream', 
      tagline: 'Code-first serverless workflows',
      logo: 'https://placehold.co/80x80/191970/FFF?text=P', 
      color: 'bg-[#191970]', 
      tooltip: 'Integration platform for developers with serverless code execution.' 
    },
  ];

  const validation = useMemo(() => {
    const trimmed = description.trim();
    const length = trimmed.length;
    return {
      isEmpty: length === 0,
      isTooShort: length > 0 && length < MIN_DESCRIPTION_LENGTH,
      isValid: length >= MIN_DESCRIPTION_LENGTH,
      progress: Math.min(100, (length / MIN_DESCRIPTION_LENGTH) * 100),
      remaining: Math.max(0, MIN_DESCRIPTION_LENGTH - length)
    };
  }, [description]);

  const handleGenerate = async () => {
    if (!validation.isValid) return;
    setState({ ...state, loading: true, error: null });
    
    try {
      const data = await generateAutomation(platform, description);
      setState({ data, loading: false, error: null });
    } catch (err: any) {
      setState({ 
        data: null, 
        loading: false, 
        error: { message: err.message || "Failed to generate workflow." } 
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="xl:col-span-4 space-y-6">
        <Card title="Blueprint Input" subtitle="Define your architectural requirements">
          <div className="space-y-6">
            
            {state.error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-800 px-5 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <div className="flex-1 text-xs">
                  <h4 className="font-bold mb-0.5">Architectural Error</h4>
                  <p>{state.error.message}</p>
                </div>
                <button onClick={() => setState({ ...state, error: null })} className="p-1 hover:bg-red-100 rounded-lg">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">1. Ecosystem</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group min-h-[140px] justify-center text-center ${
                        isSelected 
                          ? 'bg-indigo-50/80 border-indigo-600 scale-[1.05] -translate-y-1 z-10 shadow-2xl shadow-indigo-200/80 ring-2 ring-indigo-500/20' 
                          : 'bg-white border-gray-100 hover:border-indigo-200 hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/5'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl overflow-hidden shadow-sm ${p.color} flex items-center justify-center mb-1.5 transition-transform duration-500 group-hover:scale-110 group-active:scale-95`}>
                        <img src={p.logo} alt={p.label} className="w-full h-full object-cover opacity-90" />
                      </div>
                      <span className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-indigo-800' : 'text-gray-700'}`}>
                        {p.label}
                      </span>
                      <span className={`text-[9px] font-bold leading-tight px-1 transition-colors ${isSelected ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {p.tagline}
                      </span>

                      {/* Tooltip Content */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-3.5 bg-gray-900 text-white text-[10px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 shadow-2xl border border-gray-700/50 backdrop-blur-md transform translate-y-2 group-hover:translate-y-0">
                        <div className="font-black text-indigo-400 uppercase tracking-[0.15em] mb-1.5 pb-1 border-b border-white/10 flex items-center gap-2">
                          <Info size={12} />
                          {p.label}
                        </div>
                        <div className="font-medium opacity-90 leading-relaxed text-left">
                          {p.tooltip}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">2. Logic Flow</label>
                <span className={`text-[10px] font-black uppercase ${validation.isValid ? 'text-green-500' : 'text-gray-400'}`}>
                  {description.length} / {MIN_DESCRIPTION_LENGTH}
                </span>
              </div>
              <textarea
                value={description}
                onBlur={() => setTouched(true)}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the automation logic in plain English..."
                className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 min-h-[160px] text-sm focus:ring-4 outline-none transition-all duration-300 ${
                  touched && !validation.isValid ? 'border-orange-200 focus:ring-orange-100' : 'border-gray-100 focus:ring-indigo-500/10 focus:border-indigo-500'
                }`}
              />
              <div className="min-h-[20px]">
                {touched && validation.isTooShort && (
                  <p className="text-[10px] text-orange-500 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <AlertTriangle size={12} />
                    Need {validation.remaining} more characters for quality results.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={state.loading || !validation.isValid}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all duration-500 ${
                state.loading || !validation.isValid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 active:scale-95 active:shadow-inner'
              }`}
            >
              {state.loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{state.loading ? 'Synthesizing...' : 'Generate Blueprint'}</span>
            </button>
          </div>
        </Card>
      </div>

      <div className="xl:col-span-8 space-y-6">
        {!state.data && !state.loading && (
          <div className="h-[480px] border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center bg-white/40 group hover:bg-white/60 transition-colors duration-500">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Play size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-300 uppercase tracking-[0.2em]">System Standby</h3>
            <p className="text-gray-400 text-sm max-w-xs mt-2 font-medium">Define your automation logic and choose an ecosystem to generate the technical blueprint.</p>
          </div>
        )}

        {state.loading && (
          <div className="h-[480px] bg-white border border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent animate-pulse" />
             <div className="relative flex flex-col items-center">
               <Loader2 size={40} className="animate-spin text-indigo-600 mb-6" />
               <p className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em] animate-bounce">Architecting Logic...</p>
             </div>
          </div>
        )}

        {state.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8 duration-700 items-start">
            <Card title="Logical Strategy" subtitle={`Optimization: ${state.data.platform}`}>
              <div className="relative">
                <p className="text-gray-700 text-sm italic mb-8 p-5 bg-indigo-50/50 rounded-2xl border-l-[6px] border-indigo-500 shadow-sm leading-relaxed">
                  "{state.data.explanation}"
                </p>
              </div>
              <div className="space-y-8 relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
                {state.data.steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-6 relative group">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                      step.type === 'trigger' ? 'bg-orange-500 shadow-orange-100' : 'bg-indigo-600 shadow-indigo-100'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-extrabold text-gray-900 leading-tight text-base mb-1">{step.title}</h4>
                      <p className="text-gray-500 text-xs font-medium leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-8">
              {state.data.codeSnippet && (
                <Card title="Technical Specs" headerAction={
                  <button 
                    onClick={() => copyToClipboard(state.data!.codeSnippet!)} 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100"
                  >
                    <Copy size={14} /> Copy
                  </button>
                }>
                  <div className="bg-[#0b0e14] p-6 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                    <pre className="text-indigo-400 font-mono text-[11px] leading-relaxed overflow-x-auto custom-scrollbar">
                      <code className="block py-2">{state.data.codeSnippet}</code>
                    </pre>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationGeneratorView;
