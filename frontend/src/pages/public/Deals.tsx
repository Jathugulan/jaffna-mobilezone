import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, Percent } from 'lucide-react';
import { offersApi } from '../../api/offers.api';
import { productsApi } from '../../api/products.api';
import type { Offer, Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { CountdownTimer } from '../../components/deals/CountdownTimer';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/helpers';

export const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Product[]>([]);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const [prodRes, offerRes] = await Promise.all([
          productsApi.getProducts({ deal: true, limit: 24 }),
          offersApi.getActiveOffers(),
        ]);

        if (prodRes.success && prodRes.data) {
          setDeals(prodRes.data);
        }

        if (offerRes.success && offerRes.data && offerRes.data.length > 0) {
          setActiveOffer(offerRes.data[0]);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const brands = ['ALL', 'Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google'];

  const filteredDeals = deals.filter((p) => {
    if (selectedBrandFilter === 'ALL') return true;
    const bName = typeof p.brand === 'object' ? p.brand.name : '';
    return bName.toLowerCase().includes(selectedBrandFilter.toLowerCase());
  });

  const productDiscount = (p: Product) =>
    p.discountPercentage ||
    (p.offerPrice && p.offerPrice < p.price
      ? Math.round(((p.price - p.offerPrice) / p.price) * 100)
      : 0);

  const topDiscount = deals.reduce((max, p) => Math.max(max, productDiscount(p)), 0);
  const campaignDiscount =
    activeOffer?.discountType === 'percentage' ? Math.round(activeOffer.discountValue) : 0;
  const upTo = Math.max(topDiscount, campaignDiscount);

  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 aurora-bg" />

      <div className="relative mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* Deals Hero Banner */}
        <header className="relative overflow-hidden rounded-hero border border-rose-500/25 bg-slate-950 p-8 text-white shadow-2xl sm:p-14">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-grad-deal opacity-40 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-grad-deal opacity-25 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/15 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-rose-400">
              <Flame className="h-4 w-4 fill-rose-500 text-rose-500" />
              Jaffna Flash Deals &amp; Limited Promotions
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Unbeatable Pricing on Sealed Smartphones.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Verified company promotions, seasonal discounts, and instant savings on Apple, Samsung, and Xiaomi flagship devices with official warranty.
            </p>

            {/* Savings stats */}
            <div className="flex flex-wrap gap-3 pt-1">
              {upTo > 0 && (
                <span className="inline-flex items-center gap-2 rounded-card border border-white/15 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
                  <Percent className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  Up to <span className="text-amber-400">{upTo}% OFF</span>
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-card border border-white/15 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
                {deals.length} Live Deals
              </span>
            </div>

            {/* Real Countdown Timer */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400">
                <Clock className="h-4 w-4" />
                <span>Active campaign expiry:</span>
              </div>
              <CountdownTimer
                targetDate={
                  activeOffer?.endDate ||
                  new Date(Date.now() + 48 * 3600 * 1000).toISOString()
                }
                size="lg"
              />
            </div>
          </div>
        </header>

        {/* Brand Offer Tabs */}
        <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Filter deals by brand">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrandFilter(b)}
                aria-pressed={selectedBrandFilter === b}
                className={cn(
                  'whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-200',
                  selectedBrandFilter === b
                    ? 'border-transparent bg-grad-deal text-white shadow-soft'
                    : 'border-line bg-card text-ink-2 hover:border-rose-400/50 hover:text-rose-500'
                )}
              >
                {b} Offers
              </button>
            ))}
          </div>

          <Link to="/shop">
            <Button variant="outline" size="sm">
              View All Regular Phones
            </Button>
          </Link>
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-card" />
            ))}
          </div>
        ) : filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {filteredDeals.map((product) => (
              <div
                key={product._id}
                className="rounded-card bg-grad-deal p-px shadow-soft transition-shadow duration-300 hover:shadow-card-hover"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card">
                  <ProductCard
                    product={{ ...product, deal: true }}
                    className="h-full flex-1 rounded-none border-0 shadow-none hover:translate-y-0 hover:shadow-none"
                  />

                  {/* Stock pressure bar */}
                  <div className="space-y-1.5 border-t border-line px-4 py-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wide">
                      <span className={cn(product.stock <= 5 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400')}>
                        {product.stock <= 0
                          ? 'Sold out'
                          : product.stock <= 5
                            ? `Only ${product.stock} left`
                            : 'Ready to ship'}
                      </span>
                      <span className="text-ink-3">{product.stock} units</span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full border border-line bg-surface"
                      role="progressbar"
                      aria-valuenow={product.stock}
                      aria-valuemin={0}
                      aria-label={`Stock level for ${product.name}`}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          product.stock <= 5 ? 'bg-rose-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${Math.max(6, Math.min(100, (product.stock / 40) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No promotional flash deals right now"
            description="Check back soon! Our showroom team regularly refreshes promotional pricing on flagship devices."
            actionText="Explore Regular Catalog"
            onAction={() => window.location.assign('/shop')}
          />
        )}
      </div>
    </div>
  );
};

export default Deals;
