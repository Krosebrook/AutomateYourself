
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Card } from '../components/ui/Card';
import { Send, User, Sparkles, Loader2, Bot, Trash2 } from 'lucide-react';

const ChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAssistant(trimmedInput);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
        timestamp: Date.now()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'model',
        content: "Oops! My neural pathways are a bit tangled. Can you try that again?",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] animate-in zoom-in-95 duration-500">
      <Card 
        className="h-full flex flex-col p-0 overflow-hidden" 
        title="Consultant AI"
        subtitle="Real-time automation strategy and API assistance"
        headerAction={
          <button 
            onClick={() => setMessages([])} 
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
        }
      >
        {/* Chat Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center">
                <Bot size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">Start a Conversation</h4>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">Ask about specific API endpoints, OAuth logic, or n8n workflow strategies.</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 text-gray-600'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'
                }`}>
                  {msg.content}
                  <div className={`mt-2 text-[10px] font-medium opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-xs text-gray-500 font-medium">Assistant is processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-50">
          <div className="flex gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all pr-16"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 text-center uppercase tracking-widest font-bold">
            Powered by Gemini 3 Flash • Strategy Mode
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotView;
