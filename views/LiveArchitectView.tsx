
import React, { useState, useRef, useEffect } from 'react';
import { connectToLiveArchitect, decodeAudioData, decode, encode } from '../services/geminiService';
import { Card } from '../components/ui/Card';
import { 
  Mic, 
  MicOff, 
  Radio, 
  Activity, 
  Waves, 
  Zap, 
  ShieldCheck, 
  XCircle,
  Volume2,
  Terminal,
  Layers
} from 'lucide-react';

const LiveArchitectView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    for (const source of sourcesRef.current.values()) {
      source.stop();
    }
    sourcesRef.current.clear();
    setIsActive(false);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  const startSession = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = connectToLiveArchitect({
        onopen: () => {
          setIsActive(true);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = scriptProcessor;

          scriptProcessor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const base64Data = encode(new Uint8Array(int16.buffer));
            
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (message) => {
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            for (const source of sourcesRef.current.values()) {
              source.stop();
            }
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => {
          console.error("Live session error:", e);
          setError("Session connection error.");
          cleanup();
        },
        onclose: () => {
          setIsActive(false);
          cleanup();
        }
      });

    } catch (err: any) {
      console.error(err);
      setError("Microphone access denied.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-200px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Control Center */}
        <Card className="md:w-1/3 flex flex-col p-8 justify-between" title="Live Link" subtitle="Voice UI Architecture Hub">
          <div className="space-y-8">
            <div className={`w-32 h-32 mx-auto rounded-[3rem] flex items-center justify-center transition-all duration-700 relative ${
              isActive ? 'bg-indigo-600 shadow-2xl shadow-indigo-500/50' : 'bg-gray-50'
            }`}>
              {isActive && (
                <div className="absolute inset-0 rounded-[3rem] animate-ping bg-indigo-500/20" />
              )}
              <Waves className={`transition-all duration-500 ${isActive ? 'text-white scale-125' : 'text-gray-200'}`} size={48} />
            </div>

            <div className="text-center space-y-2">
              <h4 className="font-black uppercase tracking-[0.2em] text-[11px] text-gray-900">
                {isActive ? 'Architect Connected' : 'Ready for Uplink'}
              </h4>
              <p className="text-[11px] text-gray-400 font-medium px-4 leading-relaxed">
                {isActive 
                  ? 'Active design session. Gemini 2.5 is listening for automation logic.' 
                  : 'Establish a real-time voice connection to design complex API flows through dialogue.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-600 flex items-center gap-2">
                <XCircle size={14} /> {error}
              </div>
            )}
            
            {!isActive ? (
              <button
                onClick={startSession}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Radio size={18} />
                Start Live Design
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${
                    isMuted ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  {isMuted ? 'Muted' : 'Mute'}
                </button>
                <button
                  onClick={cleanup}
                  className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  Stop
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Console / Stream Log */}
        <Card className="flex-1 flex flex-col h-full bg-[#0d0e12] border-gray-800" title="System Matrix" subtitle="Architectural reasoning and stream logs">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {!isActive && (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6">
                <Layers size={80} className="text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Session Inactive</span>
              </div>
            )}

            {isActive && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                  <Activity size={18} className="text-indigo-400 animate-pulse" />
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest">Neural Stream Active</span>
                    <p className="text-[11px] text-gray-500 font-medium">Listening for API, webhook, and logic triggers...</p>
                  </div>
                </div>
                
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                   <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                     <Terminal size={12} /> Console Output
                   </div>
                   <p className="text-[11px] text-gray-400 font-mono leading-relaxed opacity-60">
                     [SYSTEM] Initializing low-latency audio buffer...<br/>
                     [SYSTEM] Modal context: Automation Architecture v2.5<br/>
                     [SYSTEM] Voice Synthesis: Zephyr Enabled
                   </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-5 border-t border-gray-800 flex items-center justify-between text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500/50" />
              Encrypted Stream
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-500/50" />
              Gemini Flash Native
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveArchitectView;
