import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  ShieldCheck,
  Truck,
  Award,
  Check,
} from 'lucide-react';
import { productsApi, type ProductFilters } from '../../api/products.api';
import { brandsApi } from '../../api/brands.api';
import type { Brand, Product } from '../../types';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { cn } from '../../utils/helpers';

/* --------------------------------------------------------------------------- */
/*  Custom form primitives — primary-accented, keyboard accessible              */
/* --------------------------------------------------------------------------- */
const RadioDot: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    className={cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40',
      checked
        ? 'border-primary bg-primary shadow-soft'
        : 'border-line bg-surface group-hover:border-blue-500/60'
    )}
    aria-hidden="true"
  >
    {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
  </span>
);

const CheckBox: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    className={cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40',
      checked
        ? 'border-transparent bg-grad-primary text-white shadow-soft'
        : 'border-line bg-surface group-hover:border-blue-500/60'
    )}
    aria-hidden="true"
  >
    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
  </span>
);

/* --------------------------------------------------------------------------- */
/*  Premium numbered pagination button                                          */
/* --------------------------------------------------------------------------- */
interface PageButtonProps {
  active?: boolean;
  disabled?: boolean;
  label?: string;
  onClick: () => void;
  children: React.ReactNode;
}

const PageButton: React.FC<PageButtonProps> = ({ active, disabled, label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'min-w-[36px] rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
      disabled
        ? 'cursor-not-allowed text-ink-3 opacity-50'
        : active
          ? 'bg-grad-primary text-white shadow-soft'
          : 'border border-line bg-card text-ink-2 hover:border-blue-500/50 hover:text-primary'
    )}
  >
    {children}
  </button>
);

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter states parsed from URL
  const selectedBrand = searchParams.get('brand') || '';
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const ram = searchParams.get('ram') || '';
  const storage = searchParams.get('storage') || '';
  const displaySize = searchParams.get('display') || '';
  const color = searchParams.get('color') || '';
  const supports5G = searchParams.get('5g') === 'true';
  const inStock = searchParams.get('inStock') === 'true';
  const onOffer = searchParams.get('onOffer') === 'true';
  const newArrival = searchParams.get('newArrival') === 'true';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const parsedPage = Number(searchParams.get('page'));
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Local price input state
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Fetch brands on mount
  useEffect(() => {
    brandsApi.getBrands({ active: true }).then((res) => {
      if (res.success && res.data) setBrands(res.data);
    });
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const filters: ProductFilters = {
          page,
          limit: 12,
          search: searchQuery || undefined,
          brand: selectedBrand || undefined,
          category: selectedCategory || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          ram: ram || undefined,
          storage: storage || undefined,
          supports5G: supports5G || undefined,
          inStock: inStock ? true : undefined,
          onOffer: onOffer ? true : undefined,
          sortBy: sortBy as ProductFilters['sortBy'],
          sortOrder: sortOrder as ProductFilters['sortOrder'],
        };

        const res = await productsApi.getProducts(filters);
        if (res.success) {
          setProducts(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages || 1);
            setTotalCount(res.pagination.total || 0);
          }
        }
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [
    page,
    searchQuery,
    selectedBrand,
    selectedCategory,
    minPrice,
    maxPrice,
    ram,
    storage,
    supports5G,
    inStock,
    onOffer,
    sortBy,
    sortOrder,
  ]);

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (tempMinPrice) next.set('minPrice', tempMinPrice);
    else next.delete('minPrice');
    if (tempMaxPrice) next.set('maxPrice', tempMaxPrice);
    else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Active filters list for filter chips
  const activeFilters: Array<{ label: string; key: string }> = [];
  if (selectedBrand) activeFilters.push({ label: `Brand: ${selectedBrand.toUpperCase()}`, key: 'brand' });
  if (selectedCategory) activeFilters.push({ label: `Category: ${selectedCategory}`, key: 'category' });
  if (minPrice && maxPrice) activeFilters.push({ label: `Rs. ${Number(minPrice).toLocaleString()} – Rs. ${Number(maxPrice).toLocaleString()}`, key: 'price' });
  else if (minPrice) activeFilters.push({ label: `Min Rs. ${Number(minPrice).toLocaleString()}`, key: 'minPrice' });
  else if (maxPrice) activeFilters.push({ label: `Max Rs. ${Number(maxPrice).toLocaleString()}`, key: 'maxPrice' });
  if (ram) activeFilters.push({ label: `RAM: ${ram}`, key: 'ram' });
  if (storage) activeFilters.push({ label: `Storage: ${storage}`, key: 'storage' });
  if (displaySize) activeFilters.push({ label: `Display: ${displaySize}`, key: 'display' });
  if (color) activeFilters.push({ label: `Color: ${color}`, key: 'color' });
  if (supports5G) activeFilters.push({ label: '5G Enabled', key: '5g' });
  if (inStock) activeFilters.push({ label: 'In Stock', key: 'inStock' });
  if (onOffer) activeFilters.push({ label: 'On Sale / Deals', key: 'onOffer' });
  if (newArrival) activeFilters.push({ label: 'New Arrivals', key: 'newArrival' });

  const categories = [
    { label: 'Flagship Phones', slug: 'flagship' },
    { label: 'Budget Phones', slug: 'budget' },
    { label: 'Gaming Phones', slug: 'gaming' },
    { label: '5G Phones', slug: '5g' },
    { label: 'Camera Phones', slug: 'camera' },
    { label: 'Feature Phones', slug: 'feature-phones' },
  ];

  const colorSwatches = [
    { name: 'Titanium Gray', hex: '#71717a' },
    { name: 'Phantom Black', hex: '#18181b' },
    { name: 'Ocean Blue', hex: '#0284c7' },
    { name: 'Glacier Silver', hex: '#e2e8f0' },
    { name: 'Gold', hex: '#eab308' },
    { name: 'Emerald Green', hex: '#059669' },
  ];

  const filterSectionTitle = 'mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-ink-3';
  const filterSection = 'space-y-3 border-t border-line pt-5 first:border-t-0 first:pt-0';

  const filterSidebar = (
    <div className="space-y-6 text-xs text-ink-2">
      {/* Brand Selection */}
      <div className={filterSection}>
        <h4 className={cn(filterSectionTitle, 'flex items-center justify-between')}>
          <span>Brands</span>
          {selectedBrand && (
            <button
              onClick={() => updateFilter('brand', null)}
              className="text-[10px] font-bold uppercase tracking-wide text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </h4>
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
          <label className="group flex cursor-pointer items-center gap-2.5 font-semibold text-ink-2 transition-colors hover:text-primary">
            <input
              type="radio"
              name="brand"
              checked={selectedBrand === ''}
              onChange={() => updateFilter('brand', null)}
              className="peer sr-only"
            />
            <RadioDot checked={selectedBrand === ''} />
            <span>All Brands</span>
          </label>
          {(brands.length > 0 ? brands : [
            { _id: '1', name: 'Apple', slug: 'apple' },
            { _id: '2', name: 'Samsung', slug: 'samsung' },
            { _id: '3', name: 'Xiaomi', slug: 'xiaomi' },
            { _id: '4', name: 'OnePlus', slug: 'oneplus' },
            { _id: '5', name: 'Google', slug: 'google' },
            { _id: '6', name: 'OPPO', slug: 'oppo' },
            { _id: '7', name: 'vivo', slug: 'vivo' },
            { _id: '8', name: 'Realme', slug: 'realme' },
          ]).map((b) => (
            <label key={b._id} className="group flex cursor-pointer items-center gap-2.5 font-semibold text-ink-2 transition-colors hover:text-primary">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === b.slug}
                onChange={() => updateFilter('brand', b.slug)}
                className="peer sr-only"
              />
              <RadioDot checked={selectedBrand === b.slug} />
              <span>{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className={filterSection}>
        <h4 className={cn(filterSectionTitle, 'flex items-center justify-between')}>
          <span>Category</span>
          {selectedCategory && (
            <button
              onClick={() => updateFilter('category', null)}
              className="text-[10px] font-bold uppercase tracking-wide text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </h4>
        <div className="space-y-1">
          <label className="group flex cursor-pointer items-center gap-2.5 font-semibold text-ink-2 transition-colors hover:text-primary">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ''}
              onChange={() => updateFilter('category', null)}
              className="peer sr-only"
            />
            <RadioDot checked={selectedCategory === ''} />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.slug} className="group flex cursor-pointer items-center gap-2.5 font-semibold text-ink-2 transition-colors hover:text-primary">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => updateFilter('category', cat.slug)}
                className="peer sr-only"
              />
              <RadioDot checked={selectedCategory === cat.slug} />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider / Inputs */}
      <div className={filterSection}>
        <h4 className={filterSectionTitle}>Price Range (LKR)</h4>
        <form onSubmit={handleApplyPriceFilter} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-3">Min Price</span>
              <input
                type="number"
                placeholder="50,000"
                value={tempMinPrice}
                onChange={(e) => setTempMinPrice(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-3">Max Price</span>
              <input
                type="number"
                placeholder="500,000"
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Max budget slider */}
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-ink-3">
              <span>Max Budget</span>
              <span className="text-primary">
                Rs. {Number(tempMaxPrice || 600000).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={600000}
              step={10000}
              value={tempMaxPrice === '' ? 600000 : Math.min(600000, Number(tempMaxPrice))}
              onChange={(e) => setTempMaxPrice(e.target.value)}
              aria-label="Maximum price budget"
              className="h-1.5 w-full cursor-pointer accent-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-grad-primary py-2.5 text-xs font-extrabold text-white shadow-soft transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Apply Price Filter
          </button>
        </form>

        {/* Quick price chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: '< 100K', max: '100000' },
            { label: '100K–200K', min: '100000', max: '200000' },
            { label: '200K–350K', min: '200000', max: '350000' },
            { label: '> 350K', min: '350000' },
          ].map((preset) => {
            const isActivePreset = (preset.min ?? '') === minPrice && (preset.max ?? '') === maxPrice;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  if (preset.min) next.set('minPrice', preset.min);
                  else next.delete('minPrice');
                  if (preset.max) next.set('maxPrice', preset.max);
                  else next.delete('maxPrice');
                  next.set('page', '1');
                  setSearchParams(next);
                }}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all duration-200',
                  isActivePreset
                    ? 'border-transparent bg-grad-primary text-white shadow-soft'
                    : 'border-line bg-surface text-ink-2 hover:border-blue-500/50 hover:text-primary'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RAM & Storage */}
      <div className={filterSection}>
        <h4 className={filterSectionTitle}>Memory & Storage</h4>
        <div className="space-y-3">
          <div>
            <span className="mb-1.5 block text-[11px] font-bold text-ink-3">RAM</span>
            <div className="flex flex-wrap gap-1.5">
              {['4GB', '6GB', '8GB', '12GB', '16GB'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateFilter('ram', ram === r ? null : r)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-bold transition-all duration-150',
                    ram === r
                      ? 'border-transparent bg-grad-primary text-white shadow-soft'
                      : 'border-line bg-surface text-ink-2 hover:border-blue-500/50 hover:text-primary'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] font-bold text-ink-3">Internal Storage</span>
            <div className="flex flex-wrap gap-1.5">
              {['64GB', '128GB', '256GB', '512GB', '1TB'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateFilter('storage', storage === s ? null : s)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-bold transition-all duration-150',
                    storage === s
                      ? 'border-transparent bg-grad-primary text-white shadow-soft'
                      : 'border-line bg-surface text-ink-2 hover:border-blue-500/50 hover:text-primary'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Swatches */}
      <div className={filterSection}>
        <h4 className={filterSectionTitle}>Color Finish</h4>
        <div className="flex flex-wrap gap-2">
          {colorSwatches.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => updateFilter('color', color === c.name ? null : c.name)}
              title={c.name}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-transform duration-200',
                color === c.name
                  ? 'scale-125 border-primary ring-2 ring-blue-500/30'
                  : 'border-line hover:scale-110'
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Display Size */}
      <div className={filterSection}>
        <h4 className={filterSectionTitle}>Display Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {['6.1"', '6.5"', '6.7"', '6.9"'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => updateFilter('display', displaySize === d ? null : d)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-150',
                displaySize === d
                  ? 'border-transparent bg-grad-primary text-white shadow-soft'
                  : 'border-line bg-surface text-ink-2 hover:border-blue-500/50 hover:text-primary'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Network & Availability & Offers */}
      <div className={filterSection}>
        <h4 className={filterSectionTitle}>Hardware & Availability</h4>
        <label className="group flex cursor-pointer items-center gap-2.5 font-semibold text-ink-2 transition-colors hover:text-primary">
          <input
            type="checkbox"
            checked={supports5G}
            onChange={(e) => updateFilter('5g', e.target.checked ? 'true' : null)}
            className="peer sr-only"
          />
          <CheckBox checked={supports5G} />
          <span>5G Gigabit Supported</span>
        </label>
        <label className="group flex cursor-pointer items-center gap-2.5 font-semibold text-ink-2 transition-colors hover:text-primary">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
            className="peer sr-only"
          />
          <CheckBox checked={inStock} />
          <span>In Stock in Jaffna</span>
        </label>
        <label className="group flex cursor-pointer items-center gap-2.5 font-semibold text-ink-2 transition-colors hover:text-primary">
          <input
            type="checkbox"
            checked={onOffer}
            onChange={(e) => updateFilter('onOffer', e.target.checked ? 'true' : null)}
            className="peer sr-only"
          />
          <CheckBox checked={onOffer} />
          <span>On Sale / Flash Deals</span>
        </label>
      </div>

      {/* Clear Filters Reset */}
      <div className="border-t border-line pt-5">
        <button
          onClick={clearAllFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/[0.07] py-2.5 text-xs font-extrabold text-rose-500 transition-all duration-200 hover:border-rose-500/50 hover:bg-rose-500/15 active:scale-[0.98]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ================= PAGE HEADER ================= */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 aurora-bg" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-primary">Shop</span>
          </nav>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
            Premium Smartphone Store
          </span>

          <h1 className="mt-3 text-[34px] font-black leading-[1.06] tracking-[-0.03em] text-ink md:text-[46px]">
            Shop <span className="grad-text">Smartphones</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-3 md:text-[15px]">
            Discover your next device. Official sealed stock with local warranty support.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide text-ink-2 shadow-soft">
              <Store className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {totalCount || products.length} Devices Available
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide text-ink-2 shadow-soft">
              <Award className="h-3.5 w-3.5 text-violet-500" aria-hidden="true" />
              {(brands.length || 8)}+ Global Brands
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide text-ink-2 shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              100% Genuine Sealed
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide text-ink-2 shadow-soft">
              <Truck className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
              Islandwide Delivery
            </span>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 rounded-card border border-line bg-card p-3 shadow-soft md:flex-row md:items-center">
          {/* Quick keyword search */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateFilter('q', e.target.value || null)}
              placeholder="Search model, brand, specs..."
              aria-label="Search smartphones"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-[13px] font-medium text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:ring-2 focus:ring-blue-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => updateFilter('q', null)}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-3 transition-colors hover:text-rose-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Live results counter */}
          <span className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-ink-3 lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {totalCount || products.length} Results
          </span>

          {/* Sort Dropdown */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <select
              value={`${sortBy}:${sortOrder}`}
              aria-label="Sort products"
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                const next = new URLSearchParams(searchParams);
                next.set('sortBy', sb);
                next.set('sortOrder', so);
                setSearchParams(next);
              }}
              className="cursor-pointer bg-transparent text-xs font-bold text-ink focus:outline-none"
            >
              <option value="createdAt:desc">Sort: Newest First</option>
              <option value="price:asc">Sort: Price Low ? High</option>
              <option value="price:desc">Sort: Price High ? Low</option>
              <option value="salesCount:desc">Sort: Most Popular</option>
              <option value="featured:desc">Sort: Featured</option>
            </select>
          </div>

          {/* Grid vs List View Mode Buttons */}
          <div className="hidden shrink-0 items-center rounded-xl border border-line bg-surface p-1 sm:flex">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={cn(
                'rounded-lg p-1.5 transition-all duration-200',
                viewMode === 'grid'
                  ? 'bg-grad-primary text-white shadow-soft'
                  : 'text-ink-3 hover:text-ink'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={cn(
                'rounded-lg p-1.5 transition-all duration-200',
                viewMode === 'list'
                  ? 'bg-grad-primary text-white shadow-soft'
                  : 'text-ink-3 hover:text-ink'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-grad-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-soft transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] lg:hidden"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Filters ({activeFilters.length})</span>
          </button>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Active Filters:
            </span>
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-primary"
              >
                <span>{f.label}</span>
                <button
                  onClick={() => {
                    if (f.key === 'price') {
                      const next = new URLSearchParams(searchParams);
                      next.delete('minPrice');
                      next.delete('maxPrice');
                      next.set('page', '1');
                      setSearchParams(next);
                    } else {
                      updateFilter(f.key, null);
                    }
                  }}
                  aria-label={`Remove ${f.label} filter`}
                  className="transition-colors hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="ml-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider text-rose-500 transition-all duration-200 hover:bg-rose-500/10"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="sticky top-24 hidden h-fit rounded-card border border-line bg-card p-6 shadow-soft lg:col-span-1 lg:block">
            <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
              <h3 className="flex items-center gap-2.5 text-sm font-extrabold text-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-grad-primary text-white shadow-soft">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <span>Filter Devices</span>
                {activeFilters.length > 0 && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-black text-primary">
                    {activeFilters.length}
                  </span>
                )}
              </h3>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary transition-colors hover:bg-blue-500/10"
                >
                  Clear All
                </button>
              )}
            </div>
            {filterSidebar}
          </aside>

          {/* Product Grid Area */}
          <div className="space-y-8 lg:col-span-3">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              onClearFilters={clearAllFilters}
              viewMode={viewMode}
            />

            {/* Premium numbered pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Shop pages"
                className="flex items-center justify-center gap-2 pt-4"
              >
                <PageButton
                  label="Previous page"
                  disabled={page <= 1}
                  onClick={() => updateFilter('page', String(page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </PageButton>
                {(() => {
                  const windowSize = 5;
                  const start = Math.max(
                    1,
                    Math.min(
                      page - Math.floor(windowSize / 2),
                      Math.max(1, totalPages - windowSize + 1),
                    ),
                  );
                  const pages = Array.from(
                    { length: Math.min(windowSize, totalPages) },
                    (_, i) => start + i,
                  );
                  return pages.map((p) => (
                    <PageButton
                      key={p}
                      active={p === page}
                      label={`Page ${p}`}
                      onClick={() => updateFilter('page', String(p))}
                    >
                      {p}
                    </PageButton>
                  ));
                })()}
                <PageButton
                  label="Next page"
                  disabled={page >= totalPages}
                  onClick={() => updateFilter('page', String(page + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </PageButton>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Smartphones"
        position="bottom"
        size="lg"
      >
        <div className="max-h-[75vh] overflow-y-auto">
          {filterSidebar}
          <div className="pt-6">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters & View Results
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};
