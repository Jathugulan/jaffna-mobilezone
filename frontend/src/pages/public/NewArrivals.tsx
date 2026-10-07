import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpDown, Filter } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import type { Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    setIsLoading(true);
    productsApi
      .getProducts({
        newArrival: true,
        limit: 20,
        sortBy: sortBy as 'price' | 'createdAt' | 'salesCount' | 'name',
        sortOrder: sortOrder as 'asc' | 'desc',
      })
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [sortBy, sortOrder]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <header className="relative overflow-hidden rounded-hero border border-line bg-card aurora-bg p-6 shadow-soft sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Just Landed in Sri Lanka
          </span>

          <h1 className="text-3xl font-black leading-[1.06] tracking-[-0.03em] text-ink sm:text-5xl">
            Fresh Arrivals &amp; <span className="grad-text">Latest Releases</span>
          </h1>

          <p className="text-sm leading-relaxed text-ink-3 sm:text-base">
            The freshest smartphone generations just unboxed and cataloged in our Jaffna flagship inventory. Verified serial seals with local distributor warranties.
          </p>

          <div className="flex flex-wrap gap-2 border-t border-line pt-4 text-[11px] font-bold text-ink-2">
            <span className="rounded-full border border-line bg-surface px-3 py-1">Weekly Shipments</span>
            <span className="rounded-full border border-line bg-surface px-3 py-1">Sealed &amp; Genuine</span>
            <span className="rounded-full border border-line bg-surface px-3 py-1">Islandwide Courier</span>
          </div>
        </div>
      </header>

      {/* Control Bar: Count & Sorting */}
      <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-black uppercase tracking-wider text-ink-3">
          Showing {products.length} latest smartphone models
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-xs shadow-soft">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <select
              value={`${sortBy}:${sortOrder}`}
              aria-label="Sort new arrivals"
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="cursor-pointer bg-transparent font-bold text-ink focus:outline-none"
            >
              <option value="createdAt:desc">Newest Added</option>
              <option value="price:asc">Price: Low → High</option>
              <option value="price:desc">Price: High → Low</option>
              <option value="salesCount:desc">Most Popular</option>
            </select>
          </div>

          <Link to="/shop">
            <Button variant="outline" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
              Filter All Phones
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-card" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={{ ...product, newArrival: true }} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No new arrivals listed yet"
          description="Check back soon! New flagship shipments arrive weekly."
          actionText="Browse All Phones"
          onAction={() => window.location.assign('/shop')}
        />
      )}
    </div>
  );
};

export default NewArrivals;
