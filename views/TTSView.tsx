
import React, { useState, useRef } from 'react';
import { generateSpeech, decodeBase64, processAudioBuffer } from '../services/geminiService';
import { Card } from '../components/ui/Card';
import { Mic2, Play, Download, Loader2, Music, Volume2, Waveform } from 'lucide-react';

const TTSView: React.FC = () => {
  const [text, setText] = useState('Designing high-performance workflows requires precise execution and clear communication.');
  const [voice, setVoice] = useState('Kore');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const voices = [
    { id: 'Kore', name: 'Kore', type: 'Professional' },
    { id: 'Puck', name: 'Puck', type: 'Energetic' },
    { id: 'Charon', name: 'Charon', type: 'Authoritative' },
    { id: 'Fenrir', name: 'Fenrir', type: 'Calm' },
    { id: 'Zephyr', name: 'Zephyr', type: 'Friendly' },
  ];

  const handleSynthesize = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setAudioUrl(null);
    try {
      const base64Data = await generateSpeech(text, voice);
      if (base64Data) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBytes = decodeBase64(base64Data);
        const buffer = await processAudioBuffer(audioBytes, audioContext);
        
        const wavBlob = bufferToWav(buffer);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
      }
    } catch (err) {
      alert("Failed to synthesize speech.");
    } finally {
      setLoading(false);
    }
  };

  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const bufferLength = buffer.length * blockAlign;
    const arrayBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + bufferLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, bufferLength, true);

    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-top-6 duration-700">
      <Card title="Speech Synthesis" subtitle="Convert workflow documentation into natural voice instructions">
        <div className="space-y-8">
          {/* Voice Grid */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3 px-1">Choose Voice Persona</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {voices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoice(v.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border ${
                    voice === v.id 
                      ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${voice === v.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <Volume2 size={16} className={voice === v.id ? 'text-white' : 'text-gray-400'} />
                  </div>
                  <span className={`text-xs font-bold ${voice === v.id ? 'text-white' : 'text-gray-900'}`}>{v.name}</span>
                  <span className={`text-[8px] uppercase tracking-widest mt-0.5 opacity-60 ${voice === v.id ? 'text-white' : 'text-gray-400'}`}>
                    {v.type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block mb-1 px-1">Script Context</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to speak..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 min-h-[140px] focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-700 leading-relaxed"
            />
          </div>

          <button
            onClick={handleSynthesize}
            disabled={loading || !text.trim()}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/10 active:scale-[0.99]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Music size={20} />}
            {loading ? 'Synthesizing Audio Stream...' : 'Generate High-Fidelity Voice'}
          </button>
        </div>
      </Card>

      {audioUrl && (
        <div className="bg-white border border-indigo-100 p-8 rounded-3xl shadow-xl shadow-indigo-500/5 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Play size={24} fill="currentColor" />
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">Audio Preview</h4>
                  <p className="text-xs text-gray-400 font-medium">Generated with Gemini 2.5 Flash • {voice} Model</p>
                </div>
                <a 
                  href={audioUrl} 
                  download={`automation_guide_${voice.toLowerCase()}.wav`}
                  className="p-2.5 bg-gray-50 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
                  title="Download Recording"
                >
                  <Download size={18} />
                </a>
              </div>
              <audio ref={audioRef} controls src={audioUrl} className="w-full h-10" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TTSView;
