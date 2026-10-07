import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../../api/categories.api';
import type { Category } from '../../types';
import {
  ArrowRight,
  Smartphone,
  Watch,
  Headphones,
  BatteryCharging,
  Flame,
  Radio,
  Camera,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';
import { cn } from '../../utils/helpers';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultCategories = [
    {
      _id: 'cat-flagship',
      name: 'Flagship Smartphones',
      slug: 'flagship',
      description: 'Supreme titanium builds, Snapdragon 8 Elite & Apple A18 Pro processing power.',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800',
      active: true,
      displayOrder: 1,
      itemCount: 42,
    },
    {
      _id: 'cat-budget',
      name: 'Budget & Mid-Range',
      slug: 'budget',
      description: 'Exceptional everyday reliability and high battery capacity under Rs. 100,000.',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
      active: true,
      displayOrder: 2,
      itemCount: 68,
    },
    {
      _id: 'cat-gaming',
      name: 'Gaming Phones',
      slug: 'gaming',
      description: '144Hz–165Hz AMOLED displays with vapor chamber liquid cooling and shoulder triggers.',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800',
      active: true,
      displayOrder: 3,
      itemCount: 24,
    },
    {
      _id: 'cat-5g',
      name: '5G Smartphones',
      slug: '5g',
      description: 'Next-generation cellular speeds ready for Sri Lankan 5G high-speed networks.',
      imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800',
      active: true,
      displayOrder: 4,
      itemCount: 95,
    },
    {
      _id: 'cat-camera',
      name: 'Camera Specialists',
      slug: 'camera',
      description: 'Periscope telephoto zoom, ZEISS/Hasselblad lenses and cinematic 8K video capture.',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      active: true,
      displayOrder: 5,
      itemCount: 36,
    },
    {
      _id: 'cat-accessories',
      name: 'Mobile Accessories',
      slug: 'accessories',
      description: 'Certified 65W–120W GaN chargers, MagSafe cases, and true wireless earbuds.',
      imageUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=800',
      active: true,
      displayOrder: 6,
      itemCount: 110,
    },
  ];

  useEffect(() => {
    categoriesApi.getCategories({ active: true }).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setCategories(res.data);
      } else {
        setCategories(defaultCategories as unknown as Category[]);
      }
      setIsLoading(false);
    }).catch(() => {
      setCategories(defaultCategories as unknown as Category[]);
      setIsLoading(false);
    });
  }, []);

  const getIcon = (slug: string) => {
    if (slug.includes('flagship')) return Flame;
    if (slug.includes('gaming')) return Zap;
    if (slug.includes('5g')) return Radio;
    if (slug.includes('camera')) return Camera;
    if (slug.includes('watch')) return Watch;
    if (slug.includes('audio') || slug.includes('accessory')) return Headphones;
    if (slug.includes('charge')) return BatteryCharging;
    return Smartphone;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Category Hero */}
      <header className="relative overflow-hidden rounded-hero border border-line bg-card aurora-bg p-6 sm:p-10 shadow-soft">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Curated Tech Architecture
          </span>

          <h1 className="text-3xl font-black leading-[1.06] tracking-[-0.03em] text-ink sm:text-5xl">
            Discover Smartphones by <span className="grad-text">Category</span>
          </h1>

          <p className="text-sm leading-relaxed text-ink-3 sm:text-base">
            From titanium flagship performance beasts to battery-efficient daily drivers. Find your ideal configuration with genuine manufacturer warranty in Jaffna.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 border-t border-line pt-4 text-xs">
            <div>
              <span className="grad-text font-heading block text-xl font-black">6+</span>
              <span className="text-ink-3">Categories</span>
            </div>
            <div>
              <span className="grad-text font-heading block text-xl font-black">250+</span>
              <span className="text-ink-3">Sealed Devices</span>
            </div>
            <div>
              <span className="grad-text font-heading block text-xl font-black">100%</span>
              <span className="text-ink-3">Brand Warranty</span>
            </div>
          </div>
        </div>
      </header>

      {/* Category Grid — Bento */}
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-black text-ink">All Categories</h2>
          <p className="mt-1 text-xs text-ink-3">
            Select a category to filter specifications and view available inventory
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn('h-64 rounded-card', i === 0 && 'sm:col-span-2')}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {categories.map((category, index) => {
              const Icon = getIcon(category.slug);
              const hasImage = Boolean(category.imageUrl);
              const isFeatured = index === 0;

              return (
                <Link
                  key={category._id}
                  to={`/categories/${category.slug}`}
                  className={cn(
                    'group relative flex min-h-[260px] flex-col overflow-hidden rounded-card border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover',
                    isFeatured && 'sm:col-span-2'
                  )}
                >
                  {/* Full-bleed image + gradient scrim */}
                  {hasImage && (
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={category.imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-slate-900/92 via-slate-900/55 to-slate-900/20"
                      />
                    </div>
                  )}
                  {!hasImage && (
                    <div aria-hidden="true" className="absolute inset-0 aurora-bg" />
                  )}

                  <div className="relative z-10 flex h-full flex-col justify-between p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-card transition-transform duration-300 group-hover:scale-110',
                          hasImage
                            ? 'bg-white/15 text-white ring-1 ring-white/20 backdrop-blur'
                            : 'bg-blue-500/10 text-primary'
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </span>

                      {(category as Category & { itemCount?: number }).itemCount != null && (
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide',
                            hasImage
                              ? 'bg-white/15 text-white ring-1 ring-white/20'
                              : 'border border-line bg-surface text-ink-2'
                          )}
                        >
                          {(category as Category & { itemCount?: number }).itemCount} Items
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3
                        className={cn(
                          'text-xl font-extrabold tracking-[-0.02em] transition-colors',
                          hasImage
                            ? 'text-white group-hover:text-blue-200'
                            : 'text-ink group-hover:text-primary'
                        )}
                      >
                        {category.name}
                      </h3>
                      <p
                        className={cn(
                          'line-clamp-2 text-xs leading-relaxed',
                          hasImage ? 'text-slate-300' : 'text-ink-3'
                        )}
                      >
                        {category.description ||
                          `Explore genuine ${category.name} available with warranty at Jaffna Mobile Zone.`}
                      </p>

                      <div
                        className={cn(
                          'flex items-center justify-between border-t pt-3 text-xs font-bold',
                          hasImage ? 'border-white/15 text-white' : 'border-line text-primary'
                        )}
                      >
                        <span>Explore Products</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
