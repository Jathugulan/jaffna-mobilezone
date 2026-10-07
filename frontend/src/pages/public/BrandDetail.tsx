import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { brandsApi } from '../../api/brands.api';
import { productsApi } from '../../api/products.api';
import type { Brand, Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { DEFAULT_BRAND_BANNER, cn } from '../../utils/helpers';

export const BrandDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'deals' | 'new'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchBrandAndProducts = async () => {
      setIsLoading(true);
      try {
        const brandRes = await brandsApi.getBrandBySlug(slug);
        if (brandRes.success && brandRes.data) {
          setBrand(brandRes.data);
        }

        const prodRes = await productsApi.getProductsByBrand(slug);
        if (prodRes.success) {
          setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandAndProducts();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="h-64 rounded-hero border border-line bg-card animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Brand not found"
          description="We could not find the requested mobile manufacturer in our catalog."
          actionText="View All Brands"
          onAction={() => window.location.assign('/brands')}
        />
      </div>
    );
  }

  // Tab filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'featured') return p.featured;
    if (activeTab === 'deals') return p.deal || (p.offerPrice && p.offerPrice < p.price);
    if (activeTab === 'new') return p.newArrival;
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Brand Hero Banner */}
      <div className="relative overflow-hidden border-b border-line bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url(${brand.bannerUrl || DEFAULT_BRAND_BANNER})`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 text-center sm:flex-row sm:items-end sm:text-left">
            {brand.logoUrl ? (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-featured border border-white/15 bg-white p-3 shadow-2xl">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-featured bg-grad-primary font-heading text-3xl font-black text-white shadow-2xl">
                {brand.name.charAt(0)}
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                  {brand.name}
                </h1>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-bold text-blue-300 backdrop-blur">
                  {products.length} Models Available
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                {brand.description ||
                  `Explore genuine ${brand.name} smartphones with official warranty support at Jaffna Mobile Zone.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Discovery Controls */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar sm:w-auto" role="group" aria-label="Filter brand products">
            {[
              { key: 'all', label: 'All Phones' },
              { key: 'featured', label: 'Featured' },
              { key: 'deals', label: 'Deals & Offers' },
              { key: 'new', label: 'New Arrivals' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                aria-pressed={activeTab === tab.key}
                className={cn(
                  'whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-200',
                  activeTab === tab.key
                    ? 'border-transparent bg-grad-primary text-white shadow-soft'
                    : 'border-line bg-card text-ink-2 hover:border-blue-500/50 hover:text-primary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search within Brand */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${brand.name}...`}
              aria-label={`Search ${brand.name} products`}
              className="w-full rounded-xl border border-line bg-card py-2.5 pl-9 pr-3 text-xs text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:ring-2 focus:ring-blue-500/30 shadow-soft"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-ink-3" aria-hidden="true" />
          </div>
        </div>

        {/* Brand Products Grid */}
        <div className="pt-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No ${brand.name} phones found`}
              description={
                searchQuery
                  ? `No models matching "${searchQuery}" in ${brand.name}.`
                  : `There are currently no published phones under ${brand.name}.`
              }
              actionText="Reset Search"
              onAction={() => setSearchQuery('')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
