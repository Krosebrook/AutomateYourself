
import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Upload, Image as ImageIcon, Loader2, Search, X } from 'lucide-react';

const ImageAnalysisView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Analyze this image and describe what is happening, focusing on details that might be useful for a workflow automation.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage(base64String);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await analyzeImage(image, prompt);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ImageIcon className="text-blue-600" />
          Image Analysis Tool
        </h2>

        {!image ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 font-semibold tracking-tight">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG or WEBP (MAX. 10MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="relative group">
              <img 
                src={`data:image/jpeg;base64,${image}`} 
                alt="Upload preview" 
                className="w-full h-auto max-h-96 object-contain rounded-xl bg-gray-900 border border-gray-200"
              />
              <button 
                onClick={() => {setImage(null); setResult(null);}}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg text-gray-600 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Goal</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                {loading ? 'Analyzing with Gemini 3 Pro...' : 'Start Vision Analysis'}
              </button>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg animate-in fade-in zoom-in-95 duration-500">
          <h3 className="text-lg font-bold mb-4 border-b border-gray-50 pb-2">Analysis Results</h3>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {result.split('\n').map((line, i) => (
              <p key={i} className="mb-3">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisView;
