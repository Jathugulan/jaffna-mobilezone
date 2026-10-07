import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Sparkles, Send } from 'lucide-react';
import { aiApi } from '../../api/ai.api';
import type { Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/common/Button';

export const AiAssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [response, setResponse] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    'I need a Samsung phone under Rs. 200,000 with 256GB storage for photography.',
    'Which phone has the best battery life for heavy travel use?',
    'Show me the cheapest 5G phones currently in stock.',
    'Which device has the fastest processor for gaming?',
  ];

  const handleAsk = async (text?: string) => {
    const q = text || query;
    if (!q.trim()) return;
    setIsLoading(true);
    setResponse(null);
    setProducts([]);

    try {
      const res = await aiApi.askProductAssistant(q);
      if (res.success && res.data) {
        setResponse(res.data.text);
        setProducts(res.data.products || []);
      }
    } catch {
      setResponse(
        'Unable to query live inventory. Please explore our shop page or try a simpler inquiry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleAsk(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-hero border border-line bg-card p-8 shadow-card sm:p-12">
        <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 bg-grad-ai"
        />

        <div className="relative z-10 space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
            <Bot className="h-4 w-4" aria-hidden="true" /> AI Product Intelligence
          </span>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-ink sm:text-5xl">
            <span className="grad-text-ai">Grounded Smartphone Assistant</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-2 sm:text-base">
            Ask complex queries in natural language. Our AI evaluates real-time MongoDB prices, RAM,
            storage, 5G chips, and cameras without hallucinating fake models.
          </p>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex flex-col gap-2 pt-2 sm:flex-row"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find me a phone with 12GB RAM under 180,000 for video editing..."
              aria-label="Ask the AI assistant"
              className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <Button
              type="submit"
              variant="glow"
              size="lg"
              isLoading={isLoading}
              rightIcon={<Send className="h-4 w-4" />}
            >
              Ask Assistant
            </Button>
          </form>

          {/* Sample Prompts */}
          <div className="flex flex-wrap gap-2 pt-1">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  handleAsk(q);
                }}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-xs font-semibold text-ink-2 transition-all hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                &quot;{q}&quot;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 rounded-card border border-line bg-card px-6 py-6 text-sm text-ink-3">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-breathe" />
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-breathe [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-breathe [animation-delay:300ms]" />
          </span>
          <span>Grounding answer in live inventory…</span>
        </div>
      )}

      {/* AI Grounded Response */}
      {response && (
        <div className="rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>AI Response &amp; Justification</span>
          </div>

          <div className="whitespace-pre-line border-l-2 border-cyan-500 py-1 pl-4 text-sm leading-relaxed text-ink-2">
            {response}
          </div>

          {products.length > 0 && (
            <div className="mt-6 space-y-4 border-t border-line pt-6">
              <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink">
                Matched Real Phones From Live Stock:
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
