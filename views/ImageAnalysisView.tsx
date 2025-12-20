
import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Upload, Image as ImageIcon, Loader2, Search, X, AlertCircle, Link as LinkIcon, Globe } from 'lucide-react';

const ImageAnalysisView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState('Analyze this image and describe what is happening, focusing on details that might be useful for a workflow automation.');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 10MB limit. Please upload a smaller image.");
        return;
      }

      setMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage(base64String);
        setResult(null);
      };
      reader.onerror = () => {
        setError("Failed to read the file. Please try a different image.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlFetch = async () => {
    if (!imageUrl.trim()) return;
    setFetching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error("The URL provided does not point to a valid image file.");
      }

      if (blob.size > MAX_FILE_SIZE) {
        throw new Error("The image at this URL exceeds the 10MB size limit.");
      }

      setMimeType(blob.type);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage(base64String);
        setFetching(false);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load image from URL. This might be due to CORS restrictions on the source domain.");
      setFetching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeImage(image, prompt, mimeType);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageUrl('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="text-blue-600" />
            Image Analysis Tool
          </h2>
          {image && (
             <button 
             onClick={clearImage}
             className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
           >
             <X size={14} /> Clear Session
           </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <p className="leading-tight">{error}</p>
          </div>
        )}

        {!image ? (
          <div className="space-y-6">
            {/* URL Input Section */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                  <Globe size={16} />
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL (e.g. https://example.com/image.jpg)..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleUrlFetch}
                disabled={fetching || !imageUrl.trim()}
                className="bg-gray-900 text-white px-6 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {fetching ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                Fetch URL
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black text-gray-300 tracking-[0.3em] bg-white px-4 mx-auto w-fit">
                OR
              </div>
            </div>

            {/* Upload Zone */}
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 font-semibold tracking-tight">Upload local file</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">JPG, PNG, WEBP (MAX 10MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative group">
              <img 
                src={`data:${mimeType};base64,${image}`} 
                alt="Upload preview" 
                className="w-full h-auto max-h-[400px] object-contain rounded-xl bg-gray-900 border border-gray-200 shadow-inner"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
                {mimeType.split('/')[1]} Preview
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Analysis Goal</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Synthesizing Visual Data...' : 'Start Vision Analysis'}
              </button>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg animate-in fade-in zoom-in-95 duration-500 relative">
          <div className="absolute top-6 right-8 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analysis Complete</span>
          </div>
          <h3 className="text-lg font-bold mb-4 border-b border-gray-50 pb-2">Technical Extraction</h3>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisView;
