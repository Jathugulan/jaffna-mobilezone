import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { aiApi } from '../../api/ai.api';
import type { Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/common/Button';

export const CustomerAi: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; products?: Product[] }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your personal shopping assistant at Jaffna Mobile Zone. What kind of phone are you looking to upgrade to? You can tell me your budget, favorite brand, or specs like 120Hz display, 5G, or camera priority.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userText = query;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await aiApi.askProductAssistant(userText);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: res.data.text, products: res.data.products },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to check live stock right now. Please explore our /shop page.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Personal Concierge
        </span>
        <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
          <span className="grad-text-ai">AI Shopping Assistant</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-ink-3">
          Grounded answers from live inventory — budget picks, camera comparisons and stock checks.
        </p>
      </div>

      {/* Assistant Panel */}
      <div className="flex h-[650px] flex-col overflow-hidden rounded-card border border-line bg-card shadow-card">
        {/* Panel header */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-grad-ai text-white shadow-soft">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <span className="block text-sm font-extrabold tracking-[-0.01em] text-ink">
                JMZ AI Concierge
              </span>
              <span className="block text-[11px] text-ink-3">Live stock &amp; specs intelligence</span>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
            <Sparkles className="h-2.5 w-2.5" /> Grounded
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-grad-ai text-white">
                  <Bot className="h-4 w-4" />
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed sm:text-sm ${
                  m.role === 'user'
                    ? 'rounded-br-sm bg-grad-primary text-white'
                    : 'rounded-bl-sm border border-line bg-surface text-ink-2'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {m.products && m.products.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-line pt-3 sm:grid-cols-2">
                    {m.products.map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-grad-ai text-white">
                <Bot className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 text-xs text-ink-3">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-breathe" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-breathe [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-breathe [animation-delay:300ms]" />
                </span>
                <span>Searching live inventory &amp; specs…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-line bg-surface p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about phones, prices, camera comparisons..."
            aria-label="Ask the AI assistant"
            className="min-w-0 flex-1 rounded-xl border border-line bg-card px-4 py-2.5 text-xs text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:text-sm"
          />
          <Button
            type="submit"
            variant="glow"
            size="md"
            isLoading={isLoading}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
