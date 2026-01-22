'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateMockResponse = (userInput: string): string => {
    const responses = [
      `I understand you're asking about "${userInput}". That's a great question! In a production environment, I would provide a detailed AI-generated response based on advanced language models.`,
      `Regarding "${userInput}", here are some insights: This is a mock response demonstrating the chat interface. A real implementation would connect to an AI API like OpenAI or similar services.`,
      `That's an interesting point about "${userInput}". Let me share some thoughts: This interface showcases how a conversational AI chat would work with real-time message handling and smooth interactions.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-t-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-emerald-500 mb-2">
              AI Chat Assistant
            </h1>
            <p className="text-slate-400">
              Interactive conversational AI interface
            </p>
          </div>
          <button
            onClick={clearChat}
            className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Clear
          </button>
        </div>

        {/* Chat Messages */}
        <div className="bg-slate-900 border-x border-slate-700 h-[600px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User size={20} className="text-slate-900" />
                  ) : (
                    <Bot size={20} className="text-emerald-500" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-emerald-500 text-slate-900'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <Bot size={20} className="text-emerald-500" />
                </div>
                <div className="rounded-lg p-4 bg-slate-800 border border-slate-700">
                  <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 border border-slate-700 rounded-b-lg p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <Send size={20} />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
