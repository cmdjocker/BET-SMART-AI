import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { createSupportChat } from '../services/geminiService';

interface ChatSupportProps {
  darkMode: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const ChatSupport: React.FC<ChatSupportProps> = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm BetBot. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    chatRef.current = createSupportChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg.text });
      const botText = response.text || "I'm sorry, I couldn't process that request right now.";
      
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: botText, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), text: "Network error. Please try again.", sender: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center
          ${isOpen ? 'bg-red-500 rotate-90' : 'bg-green-500 hover:bg-green-600'} text-white`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in border
          ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
              <h3 className="font-bold">Live Support</h3>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">AI Agent</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed
                    ${msg.sender === 'user' 
                      ? 'bg-green-500 text-white rounded-br-none' 
                      : `${darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-100 text-gray-800'} rounded-bl-none`
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center
                   ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className={`p-3 border-t shrink-0 ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className={`flex-1 px-4 py-2 rounded-full border outline-none text-sm focus:ring-2 focus:ring-green-500
                  ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatSupport;