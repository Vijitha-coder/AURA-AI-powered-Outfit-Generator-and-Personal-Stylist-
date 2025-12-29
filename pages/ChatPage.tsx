
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithStylist } from '../services/geminiService';
import { useWardrobe } from '../hooks/useWardrobe';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'aura', text: "Hi! I'm Aura, your personal stylist. Ask me anything about fashion or what to wear!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { wardrobe } = useWardrobe();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const auraResponse = await chatWithStylist(input, wardrobe);
      const auraMessage: ChatMessage = { sender: 'aura', text: auraResponse };
      setMessages(prev => [...prev, auraMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'aura', text: "Sorry, I'm having a little trouble right now. Please try again in a moment." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col container mx-auto max-w-3xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'aura' && (
              <div className="w-8 h-8 rounded-full bg-accent-secondary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent-primary" />
              </div>
            )}
            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-accent-primary text-background' : 'bg-card'}`}>
              <p className="text-sm font-serif">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-text-secondary" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-accent-secondary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-accent-primary" />
                </div>
                <div className="max-w-md p-3 rounded-lg bg-card">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-card border-t border-accent-secondary/30">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for style advice..."
            className="flex-1 px-4 py-2 bg-background border border-accent-secondary/30 rounded-full text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 bg-accent-primary text-background rounded-full hover:opacity-90 transition-opacity disabled:bg-accent-secondary">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;