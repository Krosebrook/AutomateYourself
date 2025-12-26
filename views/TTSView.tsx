
import React, { useState, useRef } from 'react';
// Fix: Corrected imported function names from geminiService
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Card } from '../components/ui/Card';
import { VoiceModel } from '../types';
import { Mic2, Play, Download, Loader2, Music, Volume2, AlertTriangle } from 'lucide-react';

const TTSView: React.FC = () => {
  const [text, setText] = useState('Ensuring high-performance AI integration requires robust architecture and low-latency execution.');
  const [voice, setVoice] = useState('Kore');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const MAX_TEXT_LENGTH = 1000;

  const voices: VoiceModel[] = [
    { id: 'Kore', name: 'Kore', type: 'Professional', description: 'Clear and corporate tone' },
    { id: 'Puck', name: 'Puck', type: 'Energetic', description: 'Upbeat and fast-paced' },
    { id: 'Charon', name: 'Charon', type: 'Authoritative', description: 'Serious and deep' },
    { id: 'Fenrir', name: 'Fenrir', type: 'Calm', description: 'Slow and soothing' },
    { id: 'Zephyr', name: 'Zephyr', type: 'Friendly', description: 'Approachable and warm' },
  ];

  const handleSynthesize = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setAudioUrl(null);
    setError(null);

    try {
      const base64Data = await generateSpeech(text, voice);
      if (base64Data) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        // Edge Case: Resume context in case browser blocked autoplay
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Fix: Use decode and decodeAudioData with correct parameters
        const audioBytes = decode(base64Data);
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        
        const wavBlob = bufferToWav(buffer);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
      } else {
        throw new Error("No audio data was returned from the server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to synthesize speech. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper to convert an AudioBuffer to a downloadable WAV blob.
   */
  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const blockAlign = numChannels * (bitDepth / 8);
    const byteRate = sampleRate * blockAlign;
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
    view.setUint32(28, byteRate, true);
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
      <Card title="Speech Lab" subtitle="Transform documentation into natural voice instructions">
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {voices.map((v) => (
              <button
                key={v.id}
                onClick={() => setVoice(v.id)}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                  voice === v.id 
                    ? 'bg-indigo-600 border-indigo-600 shadow-lg text-white' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <Volume2 size={16} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">{v.name}</span>
                <span className="text-[8px] opacity-60 mt-1">{v.type}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <label>Script Context</label>
              <span className={text.length > MAX_TEXT_LENGTH ? 'text-red-500' : ''}>
                {text.length} / {MAX_TEXT_LENGTH}
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 min-h-[140px] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Enter script context..."
            />
            {text.length > MAX_TEXT_LENGTH && (
              <p className="text-[10px] text-orange-500 font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                Text will be truncated to 1,000 characters for processing.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <button
            onClick={handleSynthesize}
            disabled={loading || !text.trim()}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
              loading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl active:scale-[0.98]'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Music size={20} />}
            {loading ? 'Processing Stream...' : 'Synthesize Audio'}
          </button>
        </div>
      </Card>

      {audioUrl && (
        <div className="bg-white border border-indigo-100 p-8 rounded-3xl animate-in zoom-in-95 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Play size={24} fill="currentColor" />
          </div>
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900">Audio Export Ready</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Encoded at 24kHz • {voice} Model</p>
              </div>
              <a href={audioUrl} download="audio_export.wav" className="p-2.5 bg-gray-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
                <Download size={18} />
              </a>
            </div>
            <audio ref={audioRef} controls src={audioUrl} className="w-full h-10" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TTSView;
