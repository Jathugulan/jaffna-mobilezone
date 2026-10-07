import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X, Layers, Tag } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import type { Product } from '../../types';
import { formatLKR, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle palette
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.searchProducts(query);
        if (res.success && res.data) {
          setResults(res.data.slice(0, 6));
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  const popularSearches = ['Samsung Galaxy', 'iPhone', '5G Phones', 'Under 100k', 'Xiaomi'];

  const handleSelectProduct = (slug: string) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Palette Box */}
      <div className="animate-fadeInSoft relative z-10 w-full max-w-2xl overflow-hidden rounded-modal border border-line bg-elevated shadow-premium">
        {/* Search Header */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-3 border-b border-line p-4"
        >
          <Search className="h-5 w-5 shrink-0 text-ink-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search phones, brands, 5G specs, storage, or ask AI..."
            className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-full p-1 text-ink-3 transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden rounded-md border border-line bg-card px-2 py-0.5 font-mono text-[11px] text-ink-3 sm:inline-block">
            ESC
          </span>
        </form>

        {/* Results or Quick Links */}
        <div className="max-h-96 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-ink-3">
              Searching catalogue...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <span className="block px-2 text-[11px] font-bold uppercase tracking-wide text-ink-3">
                Matching Smartphones ({results.length})
              </span>
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="group flex cursor-pointer items-center gap-3 rounded-card border border-transparent p-2.5 transition-all duration-200 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <img
                    src={product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                    alt={product.name}
                    className="h-11 w-11 shrink-0 rounded-xl border border-line bg-card object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-primary">
                      {product.name}
                    </p>
                    <p className="text-xs text-ink-3">
                      {[
                        typeof product.brand === 'object' ? product.brand?.name : null,
                        product.specifications?.ram,
                        product.specifications?.storage,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-extrabold text-primary">
                      {formatLKR(product.offerPrice || product.price)}
                    </span>
                    {product.offerPrice && product.offerPrice < product.price && (
                      <span className="block text-[10px] text-ink-3 line-through">
                        {formatLKR(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-3">No phones found for "{query}".</p>
              <button
                onClick={() => {
                  navigate(`/ai-assistant?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-bold text-ink-2 transition-all duration-150 hover:border-primary hover:text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" /> Ask AI to find similar
                alternatives
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-ink-3">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink-2 transition-all duration-150 hover:border-primary hover:text-primary"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs">
                <button
                  onClick={() => {
                    navigate('/deals');
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-card border border-transparent p-2.5 text-ink-2 transition-all duration-150 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <Tag className="h-4 w-4 text-rose-500" />
                  <span>Flash Deals & Offers</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/brands');
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-card border border-transparent p-2.5 text-ink-2 transition-all duration-150 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Shop by Brand</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
