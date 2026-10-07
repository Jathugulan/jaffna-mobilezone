import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, SearchX } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { aiApi } from '../../api/ai.api';
import type { Product } from '../../types';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const executeSearch = async () => {
      setIsLoading(true);
      setAiAnalysis(null);
      try {
        // Natural language AI search converts request to filters
        const [searchRes, aiRes] = await Promise.all([
          productsApi.searchProducts(query),
          aiApi.aiSearch(query).catch(() => null),
        ]);

        if (searchRes.success && searchRes.data) {
          setProducts(searchRes.data);
        }

        if (aiRes && aiRes.success && aiRes.data) {
          setAiAnalysis(aiRes.data.text);
          if (aiRes.data.hints) setHints(aiRes.data.hints);
          if (aiRes.data.products && aiRes.data.products.length > 0) {
            setProducts(aiRes.data.products);
          }
        }
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Natural Language Discovery
        </span>

        <h1 className="text-2xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
          Search Catalog &amp; <span className="grad-text-ai">AI Phone Matcher</span>
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2 rounded-featured border border-line bg-card p-2 shadow-soft">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search by name, specs ('256GB'), budget ('under 150k')..."
              aria-label="Search products"
              className="w-full rounded-xl border border-transparent bg-transparent py-3 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:bg-surface"
            />
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-3" aria-hidden="true" />
          </div>
          <Button type="submit" variant="primary" size="lg">
            Search
          </Button>
        </form>

        {hints.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-ink-3">
            <span className="font-bold uppercase tracking-wider">Detected specifications:</span>
            {hints.map((hint, i) => (
              <span
                key={i}
                className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300"
              >
                {hint}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Grounding Notice */}
      {aiAnalysis && (
        <div className="mx-auto max-w-4xl rounded-card border border-blue-500/25 bg-blue-50 p-5 dark:bg-blue-500/10 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-grad-ai text-white shadow-soft">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <span className="grad-text-ai block text-[11px] font-black uppercase tracking-wider">
                AI Discovery Note
              </span>
              <p className="text-xs leading-relaxed text-ink-2 sm:text-sm">{aiAnalysis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-ink-2">
            {query && <SearchX className="h-4 w-4 text-primary" aria-hidden="true" />}
            {query ? (
              <>
                Results for <span className="text-primary">"{query}"</span> ({products.length} found)
              </>
            ) : (
              'Enter search terms'
            )}
          </span>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          emptyTitle={`No products found for "${query}"`}
          emptyDescription="Try searching for a different brand, model name, or specification."
        />
      </div>
    </div>
  );
};
