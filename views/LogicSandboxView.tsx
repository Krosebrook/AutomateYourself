
import React, { useState } from 'react';
import { simulateAutomation } from '../services/geminiService';
import { AutomationResult, SimulationResponse, AsyncState } from '../types';
import { Card } from '../components/ui/Card';
import { 
  FlaskConical, 
  Play, 
  Loader2, 
  Code, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Database,
  Search,
  ArrowRightCircle,
  Bug
} from 'lucide-react';

const LogicSandboxView: React.FC = () => {
  const [inputData, setInputData] = useState<string>(JSON.stringify({
    event: "new_payment",
    customer: {
      id: "cust_99",
      email: "jane@example.com",
      status: "active"
    },
    amount: 1500,
    currency: "USD"
  }, null, 2));

  const [automationSpec, setAutomationSpec] = useState<string>('');
  const [simState, setSimState] = useState<AsyncState<SimulationResponse>>({
    data: null,
    loading: false,
    error: null
  });

  const handleSimulate = async () => {
    if (!automationSpec.trim()) {
      setSimState(prev => ({ ...prev, error: { message: "Please provide an automation blueprint or description first." } }));
      return;
    }

    setSimState({ data: null, loading: true, error: null });
    try {
      // For simplicity, we create a mock AutomationResult if the input is text
      // In a real app, this would use a result from the Generator view
      const mockAutomation: AutomationResult = {
        platform: 'zapier',
        explanation: 'Simulated from sandbox input',
        steps: [
          { id: 1, title: 'Trigger Event', description: 'Analyze incoming webhook payload', type: 'trigger' },
          { id: 2, title: 'Logic Filter', description: 'Determine path based on data properties', type: 'logic' },
          { id: 3, title: 'Final Action', description: 'Execute external API call', type: 'action' }
        ]
      };

      const result = await simulateAutomation(mockAutomation, inputData);
      setSimState({ data: result, loading: false, error: null });
    } catch (err: any) {
      setSimState({ data: null, loading: false, error: { message: err.message } });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Simulation Setup */}
      <div className="xl:col-span-5 space-y-6">
        <Card title="Simulation Controller" subtitle="Define input data and logic to stress-test">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Database size={14} className="text-indigo-400" />
                Mock Payload (JSON)
              </label>
              <div className="relative group">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[8px] font-bold bg-indigo-500 text-white px-2 py-1 rounded-md uppercase">Editable</span>
                </div>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="w-full h-48 bg-[#0d0e12] text-green-400 font-mono text-xs p-5 rounded-2xl border border-gray-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all custom-scrollbar"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Code size={14} className="text-indigo-400" />
                Logic Definition
              </label>
              <textarea
                value={automationSpec}
                onChange={(e) => setAutomationSpec(e.target.value)}
                placeholder="Paste an automation blueprint or describe the logic steps here..."
                className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            <button
              onClick={handleSimulate}
              disabled={simState.loading}
              className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all duration-300 ${
                simState.loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 active:scale-95'
              }`}
            >
              {simState.loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
              {simState.loading ? 'Running simulation...' : 'Execute Test Run'}
            </button>
            
            {simState.error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-bold text-red-600 flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertTriangle size={16} />
                {simState.error.message}
              </div>
            )}
          </div>
        </Card>

        <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
           <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2 flex items-center gap-2">
             <Bug size={14} /> Edge Case Detection
           </h5>
           <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
             The simulation engine will attempt to find null values, type mismatches, and timeout scenarios within your described logic.
           </p>
        </div>
      </div>

      {/* Simulation Output */}
      <div className="xl:col-span-7 space-y-6">
        {!simState.data && !simState.loading && (
          <div className="h-[600px] border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/30">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center mb-6">
              <FlaskConical size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-300 uppercase tracking-[0.4em]">Sandbox Ready</h3>
            <p className="text-gray-400 text-sm max-w-xs mt-3 font-medium">Input your automation parameters to begin a high-fidelity logical simulation.</p>
          </div>
        )}

        {simState.loading && (
          <div className="h-[600px] bg-white border border-gray-100 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent animate-pulse" />
             <div className="relative flex flex-col items-center z-10">
               <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-spin-slow">
                 <Search size={28} className="text-white" />
               </div>
               <p className="text-xs font-black text-indigo-900 uppercase tracking-[0.4em] mb-1">Synthesizing Logic Trace</p>
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Evaluating payload against branch conditions...</span>
             </div>
          </div>
        )}

        {simState.data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
            <Card 
              title="Execution Trace" 
              subtitle={`Final Result: ${simState.data.overallStatus.toUpperCase()}`}
              headerAction={
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  simState.data.overallStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {simState.data.overallStatus === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {simState.data.overallStatus}
                </span>
              }
            >
              <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Terminal size={12} /> Summary Report
                </h5>
                <p className="text-sm font-medium text-gray-700 leading-relaxed italic">
                  "{simState.data.summary}"
                </p>
              </div>

              <div className="space-y-4">
                {simState.data.stepResults.map((step, idx) => (
                  <div key={idx} className="group relative bg-white border border-gray-100 p-5 rounded-2xl hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg ${
                        step.status === 'success' ? 'bg-green-500' : step.status === 'failure' ? 'bg-red-500' : 'bg-gray-400'
                      }`}>
                        {step.status === 'success' ? <CheckCircle2 size={16} /> : step.status === 'failure' ? <XCircle size={16} /> : <ArrowRightCircle size={16} />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-sm">Step {step.stepId} Verification</h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                            step.status === 'success' ? 'bg-green-50 text-green-600' : step.status === 'failure' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                          {step.reasoning}
                        </p>
                        <div className="bg-gray-900 p-3 rounded-xl border border-white/5">
                           <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                             <Database size={10} /> Output State
                           </div>
                           <pre className="text-[10px] text-green-400/80 font-mono overflow-x-auto whitespace-pre-wrap">
                             {step.output}
                           </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogicSandboxView;
