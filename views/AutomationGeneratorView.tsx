
import React, { useState, useMemo } from 'react';
import { generateAutomation } from '../services/geminiService';
import { AutomationResult, Platform } from '../types';
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
  AlertTriangle
} from 'lucide-react';

const MIN_DESCRIPTION_LENGTH = 20;

const AutomationGeneratorView: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('zapier');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const platforms: { id: Platform; label: string; tagline: string; logo: string; color: string; tooltip: string }[] = [
    { 
      id: 'zapier', 
      label: 'Zapier', 
      tagline: 'Best for simple SaaS triggers',
      logo: 'https://placehold.co/80x80/FF4A00/FFF?text=Z', 
      color: 'bg-[#FF4A00]', 
      tooltip: 'The gold standard for simple app-to-app triggers and actions with 6,000+ integrations.' 
    },
    { 
      id: 'n8n', 
      label: 'n8n.io', 
      tagline: 'Best for complex custom logic',
      logo: 'https://placehold.co/80x80/FF6D5A/FFF?text=n8n', 
      color: 'bg-[#FF6D5A]', 
      tooltip: 'Powerful node-based workflow automation for technical users who need self-hosting.' 
    },
    { 
      id: 'make', 
      label: 'Make', 
      tagline: 'Best for visual data mapping',
      logo: 'https://placehold.co/80x80/8A2BE2/FFF?text=M', 
      color: 'bg-[#8A2BE2]', 
      tooltip: 'Visual automation with complex branching and sophisticated data manipulation features.' 
    },
    { 
      id: 'langchain', 
      label: 'LangChain', 
      tagline: 'Best for AI agents & LLMs',
      logo: 'https://placehold.co/80x80/00A67E/FFF?text=LC', 
      color: 'bg-[#00A67E]', 
      tooltip: 'Developer framework for building advanced LLM-powered applications and stateful agents.' 
    },
    { 
      id: 'pipedream', 
      label: 'Pipedream', 
      tagline: 'Best for code-first APIs',
      logo: 'https://placehold.co/80x80/191970/FFF?text=P', 
      color: 'bg-[#191970]', 
      tooltip: 'Integration platform for developers with serverless code execution and low-level control.' 
    },
  ];

  const validation = useMemo(() => {
    const trimmed = description.trim();
    return {
      isEmpty: trimmed.length === 0,
      isTooShort: trimmed.length > 0 && trimmed.length < MIN_DESCRIPTION_LENGTH,
      isValid: trimmed.length >= MIN_DESCRIPTION_LENGTH,
      progress: Math.min(100, (trimmed.length / MIN_DESCRIPTION_LENGTH) * 100)
    };
  }, [description]);

  const handleGenerate = async () => {
    if (!validation.isValid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateAutomation(platform, description);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearError = () => setError(null);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Input Section */}
      <div className="xl:col-span-4 space-y-6">
        <Card title="Workflow Requirements" subtitle="Describe your automation goal in natural language">
          <div className="space-y-6">
            
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 shadow-sm">
                <div className="bg-red-200 p-2 rounded-xl">
                  <AlertCircle size={20} className="text-red-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Action Required</h4>
                  <p className="text-xs opacity-90 leading-tight">{error}</p>
                </div>
                <button 
                  onClick={clearError}
                  className="hover:bg-red-200/50 p-1.5 rounded-lg transition-colors"
                >
                  <X size={18} className="text-red-600" />
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">Target Ecosystem</label>
                <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                  <Info size={12} />
                  <span>Hover for details</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 border group active:scale-95 ${
                        isSelected 
                          ? 'bg-indigo-50/50 border-indigo-600 scale-105 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.2)] z-10' 
                          : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-300 hover:bg-white hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full p-0.5 shadow-lg border-2 border-white z-20 animate-in zoom-in duration-300">
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                      
                      <div className={`w-11 h-11 rounded-xl overflow-hidden shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${p.color}`}>
                        <img src={p.logo} alt={p.label} className="w-full h-full object-cover opacity-90" />
                      </div>
                      
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isSelected ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                          {p.label}
                        </span>
                        <span className={`text-[8px] font-bold leading-tight text-center max-w-[80px] transition-colors duration-300 ${isSelected ? 'text-indigo-500/80' : 'text-gray-300'}`}>
                          {p.tagline}
                        </span>
                      </div>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 shadow-2xl border border-gray-700/50 backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0">
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

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Describe the Flow</label>
                  <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${validation.isValid ? 'bg-green-500' : 'bg-indigo-400'}`} 
                      style={{ width: `${validation.progress}%` }} 
                    />
                  </div>
                </div>
                <span className={`text-[10px] font-bold transition-colors ${validation.isValid ? 'text-green-500' : 'text-gray-400'}`}>
                  {description.length} / {MIN_DESCRIPTION_LENGTH} chars
                </span>
              </div>
              <textarea
                value={description}
                onBlur={() => setTouched(true)}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (!touched && e.target.value.length > 0) setTouched(true);
                }}
                placeholder={`Example: "When a new Shopify order is placed (Trigger), check the inventory levels in Airtable. If stock is low, generate an AI restock notice via OpenAI and post it to the #warehouse Slack channel."`}
                className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 min-h-[160px] focus:ring-2 focus:bg-white outline-none transition-all text-gray-700 leading-relaxed placeholder:text-gray-300 placeholder:italic ${
                  touched && !validation.isValid 
                    ? 'border-orange-300 focus:ring-orange-200 bg-orange-50/20' 
                    : 'border-gray-200 focus:ring-indigo-500'
                }`}
              />
              
              {/* Validation Messages */}
              <div className="min-h-[20px]">
                {touched && validation.isEmpty && (
                  <p className="text-[10px] text-red-500 font-bold px-1 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                    <AlertCircle size={12} />
                    This field is required to design your workflow.
                  </p>
                )}
                {touched && validation.isTooShort && (
                  <p className="text-[10px] text-orange-500 font-bold px-1 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                    <AlertTriangle size={12} />
                    Needs {MIN_DESCRIPTION_LENGTH - description.trim().length} more characters for a quality blueprint.
                  </p>
                )}
                {validation.isValid && (
                  <p className="text-[10px] text-green-600 font-bold px-1 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                    <CheckCircle2 size={12} />
                    Logic description looks robust.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !validation.isValid}
              className={`w-full py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                loading || !validation.isValid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Synthesizing Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className={validation.isValid ? "group-hover:rotate-12 transition-transform" : ""} />
                  <span>Generate Blueprint</span>
                </>
              )}
            </button>
          </div>
        </Card>
      </div>

      {/* Result Section */}
      <div className="xl:col-span-8 space-y-6">
        {!result && !loading && (
          <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-60 bg-white/40">
            <div className="bg-indigo-50 p-6 rounded-full mb-6 border border-indigo-100">
              <Play size={48} className="text-indigo-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-500 mb-2">Ready to Design</h3>
            <p className="text-gray-400 max-w-xs">Define your workflow logic and choose a platform to see your AI-generated blueprint.</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-white border border-gray-100 rounded-3xl animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Architecting...</span>
              </div>
            </div>
            <div className="h-96 bg-white border border-gray-100 rounded-3xl animate-pulse" />
          </div>
        )}

        {result && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500 items-start">
            <div className="space-y-6">
              <Card 
                title="Architectural Strategy" 
                subtitle={`Optimized for ${result.platform.toUpperCase()}`}
                headerAction={
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Blueprint</span>
                  </div>
                }
              >
                <p className="text-gray-700 leading-relaxed bg-indigo-50/40 p-5 rounded-2xl italic border-l-4 border-indigo-500/50 shadow-sm mb-8">
                  "{result.explanation}"
                </p>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Logic Chain</h4>
                  <div className="space-y-1">
                    {result.steps.map((step, idx) => (
                      <div key={step.id} className="relative group">
                        {idx !== result.steps.length - 1 && (
                          <div className="absolute left-[21px] top-10 bottom-0 w-0.5 bg-gray-100 group-hover:bg-indigo-100 transition-colors" />
                        )}
                        <div className="flex gap-5 pb-8 last:pb-2 items-start">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm font-black text-lg transition-transform group-hover:scale-110 ${
                            step.type === 'trigger' ? 'bg-orange-600 text-white' : 
                            step.type === 'logic' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="pt-1">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="text-lg font-bold text-gray-900 leading-tight">{step.title}</span>
                            </div>
                            <div className="mb-2">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider inline-block ${
                                step.type === 'trigger' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                step.type === 'logic' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              }`}>
                                {step.type}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {result.codeSnippet && (
                <Card 
                  title="Technical Implementation" 
                  headerAction={
                    <button 
                      onClick={() => copyToClipboard(result.codeSnippet!)}
                      className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Copy size={14} className="group-active:scale-90 transition-transform" />
                      Copy Code
                    </button>
                  }
                >
                  <div className="bg-gray-900 rounded-2xl p-6 overflow-hidden shadow-inner border border-gray-800 relative">
                    <div className="absolute top-3 right-3 text-[10px] font-bold text-gray-600 uppercase tracking-tighter bg-gray-800/50 px-2 py-1 rounded">
                      {result.platform}
                    </div>
                    <pre className="text-indigo-300 font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar pb-2">
                      <code>{result.codeSnippet}</code>
                    </pre>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <Code size={14} className="text-indigo-400" />
                    <span>Verified snippet for {result.platform} architecture</span>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Next Steps</h5>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Import the schema above into your {result.platform} environment.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Authenticate each tool connection (OAuth/API Key).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Run a test transaction to verify the logic chain.</span>
                      </li>
                    </ul>
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
