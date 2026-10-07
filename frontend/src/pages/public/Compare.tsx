import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, X, Bot, Sparkles, ShoppingBag, Plus, Search, CheckCircle2 } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { aiApi } from '../../api/ai.api';
import { productsApi } from '../../api/products.api';
import type { Product } from '../../types';
import { Button } from '../../components/common/Button';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { EmptyState } from '../../components/common/EmptyState';
import { DEFAULT_PRODUCT_IMAGE, formatLKR, cn } from '../../utils/helpers';

export const Compare: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const { addToCart } = useCart();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Search to add more phones
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await productsApi.searchProducts(query);
      if (res.success && res.data) {
        setSearchResults(res.data.filter((p) => !compareList.some((c) => c._id === p._id)));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFromSearch = (product: Product) => {
    addToCompare(product);
    setSearchResults([]);
    setSearchQuery('');
    setHasSearched(false);
  };

  const handleGenerateAiComparison = async () => {
    if (compareList.length < 2) return;
    setIsAiLoading(true);
    try {
      const ids = compareList.map((p) => p._id);
      const res = await aiApi.compareProducts(ids);
      if (res.success && res.data) {
        setAiSummary(res.data.text);
      }
    } catch {
      setAiSummary(
        'Unable to load AI comparison at this moment. You can inspect the side-by-side specifications in the matrix below.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  if (compareList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ArrowLeftRight className="w-8 h-8" />}
          title="No phones selected for comparison"
          description="You can add up to 4 phones from our shop or product pages to view side-by-side technical specs."
          actionText="Explore Phones"
          onAction={() => window.location.assign('/shop')}
        />
      </div>
    );
  }

  const specRows: {
    label: string;
    getVal: (p: Product) => string;
    numeric?: boolean;
  }[] = [
    { label: 'Brand', getVal: (p: Product) => (typeof p.brand === 'object' ? p.brand?.name : 'JMZ') },
    { label: 'Processor', getVal: (p: Product) => p.specifications?.processor || '—' },
    { label: 'RAM Memory', getVal: (p: Product) => p.specifications?.ram || '—', numeric: true },
    { label: 'Internal Storage', getVal: (p: Product) => p.specifications?.storage || '—', numeric: true },
    { label: 'Display Screen', getVal: (p: Product) => p.specifications?.display || '—' },
    { label: 'Camera Setup', getVal: (p: Product) => p.specifications?.camera || '—' },
    { label: 'Battery Capacity', getVal: (p: Product) => p.specifications?.battery || '—', numeric: true },
    { label: '5G Connectivity', getVal: (p: Product) => (p.specifications?.supports5G ? 'Yes (5G)' : '4G LTE') },
    { label: 'Operating System', getVal: (p: Product) => p.specifications?.operatingSystem || '—' },
    { label: 'Warranty', getVal: (p: Product) => p.warranty || '1 Year Brand Warranty' },
    { label: 'Stock Availability', getVal: (p: Product) => (p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock') },
  ];

  // Leading column index per row (only for numeric rows with a unique max)
  const rowLeaders = specRows.map((row) => {
    if (!row.numeric) return -1;
    const values = compareList.map((p) => {
      const matches = row.getVal(p).match(/\d+(\.\d+)?/g);
      if (!matches) return -1;
      return Math.max(...matches.map((m) => parseFloat(m)));
    });
    const max = Math.max(...values);
    const leaders = values.filter((v) => v === max).length;
    return max > 0 && leaders === 1 ? values.indexOf(max) : -1;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            Hardware Comparison Matrix
          </span>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
            Compare <span className="grad-text">Smartphones</span>
          </h1>
          <p className="text-xs font-bold text-ink-3">
            {compareList.length}/4 phones in matrix
          </p>
        </div>

        <div className="flex items-center gap-3">
          {compareList.length >= 2 && (
            <Button
              variant="glow"
              size="sm"
              isLoading={isAiLoading}
              onClick={handleGenerateAiComparison}
              leftIcon={<Bot className="w-4 h-4" />}
            >
              AI Comparison Summary
            </Button>
          )}
          <button
            onClick={clearCompare}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-bold text-ink-2 transition-colors hover:border-rose-400/50 hover:text-rose-500"
          >
            Clear All
          </button>
        </div>
      </header>

      {/* AI Comparison Summary Box */}
      {aiSummary && (
        <div className="rounded-card border border-blue-500/25 bg-blue-50 p-6 dark:bg-blue-500/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-ai text-white shadow-soft">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="grad-text-ai text-sm font-black">
                AI Technical Analysis &amp; Value Recommendation
              </span>
            </div>
            <p className="whitespace-pre-line text-xs leading-relaxed text-ink-2 sm:text-sm">
              {aiSummary}
            </p>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-card border border-line bg-card shadow-card">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 z-10 w-48 bg-surface p-5 text-xs font-black uppercase tracking-wider text-ink-3">
                Feature
              </th>
              {compareList.map((product) => (
                <th key={product._id} className="p-5 min-w-[240px] align-top">
                  <div className="relative space-y-3">
                    <button
                      onClick={() => removeFromCompare(product._id)}
                      aria-label={`Remove ${product.name} from comparison`}
                      className="absolute -top-1 -right-1 z-10 rounded-full border border-line bg-surface p-1.5 text-ink-3 transition-all duration-200 hover:scale-110 hover:border-rose-400/50 hover:text-rose-500"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-card border border-line bg-surface p-2">
                      <img
                        src={product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="text-center">
                      <Link
                        to={`/product/${product.slug}`}
                        className="block truncate text-sm font-bold text-ink transition-colors hover:text-primary"
                        title={product.name}
                      >
                        {product.name}
                      </Link>
                      <div className="mt-2 flex justify-center">
                        <PriceDisplay
                          price={product.price}
                          offerPrice={product.offerPrice}
                          size="md"
                        />
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product, 1)}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                    </Button>
                  </div>
                </th>
              ))}

              {/* Empty placeholder slot to add up to 4 */}
              {compareList.length < 4 && (
                <th className="border-l border-dashed border-line p-5 min-w-[200px] text-center align-middle">
                  <div className="space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card border-2 border-dashed border-line text-ink-3">
                      <Plus className="h-6 w-6" />
                    </div>
                    <span className="block text-xs font-bold text-ink-3">
                      Add another phone
                    </span>
                    <span className="block text-[11px] font-semibold text-ink-3/70">
                      Search &amp; add up to 4 below
                    </span>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {specRows.map((row, idx) => (
              <tr key={row.label} className={cn(idx % 2 === 0 && 'bg-slate-50/60 dark:bg-white/[0.02]')}>
                <td className="sticky left-0 z-10 bg-card p-4 text-xs font-black uppercase tracking-wide text-ink-3">
                  {row.label}
                </td>
                {compareList.map((product, colIdx) => (
                  <td
                    key={product._id}
                    className={cn(
                      'p-4 font-semibold text-ink',
                      rowLeaders[idx] === colIdx &&
                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {rowLeaders[idx] === colIdx && (
                        <CheckCircle2
                          className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                          aria-label="Best value in this row"
                        />
                      )}
                      {row.getVal(product)}
                    </span>
                  </td>
                ))}
                {compareList.length < 4 && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compareList.length < 4 && (
        <section className="rounded-card border border-dashed border-line bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black tracking-[-0.01em] text-ink">
                Add another phone
              </h2>
              <p className="text-xs font-semibold text-ink-3">
                {4 - compareList.length} slot{4 - compareList.length > 1 ? 's' : ''} remaining for comparison
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex w-full gap-1 sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHasSearched(false);
                }}
                placeholder="Search model..."
                aria-label="Search phone to compare"
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-primary focus:ring-2 focus:ring-blue-500/30"
              />
              <Button type="submit" size="sm" variant="secondary" isLoading={isSearching}>
                <Search className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {isSearching && (
            <p className="mt-4 text-xs font-semibold text-ink-3">Searching the catalogue...</p>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((sr) => (
                <button
                  key={sr._id}
                  type="button"
                  onClick={() => handleAddFromSearch(sr)}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2 text-left transition-colors hover:border-blue-500/50 hover:bg-elevated"
                >
                  <img
                    src={sr.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md border border-line bg-card object-contain"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink">{sr.name}</span>
                    <span className="block text-[11px] font-semibold text-primary">
                      {formatLKR(sr.offerPrice || sr.price)}
                    </span>
                  </span>
                  <Plus className="h-4 w-4 shrink-0 text-ink-3" />
                </button>
              ))}
            </div>
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && (
            <p className="mt-4 text-xs font-semibold text-ink-3">
              No phones match "{searchQuery}". Try a brand or model name (e.g. Samsung, Pixel, iPhone).
            </p>
          )}
        </section>
      )}

      <p className="text-center text-[11px] text-ink-3">
        Highlighted cells mark the leading value for measurable specifications.
      </p>
    </div>
  );
};
