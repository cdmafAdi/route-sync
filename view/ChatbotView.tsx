
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MapPin, Bus, Train } from 'lucide-react';
import { getGeminiResponse } from '../geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const ChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Namaste! I'm your Pune Travel Assistant. How can I help you navigate through Pune today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponse = await getGeminiResponse(input);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white shadow-xl">
      <div className="bg-indigo-600 p-4 text-white flex items-center space-x-3 shadow-md">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold">Route Sync AI</h3>
          <p className="text-[10px] text-indigo-200 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            <span>Online • Pune Transport Expert</span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] space-x-2 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                m.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 p-3 rounded-2xl flex items-center space-x-2 text-slate-400 border border-slate-100">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-medium italic">Assistant is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-wrap gap-2 mb-3">
          <button 
            onClick={() => setInput('How to go from Kothrud to Hadapsar?')}
            className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:border-indigo-400 transition-all flex items-center space-x-1"
          >
            <Bus size={12} />
            <span>Kothrud to Hadapsar?</span>
          </button>
          <button 
            onClick={() => setInput('Metro frequency for Aqua line?')}
            className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:border-indigo-400 transition-all flex items-center space-x-1"
          >
            <Train size={12} />
            <span>Metro frequency?</span>
          </button>
          <button 
            onClick={() => setInput('Food spots near Shivaji Nagar station?')}
            className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:border-indigo-400 transition-all flex items-center space-x-1"
          >
            <MapPin size={12} />
            <span>Food near Shivaji Nagar?</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about Pune travel..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ring-indigo-400 text-sm shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotView;
