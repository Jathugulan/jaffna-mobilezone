import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brandsApi } from '../../api/brands.api';
import type { Brand } from '../../types';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { cn } from '../../utils/helpers';

export const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');

  const defaultBrands: Brand[] = [
    {
      _id: 'b-apple',
      name: 'Apple',
      slug: 'apple',
      featured: true,
      active: true,
      displayOrder: 1,
      productCount: 48,
      description: 'Official iPhone 16 series, Pro Max, iPads, and genuine MagSafe accessories.',
    },
    {
      _id: 'b-samsung',
      name: 'Samsung',
      slug: 'samsung',
      featured: true,
      active: true,
      displayOrder: 2,
      productCount: 64,
      description: 'Galaxy S26 Ultra, Galaxy Z Fold, and Galaxy A series with official distributor warranty.',
    },
    {
      _id: 'b-xiaomi',
      name: 'Xiaomi',
      slug: 'xiaomi',
      featured: true,
      active: true,
      displayOrder: 3,
      productCount: 52,
      description: 'HyperOS flagships, Redmi Note series, and POCO extreme gaming devices.',
    },
    {
      _id: 'b-oneplus',
      name: 'OnePlus',
      slug: 'oneplus',
      featured: true,
      active: true,
      displayOrder: 4,
      productCount: 28,
      description: 'Flagship killers powered by Snapdragon processors and Hasselblad optics.',
    },
    {
      _id: 'b-google',
      name: 'Google',
      slug: 'google',
      featured: true,
      active: true,
      displayOrder: 5,
      productCount: 16,
      description: 'Pixel 9 Pro and Pixel Fold with Google Tensor G4 and genuine Google AI capabilities.',
    },
    {
      _id: 'b-oppo',
      name: 'OPPO',
      slug: 'oppo',
      featured: false,
      active: true,
      displayOrder: 6,
      productCount: 22,
      description: 'Find series flagships and Reno portrait camera champions with SuperVOOC charging.',
    },
    {
      _id: 'b-vivo',
      name: 'vivo',
      slug: 'vivo',
      featured: false,
      active: true,
      displayOrder: 7,
      productCount: 20,
      description: 'X-Series ZEISS optical co-engineered flagships and stylish V-series devices.',
    },
    {
      _id: 'b-realme',
      name: 'Realme',
      slug: 'realme',
      featured: false,
      active: true,
      displayOrder: 8,
      productCount: 24,
      description: 'Ultra-fast charging flagships and youth high-performance hardware.',
    },
  ];

  useEffect(() => {
    brandsApi
      .getBrands({ active: true })
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setBrands(res.data);
        } else {
          setBrands(defaultBrands);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setBrands(defaultBrands);
        setIsLoading(false);
      });
  }, []);

  const alphabet = ['ALL', 'A', 'B', 'G', 'O', 'R', 'S', 'V', 'X'];

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch =
      !searchQuery || brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter =
      selectedLetter === 'ALL' ||
      brand.name.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Brand Hero */}
      <header className="relative overflow-hidden rounded-hero border border-line bg-card aurora-bg p-6 shadow-soft sm:p-10">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Authorised Global Lineup
          </span>

          <h1 className="text-3xl font-black leading-[1.06] tracking-[-0.03em] text-ink sm:text-5xl">
            Explore Leading <span className="grad-text">Manufacturers</span>
          </h1>

          <p className="text-sm leading-relaxed text-ink-3 sm:text-base">
            Discover official sealed smartphones from Apple, Samsung, Xiaomi, OnePlus, and Google with direct Sri Lankan warranty backing at Jaffna Mobile Zone.
          </p>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Alphabet Bar */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter brands by letter">
          {alphabet.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => setSelectedLetter(letter)}
              aria-pressed={selectedLetter === letter}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-bold transition-all duration-200',
                selectedLetter === letter
                  ? 'border-transparent bg-grad-primary text-white shadow-soft'
                  : 'border-line bg-card text-ink-2 hover:border-blue-500/50 hover:text-primary'
              )}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Brand Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manufacturer..."
            aria-label="Search manufacturers"
            className="w-full rounded-xl border border-line bg-card py-2.5 pl-9 pr-3 text-xs text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:ring-2 focus:ring-blue-500/30 shadow-soft"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-ink-3" aria-hidden="true" />
        </div>
      </div>

      {/* Brand Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-card" />
          ))}
        </div>
      ) : filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {filteredBrands.map((brand) => (
            <Link
              key={brand._id}
              to={`/brand/${brand.slug}`}
              className="group relative flex flex-col justify-between rounded-card border border-line bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  {/* Logo tile — grayscale to colour on hover */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-card border border-line bg-surface p-2.5 transition-all duration-300 group-hover:scale-105 group-hover:border-blue-500/40">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                      />
                    ) : (
                      <span className="font-heading text-2xl font-black text-primary">
                        {brand.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {brand.featured && (
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary">
                      Featured
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <h3 className="text-xl font-extrabold tracking-[-0.02em] text-ink transition-colors group-hover:text-primary">
                    {brand.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-3">
                    {brand.description || `Discover flagship and budget ${brand.name} models.`}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs font-bold text-ink-2 transition-colors group-hover:text-primary">
                <span>{brand.productCount ? `${brand.productCount} Models` : 'Explore'}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No manufacturers found"
          description={`No brand matches "${searchQuery}".`}
          actionText="Clear Search"
          onAction={() => {
            setSearchQuery('');
            setSelectedLetter('ALL');
          }}
        />
      )}
    </div>
  );
};
