
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
  Lightbulb,
  ShieldCheck,
  Terminal,
  Zap,
  Box,
  Cpu,
  Layers,
  Check,
  ArrowRight
} from 'lucide-react';

const MIN_DESCRIPTION_LENGTH = 20;
const ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9\s.,!?;:()@\-_'\"\/&\[\]{}#$%=+*]/g;

const AutomationGeneratorView: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('zapier');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<AsyncState<AutomationResult>>({
    data: null,
    loading: false,
    error: null
  });

  const platforms: { id: Platform; label: string; tagline: string; logo: string; color: string; tooltip: string }[] = [
    { 
      id: 'zapier', 
      label: 'Zapier', 
      tagline: 'Connect 5,000+ Apps',
      logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=300&h=200', 
      color: 'bg-[#FF4A00]', 
      tooltip: 'The gold standard for no-code SaaS connectivity. Best for teams that need to sync common business tools like Salesforce, Slack, and Google Sheets instantly without technical overhead.' 
    },
    { 
      id: 'n8n', 
      label: 'n8n.io', 
      tagline: 'Custom Logic Nodes',
      logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300&h=200', 
      color: 'bg-[#FF6D5A]', 
      tooltip: 'A powerful, fair-code workflow tool that thrives in self-hosted environments. Ideal for technical users who need granular control over data flow and custom JavaScript execution.' 
    },
    { 
      id: 'make', 
      label: 'Make', 
      tagline: 'Visual Data Mapping',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=200', 
      color: 'bg-[#8A2BE2]', 
      tooltip: 'Highly visual drag-and-drop builder with exceptional data parsing capabilities. Use this for complex multi-branching logic and scenarios requiring advanced iterative operations.' 
    },
    { 
      id: 'langchain', 
      label: 'LangChain', 
      tagline: 'AI Agent Orchestrator',
      logo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=300&h=200', 
      color: 'bg-[#00A67E]', 
      tooltip: 'The framework of choice for LLM applications. Optimized for building autonomous agents, RAG pipelines, and complex chains of thought across multiple AI providers.' 
    },
    { 
      id: 'pipedream', 
      label: 'Pipedream', 
      tagline: 'Developer API Control',
      logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300&h=200', 
      color: 'bg-[#191970]', 
      tooltip: 'The production-ready serverless platform for developers. Write custom Node.js/Python code to connect any API with a built-in KV store and event-driven architecture.' 
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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = e.target.value.replace(ALLOWED_CHARS_REGEX, '');
    setDescription(sanitizedValue);
  };

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
        error: { message: err.message || "Blueprint synthesis failed." } 
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Config Column */}
      <div className="xl:col-span-4 space-y-6">
        <Card title="Blueprint Architect" subtitle="Configure target ecosystem and logic constraints">
          <div className="space-y-6">
            {state.error && (
              <div className="bg-red-50 border border-red-100 text-red-800 px-5 py-4 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <h4 className="font-bold mb-1">Architectural Error</h4>
                  <p className="opacity-80 leading-relaxed">{state.error.message}</p>
                </div>
                <button onClick={() => setState({ ...state, error: null })} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Box size={14} className="text-indigo-400" />
                1. Target Infrastructure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {platforms.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`relative flex flex-col items-start p-0 rounded-2xl border transition-all duration-500 group min-h-[160px] overflow-hidden outline-none active:scale-[0.98] ${
                        isSelected 
                          ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-2xl shadow-indigo-500/20' 
                          : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-gray-200/50'
                      }`}
                    >
                      <div className="w-full h-24 relative overflow-hidden shrink-0">
                        <img 
                          src={p.logo} 
                          alt={p.label} 
                          className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg animate-in zoom-in-50">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-3">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">
                            {p.label}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 w-full text-left">
                        <span className={`block text-[10px] font-bold leading-tight transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {p.tagline}
                        </span>
                      </div>

                      {/* Informative Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 w-72 p-5 bg-gray-900/95 backdrop-blur-md text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 shadow-2xl border border-white/10 transform translate-y-3 group-hover:translate-y-0 scale-95 group-hover:scale-100">
                        <div className="font-black text-indigo-400 uppercase tracking-[0.2em] text-[10px] mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
                          <Sparkles size={12} />
                          {p.label} Profile
                        </div>
                        <div className="font-medium opacity-90 leading-relaxed text-left text-[11px] text-gray-200">
                          {p.tooltip}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                           <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-400/80">Architect Selection Guide</span>
                           <Info size={10} className="text-white/20" />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-gray-900/95" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layers size={14} className="text-indigo-400" />
                  2. Logical Requirements
                </label>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${validation.isValid ? 'bg-green-500' : 'bg-indigo-400'}`} 
                      style={{ width: `${validation.progress}%` }} 
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${validation.isValid ? 'text-green-500' : 'text-gray-400'}`}>
                    {description.length} chars
                  </span>
                </div>
              </div>
              <textarea
                value={description}
                onBlur={() => setTouched(true)}
                onChange={handleDescriptionChange}
                placeholder="Ex: When a new payment arrives in Stripe, query my Airtable for the customer, and if they are a 'Pro' user, send an automated Slack welcome message..."
                className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 min-h-[160px] text-sm focus:ring-4 outline-none transition-all duration-300 placeholder:text-gray-300 leading-relaxed ${
                  touched && !validation.isValid ? 'border-orange-200 focus:ring-orange-100/50' : 'border-gray-100 focus:ring-indigo-500/10 focus:border-indigo-500'
                }`}
              />
              {touched && validation.isTooShort && (
                <p className="text-[10px] text-orange-500 font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle size={12} /> Minimum requirement: {MIN_DESCRIPTION_LENGTH} chars.
                </p>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={state.loading || !validation.isValid}
              className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all duration-500 ${
                state.loading || !validation.isValid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-500/40 active:scale-[0.97]'
              }`}
            >
              {state.loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
              <span>{state.loading ? 'Synthesizing Blueprint...' : 'Generate Automation'}</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Result Column */}
      <div className="xl:col-span-8 space-y-6">
        {!state.data && !state.loading && (
          <div className="h-[600px] border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/40 group hover:bg-white/60 transition-all duration-700">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-sm border border-indigo-100">
              <Play size={40} className="ml-1" />
            </div>
            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-[0.4em]">Engine Standby</h3>
            <p className="text-gray-400 text-sm max-w-sm mt-4 font-medium leading-relaxed">
              Define your logical requirements on the left to generate a high-fidelity automation blueprint.
            </p>
          </div>
        )}

        {state.loading && (
          <div className="h-[600px] bg-white border border-gray-100 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent animate-pulse" />
             <div className="relative flex flex-col items-center z-10 text-center">
               <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/50 animate-bounce">
                 <Cpu size={36} className="text-white animate-spin-slow" />
               </div>
               <p className="text-sm font-black text-indigo-900 uppercase tracking-[0.4em] mb-2">Analyzing Architecture</p>
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Optimizing for {platform} execution...</span>
             </div>
          </div>
        )}

        {state.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-12 duration-1000 items-start">
            {/* Logic Flow */}
            <Card title="Logical Strategy" subtitle={`Infrastructure: ${state.data.platform.toUpperCase()}`}>
              <div className="relative mb-10 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 shadow-inner-sm leading-relaxed text-sm italic text-gray-700">
                "{state.data.explanation}"
              </div>
              
              <div className="space-y-10 relative">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-orange-400 via-indigo-400 to-indigo-100 opacity-20" />
                {state.data.steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-6 relative group">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-white shadow-xl transition-all duration-500 group-hover:scale-110 ${
                      step.type === 'trigger' ? 'bg-orange-500' : 'bg-indigo-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-extrabold text-gray-900 text-base tracking-tight">{step.title}</h4>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          step.type === 'trigger' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                          {step.type}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs font-medium leading-relaxed group-hover:text-gray-700 transition-colors">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Implementation Details */}
            <div className="space-y-8">
              {state.data.codeSnippet && (
                <Card 
                  title="Technical Blueprint" 
                  headerAction={
                    <button 
                      onClick={() => copyToClipboard(state.data!.codeSnippet!)} 
                      className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                        copied ? 'bg-green-500 text-white border-green-600' : 'text-indigo-600 hover:bg-indigo-50 border-transparent hover:border-indigo-100'
                      }`}
                    >
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  }
                >
                  <div className="bg-[#0f1117] rounded-3xl overflow-hidden shadow-2xl border border-gray-800/50 group/code relative">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/5">
                      <Terminal size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Source Code</span>
                    </div>
                    <pre className="p-6 text-indigo-300 font-mono text-[11px] leading-relaxed overflow-x-auto custom-scrollbar">
                      <code className="block py-2 opacity-90">{state.data.codeSnippet}</code>
                    </pre>
                  </div>
                  
                  <div className="mt-6 flex items-start gap-4 p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Lightbulb size={16} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Architect Note</h5>
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Validation steps are pre-injected into the trigger phase. Ensure your API keys are managed as environment variables for security.
                      </p>
                    </div>
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
