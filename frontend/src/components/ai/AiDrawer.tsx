import React, { useState } from 'react';
import { Bot, Sparkles, Send, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiApi } from '../../api/ai.api';
import type { Product } from '../../types';
import { formatLKR, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';

export interface AiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
}

export const AiDrawer: React.FC<AiDrawerProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hello! I am your Jaffna Mobile Zone AI Assistant. Ask me anything about our phone catalog — budget recommendations, camera specs, gaming performance, or comparisons. Everything I recommend is strictly grounded in our live stock!",
    },
  ]);

  const samplePrompts = [
    'Find a phone under Rs. 150,000 for gaming',
    'Which phone has the best battery life?',
    'Show me 256GB phones with 5G support',
    'Best camera phone under Rs. 200,000',
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || query;
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await aiApi.askProductAssistant(prompt);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: res.data.text,
            products: res.data.products,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm having trouble retrieving products at the moment. Please try asking again or check our /shop page directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative z-50 flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-line bg-base sm:rounded-l-modal">
        {/* Header — glass surface with gradient accent */}
        <div className="glass-card relative flex items-center justify-between border-b border-line p-4">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 bg-grad-ai"
          />

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-ai text-white shadow-soft">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink">
                  Mobile Zone AI
                </h2>
                <span className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="h-2.5 w-2.5" /> Grounded
                </span>
              </div>
              <p className="text-xs text-ink-3">Live stock &amp; specs intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI assistant"
            className="focus-ring rounded-full border border-line bg-card p-2 text-ink-3 transition-all hover:border-primary hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-grad-ai text-white">
                  <Bot className="h-4 w-4" />
                </span>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-grad-primary text-white'
                    : 'rounded-bl-sm border border-line bg-surface text-ink-2'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Grounded product recommendation cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-line pt-3">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-ink-3">
                      Matching Phones from Stock:
                    </span>
                    {msg.products.slice(0, 4).map((prod) => (
                      <Link
                        key={prod._id}
                        to={`/product/${prod.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-3 rounded-xl border border-line bg-card p-2 transition-all hover:border-cyan-500/60 hover:shadow-soft"
                      >
                        <img
                          src={prod.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                          alt={prod.name}
                          className="h-11 w-11 shrink-0 rounded-lg border border-line bg-surface object-contain p-1"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-ink transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                            {prod.name}
                          </span>
                          <span className="block text-[11px] font-bold text-primary">
                            {formatLKR(prod.offerPrice || prod.price)}
                          </span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-500" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-grad-ai text-white">
                <Bot className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm border border-line bg-surface p-3.5 text-xs text-ink-3">
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-breathe" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-breathe [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-breathe [animation-delay:300ms]" />
                </span>
                <span>Searching live inventory &amp; specs…</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-t border-line bg-card px-4 py-2.5">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-semibold text-ink-2 transition-all hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-line bg-card p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about phones, specs, deals..."
              aria-label="Ask the AI assistant"
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              aria-label="Send message"
              className="focus-ring rounded-xl bg-grad-ai p-2.5 text-white shadow-soft transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-ink-3">
            Grounded in live JMZ stock · Hospital Road, Jaffna
          </p>
        </div>
      </div>
    </div>
  );
};
