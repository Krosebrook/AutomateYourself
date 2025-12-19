
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
      tagline: 'Simple SaaS triggers',
      logo: 'https://placehold.co/80x80/FF4A00/FFF?text=Z', 
      color: 'bg-[#FF4A00]', 
      tooltip: 'The gold standard for simple app-to-app triggers and actions.' 
    },
    { 
      id: 'n8n', 
      label: 'n8n.io', 
      tagline: 'Complex custom logic',
      logo: 'https://placehold.co/80x80/FF6D5A/FFF?text=n8n', 
      color: 'bg-[#FF6D5A]', 
      tooltip: 'Powerful node-based workflow automation for technical users.' 
    },
    { 
      id: 'make', 
      label: 'Make', 
      tagline: 'Visual data mapping',
      logo: 'https://placehold.co/80x80/8A2BE2/FFF?text=M', 
      color: 'bg-[#8A2BE2]', 
      tooltip: 'Visual automation with complex branching and sophisticated mapping.' 
    },
    { 
      id: 'langchain', 
      label: 'LangChain', 
      tagline: 'AI agents & LLMs',
      logo: 'https://placehold.co/80x80/00A67E/FFF?text=LC', 
      color: 'bg-[#00A67E]', 
      tooltip: 'Framework for building advanced LLM-powered applications.' 
    },
    { 
      id: 'pipedream', 
      label: 'Pipedream', 
      tagline: 'Code-first APIs',
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {platforms.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all group min-h-[120px] justify-center ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-600 scale-105 z-10 shadow-md' 
                          : 'bg-white border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl overflow-hidden shadow-sm ${p.color} flex items-center justify-center mb-1`}>
                        <img src={p.logo} alt={p.label} className="w-full h-full object-cover opacity-90" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? 'text-indigo-700' : 'text-gray-500'}`}>
                        {p.label}
                      </span>
                      <span className={`text-[8px] font-bold leading-tight text-center px-1 transition-colors ${isSelected ? 'text-indigo-500/80' : 'text-gray-300'}`}>
                        {p.tagline}
                      </span>

                      {/* Tooltip Content */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 shadow-2xl border border-gray-700/50 backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0">
                        <div className="font-black text-indigo-400 uppercase tracking-widest mb-1 pb-1 border-b border-white/10">
                          {p.label}
                        </div>
                        <div className="font-medium opacity-80 leading-relaxed text-left">
                          {p.tooltip}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
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
                className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 min-h-[160px] text-sm focus:ring-2 outline-none transition-all ${
                  touched && !validation.isValid ? 'border-orange-200 focus:ring-orange-100' : 'border-gray-100 focus:ring-indigo-500'
                }`}
              />
              <div className="min-h-[20px]">
                {touched && validation.isTooShort && (
                  <p className="text-[10px] text-orange-500 font-bold flex items-center gap-2">
                    <AlertTriangle size={12} />
                    Need {validation.remaining} more characters for quality results.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={state.loading || !validation.isValid}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
                state.loading || !validation.isValid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95'
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
          <div className="h-[480px] border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/40">
            <Play size={48} className="text-indigo-200 mb-6" />
            <h3 className="text-xl font-black text-gray-300 uppercase">System Ready</h3>
            <p className="text-gray-400 text-sm max-w-xs mt-2">Specify your logic on the left to begin.</p>
          </div>
        )}

        {state.loading && (
          <div className="h-[480px] bg-white border border-gray-100 rounded-3xl animate-pulse flex flex-col items-center justify-center">
             <Loader2 size={32} className="animate-spin text-indigo-200 mb-4" />
             <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Architecting Logic...</p>
          </div>
        )}

        {state.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 items-start">
            <Card title="Strategy" subtitle={`Optimized for ${state.data.platform}`}>
              <p className="text-gray-700 text-sm italic mb-8 p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-400">
                "{state.data.explanation}"
              </p>
              <div className="space-y-6">
                {state.data.steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-white ${
                      step.type === 'trigger' ? 'bg-orange-500' : 'bg-indigo-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">{step.title}</h4>
                      <p className="text-gray-500 text-xs mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              {state.data.codeSnippet && (
                <Card title="Implementation" headerAction={
                  <button onClick={() => copyToClipboard(state.data!.codeSnippet!)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Copy size={16} />
                  </button>
                }>
                  <div className="bg-gray-950 p-6 rounded-xl overflow-hidden">
                    <pre className="text-indigo-300 font-mono text-xs overflow-x-auto scrollbar-hide">
                      <code>{state.data.codeSnippet}</code>
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
