
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
  Check
} from 'lucide-react';

const MIN_DESCRIPTION_LENGTH = 20;
// Allowed: Alphanumeric, spaces, and common technical/punctuation symbols. 
// Specifically excludes < and > to prevent script/tag injection.
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
      tagline: 'Simple SaaS workflows',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120&h=120', 
      color: 'bg-[#FF4A00]', 
      tooltip: 'Connect 5,000+ apps with easy no-code automation. Best for quick business integrations and standard SaaS triggers.' 
    },
    { 
      id: 'n8n', 
      label: 'n8n.io', 
      tagline: 'Node-based logic',
      logo: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=120&h=120', 
      color: 'bg-[#FF6D5A]', 
      tooltip: 'Powerful node-based tool with custom JS support. Ideal for complex technical workflows and self-hosted environments.' 
    },
    { 
      id: 'make', 
      label: 'Make', 
      tagline: 'Visual integrations',
      logo: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=120&h=120', 
      color: 'bg-[#8A2BE2]', 
      tooltip: 'Visual drag-and-drop builder for intricate data mapping. Excellent for advanced no-coders building multi-branch apps.' 
    },
    { 
      id: 'langchain', 
      label: 'LangChain', 
      tagline: 'AI Agent orchestrator',
      logo: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=120&h=120', 
      color: 'bg-[#00A67E]', 
      tooltip: 'The premier framework for LLM-powered applications. Perfect for building autonomous AI agents and RAG pipelines.' 
    },
    { 
      id: 'pipedream', 
      label: 'Pipedream', 
      tagline: 'Developer-first API',
      logo: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=120&h=120', 
      color: 'bg-[#191970]', 
      tooltip: 'Write serverless code to connect any API. The developer-choice for high-performance integration and custom logic hooks.' 
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
    const value = e.target.value;
    const sanitizedValue = value.replace(ALLOWED_CHARS_REGEX, '');
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
        error: { message: err.message || "Failed to generate workflow." } 
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
      {/* Configuration Sidebar */}
      <div className="xl:col-span-4 space-y-6">
        <Card title="Blueprint Config" subtitle="Architectural constraints & target ecosystem">
          <div className="space-y-6">
            
            {state.error && (
              <div className="bg-red-50/50 border border-red-100 text-red-800 px-5 py-4 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2">
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
                1. Target Ecosystem
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group min-h-[145px] justify-center text-center outline-none active:scale-95 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-700 scale-[1.05] -translate-y-1 z-10 shadow-2xl shadow-indigo-500/40' 
                          : 'bg-white border-gray-100 hover:border-indigo-200 hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/50'
                      }`}
                    >
                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white text-indigo-600 rounded-full p-1 shadow-sm animate-in zoom-in-50 duration-300">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center mb-1.5 transition-all duration-500 ${
                        isSelected ? 'ring-2 ring-white/50 scale-110' : 'group-hover:scale-110'
                      }`}>
                        <img src={p.logo} alt={p.label} className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {p.label}
                      </span>
                      <span className={`text-[9px] font-bold leading-tight px-1 transition-colors ${isSelected ? 'text-indigo-100' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {p.tagline}
                      </span>

                      {/* Enhanced Tooltip Content */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 w-64 p-4 bg-gray-900 text-white text-[10px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 shadow-2xl border border-gray-700/50 backdrop-blur-md transform translate-y-3 group-hover:translate-y-0 scale-95 group-hover:scale-100">
                        <div className="font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 pb-2 border-b border-white/10 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Info size={12} />
                            {p.label}
                          </span>
                        </div>
                        <div className="font-medium opacity-90 leading-relaxed text-left text-gray-200">
                          {p.tooltip}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Layers size={14} className="text-indigo-400" />
                    2. Logical Requirements
                  </label>
                  <div className="group relative">
                    <ShieldCheck size={14} className="text-green-500 cursor-help transition-transform hover:scale-110" />
                    <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-gray-900 text-[10px] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 font-medium leading-relaxed border border-white/10 shadow-2xl">
                      Security First: Inputs are scrubbed to prevent injection. Only safe alphanumeric characters and standard technical symbols are permitted.
                    </div>
                  </div>
                </div>
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
                placeholder="Ex: When a new Stripe payment succeeds, extract the customer email, query my Supabase DB for their tier, and send a personalized Slack notification..."
                className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 min-h-[180px] text-sm focus:ring-4 outline-none transition-all duration-300 placeholder:text-gray-300 leading-relaxed ${
                  touched && !validation.isValid ? 'border-orange-200 focus:ring-orange-100/50' : 'border-gray-100 focus:ring-indigo-500/10 focus:border-indigo-500'
                }`}
              />
              {touched && validation.isTooShort && (
                <p className="text-[10px] text-orange-500 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <AlertTriangle size={12} />
                  System requires at least {MIN_DESCRIPTION_LENGTH} characters for precise synthesis.
                </p>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={state.loading || !validation.isValid}
              className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all duration-500 ${
                state.loading || !validation.isValid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-500/40 active:scale-[0.97] active:shadow-inner'
              }`}
            >
              {state.loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
              <span>{state.loading ? 'Synthesizing Blueprint...' : 'Generate Architecture'}</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="xl:col-span-8 space-y-6">
        {!state.data && !state.loading && (
          <div className="h-[600px] border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/40 group hover:bg-white/60 transition-all duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-sm border border-indigo-100">
              <Play size={40} className="ml-1" />
            </div>
            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-[0.4em]">Engine Standby</h3>
            <p className="text-gray-400 text-sm max-w-sm mt-4 font-medium leading-relaxed">
              Select an ecosystem and define your logical requirements to generate a production-ready automation blueprint.
            </p>
            <div className="mt-12 flex gap-4">
              <div className="flex -space-x-3">
                {platforms.slice(0, 3).map((p) => (
                  <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center shadow-sm">
                    <img src={p.logo} alt="" className="w-full h-full object-cover rounded-full opacity-60" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest self-center">Ready for Integration</span>
            </div>
          </div>
        )}

        {state.loading && (
          <div className="h-[600px] bg-white border border-gray-100 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent animate-pulse" />
             <div className="relative flex flex-col items-center z-10">
               <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/50 animate-bounce">
                 <Cpu size={36} className="text-white animate-spin-slow" />
               </div>
               <p className="text-sm font-black text-indigo-900 uppercase tracking-[0.4em] mb-2">Analyzing Architecture</p>
               <div className="flex gap-1">
                 {[0, 1, 2].map(i => (
                   <div key={i} className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                 ))}
               </div>
             </div>
          </div>
        )}

        {state.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-12 duration-1000 items-start">
            {/* Logic Analysis */}
            <Card title="Logical Strategy" subtitle={`Optimization Profile: ${state.data.platform.toUpperCase()}`}>
              <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full" />
                <p className="text-gray-700 text-sm italic mb-10 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 shadow-inner-sm leading-relaxed relative">
                  <span className="absolute -top-3 -left-2 text-4xl text-indigo-200 select-none">"</span>
                  {state.data.explanation}
                  <span className="absolute -bottom-6 -right-2 text-4xl text-indigo-200 select-none">"</span>
                </p>
              </div>
              
              <div className="space-y-10 relative">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-orange-400 via-indigo-400 to-indigo-100 opacity-20" />
                
                {state.data.steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-6 relative group">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                      step.type === 'trigger' 
                        ? 'bg-orange-500 shadow-orange-500/30 ring-4 ring-orange-50' 
                        : 'bg-indigo-600 shadow-indigo-500/30 ring-4 ring-indigo-50'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-extrabold text-gray-900 text-base tracking-tight">{step.title}</h4>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          step.type === 'trigger' 
                            ? 'bg-orange-50 border-orange-100 text-orange-600' 
                            : 'bg-indigo-50 border-indigo-100 text-indigo-600'
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

            {/* Technical Implementation */}
            <div className="space-y-8">
              {state.data.codeSnippet && (
                <Card 
                  title="Technical Blueprint" 
                  headerAction={
                    <button 
                      onClick={() => copyToClipboard(state.data!.codeSnippet!)} 
                      className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                        copied 
                          ? 'bg-green-500 text-white border-green-600 shadow-lg' 
                          : 'text-indigo-600 hover:bg-indigo-50 border-transparent hover:border-indigo-100'
                      }`}
                    >
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy Spec'}
                    </button>
                  }
                >
                  <div className="bg-[#0f1117] rounded-3xl overflow-hidden shadow-2xl border border-gray-800/50 group/code relative">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/5">
                      <Terminal size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Source Implementation</span>
                    </div>
                    <pre className="p-6 text-indigo-300 font-mono text-[11px] leading-relaxed overflow-x-auto custom-scrollbar scrollbar-hide">
                      <code className="block py-2 opacity-90 group-hover/code:opacity-100 transition-opacity">
                        {state.data.codeSnippet}
                      </code>
                    </pre>
                    <div className="absolute top-12 right-4 opacity-10 pointer-events-none transition-opacity group-hover/code:opacity-20">
                      <Code size={120} />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-start gap-4 p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Lightbulb size={16} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Architect's Note</h5>
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        This blueprint is optimized for high concurrency. Ensure your environmental variables match the specific API scopes requested in the logic flow.
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
