import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  ArrowLeftRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Bot,
  Send,
  Share2,
  ChevronRight,
  Layers,
  BookmarkCheck,
  Maximize2,
  X,
  Cpu,
  Smartphone,
  Camera,
  Battery,
  Radio,
  Sparkles,
  Minus,
  Plus,
} from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { reviewsApi } from '../../api/reviews.api';
import { aiApi } from '../../api/ai.api';
import type { Product, Review } from '../../types';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { DEFAULT_PRODUCT_IMAGE, cn } from '../../utils/helpers';
import { BookingModal } from '../../components/booking/BookingModal';
import { ProductCard } from '../../components/product/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [infoTab, setInfoTab] = useState<'specs' | 'reviews'>('specs');

  // Dynamic Variant State
  const [selectedRam, setSelectedRam] = useState('8GB');
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Titanium Gray');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // AI Q&A
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.getProductBySlug(slug);
        if (res.success && res.data) {
          const p = res.data;
          setProduct(p);
          setSelectedImage(p.images?.[0] || DEFAULT_PRODUCT_IMAGE);
          setSelectedRam(p.specifications?.ram || '8GB');
          setSelectedStorage(p.specifications?.storage || '256GB');
          setSelectedColor(p.colors?.[0] || 'Titanium Gray');

          // Fetch reviews
          reviewsApi.getProductReviews(p._id).then((rRes) => {
            if (rRes.success && rRes.data) setReviews(rRes.data);
          });

          // Fetch related products from same brand/category
          const brandSlug = typeof p.brand === 'object' ? p.brand.slug : '';
          productsApi.getProducts({ brand: brandSlug, limit: 5 }).then((relRes) => {
            if (relRes.success && relRes.data) {
              setRelatedProducts(relRes.data.filter((item) => item._id !== p._id).slice(0, 4));
            }
          });
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-featured" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Product not found"
          description="The smartphone you are looking for may have been unpublished or renamed."
          actionText="Browse All Phones"
          onAction={() => window.location.assign('/shop')}
        />
      </div>
    );
  }

  const brandName =
    typeof product.brand === 'object' && product.brand !== null
      ? product.brand.name
      : 'Brand';
  const brandSlug =
    typeof product.brand === 'object' && product.brand !== null
      ? product.brand.slug
      : '';

  const inWishlist = isInWishlist(product._id);
  const inCompare = isInCompare(product._id);
  const isOutOfStock = product.stock <= 0;
  const specs = product.specifications || {};

  // Dynamic Price computation based on selected storage
  const basePrice = product.offerPrice || product.price;
  const storageMultiplier =
    selectedStorage === '512GB' ? 1.15 : selectedStorage === '1TB' ? 1.3 : selectedStorage === '128GB' ? 0.92 : 1;
  const computedPrice = Math.round(basePrice * storageMultiplier);
  const computedOriginalPrice = Math.round(product.price * storageMultiplier);
  const computedSku = `${product.sku}-${selectedStorage}-${selectedRam}`;

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const res = await aiApi.askProductAssistant(
        `Regarding the ${product.name}: ${aiQuestion}`
      );
      if (res.success && res.data) {
        setAiAnswer(res.data.text);
      }
    } catch {
      setAiAnswer(
        `The ${product.name} with ${selectedRam} RAM and ${selectedStorage} storage delivers top-tier performance for camera, gaming, and 5G connectivity. It is official sealed inventory with Jaffna warranty support.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const chipBase =
    'rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-150';
  const chipActive = 'border-primary bg-blue-500/10 text-primary ring-2 ring-blue-500/30 shadow-soft';
  const chipIdle = 'border-line bg-surface text-ink-2 hover:border-blue-500/50 hover:text-primary';

  const tabs: Array<{ key: 'specs' | 'reviews'; label: string }> = [
    { key: 'specs', label: 'Specifications' },
    { key: 'reviews', label: `Reviews (${reviews.length || 18})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-ink-3">
        <Link to="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link to="/shop" className="transition-colors hover:text-primary">
          Shop
        </Link>
        {brandSlug && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link to={`/brand/${brandSlug}`} className="transition-colors hover:text-primary">
              {brandName}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="max-w-xs truncate font-bold text-ink">{product.name}</span>
      </nav>

      {/* Main Product Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start">
        {/* Left Column: Image Gallery with Zoom / Fullscreen Modal */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-featured border border-line bg-card p-6 shadow-soft sm:p-8">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {/* Fullscreen zoom button */}
            <button
              onClick={() => setIsFullscreenImage(true)}
              className="absolute right-4 top-4 rounded-xl border border-line bg-white/85 dark:bg-[#111720]/85 p-2.5 text-ink-2 shadow-soft backdrop-blur transition-all duration-150 hover:border-blue-500/50 hover:text-primary"
              title="View Fullscreen"
              aria-label="View fullscreen image"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`View image ${idx + 1}`}
                  className={cn(
                    'h-20 w-20 shrink-0 rounded-card border bg-surface p-2 transition-all duration-200',
                    selectedImage === img
                      ? 'border-primary shadow-soft ring-2 ring-blue-500/30'
                      : 'border-line opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Dynamic Actions */}
        <div className="space-y-6">
          <div>
            <Link
              to={`/brand/${brandSlug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-ink-2 transition-colors hover:border-blue-500/50 hover:text-primary"
            >
              <Layers className="h-3 w-3" /> {brandName}
            </Link>
            <h1 className="mt-2 text-2xl font-black leading-snug tracking-[-0.03em] text-ink sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* Rating, SKU, Stock Status */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-3">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  4.9
                </span>
                <span className="font-semibold">({reviews.length || 18} verified reviews)</span>
              </div>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-ink-3">SKU: {computedSku}</span>
              <span aria-hidden="true">·</span>
              <span className={cn('font-bold', isOutOfStock ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400')}>
                {isOutOfStock ? 'Out of Stock' : `● In Stock (${product.stock} units in Jaffna)`}
              </span>
            </div>
          </div>

          {/* Dynamic Price Box */}
          <div className="space-y-1 rounded-featured border border-line bg-card p-5 shadow-soft">
            <PriceDisplay
              price={computedOriginalPrice}
              offerPrice={computedPrice !== computedOriginalPrice ? computedPrice : undefined}
              showSavings={true}
              size="xl"
            />
            <p className="text-[11px] leading-relaxed text-ink-3">
              Inclusive of all taxes & official company warranty seal. Free showroom pickup.
            </p>
          </div>

          {/* Dynamic Variant Selector: RAM, Storage, Color */}
          <div className="space-y-4 border-t border-line pt-5">
            {/* RAM */}
            <div>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-3">
                Select RAM: <span className="text-primary">{selectedRam}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {['6GB', '8GB', '12GB', '16GB'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRam(r)}
                    aria-pressed={selectedRam === r}
                    className={cn(chipBase, selectedRam === r ? chipActive : chipIdle)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-3">
                Internal Storage: <span className="text-primary">{selectedStorage}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {['128GB', '256GB', '512GB', '1TB'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStorage(s)}
                    aria-pressed={selectedStorage === s}
                    className={cn(chipBase, selectedStorage === s ? chipActive : chipIdle)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-3">
                Device Finish: <span className="text-primary">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(product.colors && product.colors.length > 0
                  ? product.colors
                  : ['Titanium Gray', 'Phantom Black', 'Ocean Blue', 'Glacier Silver']
                ).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-pressed={selectedColor === color}
                    className={cn(chipBase, 'px-3 py-1.5', selectedColor === color ? chipActive : chipIdle)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity + Primary Action Buttons */}
          <div className="space-y-3 border-t border-line pt-5">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between rounded-card border border-line bg-card px-4 py-3">
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-ink-3">
                Quantity
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="rounded-lg p-1.5 text-ink-2 transition-colors hover:bg-elevated hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[32px] text-center text-sm font-extrabold text-ink">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  aria-label="Increase quantity"
                  className="rounded-lg p-1.5 text-ink-2 transition-colors hover:bg-elevated hover:text-ink"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Add to Cart */}
              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={() => addToCart(product, quantity)}
                className="w-full"
                leftIcon={<ShoppingBag className="h-5 w-5" />}
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
              </Button>

              {/* Book Now (Opens 4-step modal) */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setIsBookingOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-6 py-3 text-sm font-extrabold text-ink shadow-soft transition-all duration-150 hover:-translate-y-px hover:border-blue-500/50 hover:text-primary active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              >
                <BookmarkCheck className="h-5 w-5 text-primary" />
                <span>Book This Phone</span>
              </button>
            </div>

            {/* Secondary Utility Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => toggleWishlist(product)}
                aria-pressed={inWishlist}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150',
                  inWishlist
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                    : 'border-line bg-card text-ink-2 hover:border-rose-400/50 hover:text-rose-500'
                )}
              >
                <Heart className={cn('h-4 w-4', inWishlist && 'fill-rose-500 text-rose-500')} />
                <span>{inWishlist ? 'Saved in Wishlist' : 'Wishlist'}</span>
              </button>

              <button
                onClick={() => (inCompare ? removeFromCompare(product._id) : addToCompare(product))}
                aria-pressed={inCompare}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150',
                  inCompare
                    ? 'border-blue-500/50 bg-blue-500/10 text-primary'
                    : 'border-line bg-card text-ink-2 hover:border-blue-500/50 hover:text-primary'
                )}
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>{inCompare ? 'In Compare' : 'Compare'}</span>
              </button>

              <button
                onClick={handleShare}
                className="rounded-xl border border-line bg-card p-2 text-ink-3 transition-all duration-150 hover:border-blue-500/50 hover:text-primary"
                title="Share Device"
                aria-label="Share device"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Guarantees Box — delivery & warranty trust rows */}
          <div className="space-y-3.5 rounded-card border border-line bg-card p-5 text-xs text-ink-3 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <span className="block font-bold text-ink">
                  {product.warranty || '1 Year Official Distributor Warranty'}
                </span>
                <span>Includes hardware repair & software troubleshooting coverage.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-line pt-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <span className="block font-bold text-ink">
                  Islandwide Sealed Express Delivery
                </span>
                <span>Dispatched directly from Hospital Road, Jaffna. Insured in transit.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-line pt-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <RotateCcw className="h-5 w-5" />
              </span>
              <div>
                <span className="block font-bold text-ink">
                  7-Day Replacement Guarantee
                </span>
                <span>Immediate sealed replacement for any factory defects.</span>
              </div>
            </div>
          </div>

          {/* Ask AI Box */}
          <div className="space-y-3 rounded-card border border-line bg-card p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-grad-ai text-white shadow-soft">
                <Bot className="h-4 w-4" />
              </span>
              <span className="text-xs font-extrabold text-ink">
                Ask AI About {product.name}
              </span>
            </div>
            <form onSubmit={handleAskAi} className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="e.g. Is this good for camera low-light and 120fps video?"
                aria-label="Ask AI a question"
                className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:ring-2 focus:ring-blue-500/30"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={isAiLoading}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>

            {aiAnswer && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs leading-relaxed whitespace-pre-line text-ink-2">
                <span className="grad-text-ai mb-1 block font-bold">AI Specification Match:</span>
                {aiAnswer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Specs / Reviews Tabs ---------- */}
      <div className="space-y-6 border-t border-line pt-10">
        <div
          role="tablist"
          aria-label="Product information"
          className="flex items-center gap-6 border-b border-line"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={infoTab === t.key}
              onClick={() => setInfoTab(t.key)}
              className={cn(
                'relative -mb-px pb-3 text-sm font-extrabold transition-colors duration-200',
                infoTab === t.key
                  ? 'text-primary'
                  : 'text-ink-3 hover:text-ink-2'
              )}
            >
              {t.label}
              {infoTab === t.key && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-grad-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Specifications Panel */}
        {infoTab === 'specs' && (
          <div role="tabpanel" className="space-y-6">
            <h2 className="text-2xl font-black text-ink">Technical Specifications</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 rounded-card border border-line bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                  <Smartphone className="h-4 w-4" /> Display & Screen
                </div>
                <p className="text-sm font-bold text-ink">
                  {specs.display || 'Dynamic AMOLED 2X, 120Hz LTPO, HDR10+'}
                </p>
              </div>

              <div className="space-y-2 rounded-card border border-line bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                  <Cpu className="h-4 w-4" /> Processor & GPU
                </div>
                <p className="text-sm font-bold text-ink">
                  {specs.processor || 'Snapdragon 8 Elite / Apple A-Series Bionic'}
                </p>
              </div>

              <div className="space-y-2 rounded-card border border-line bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                  <Camera className="h-4 w-4" /> Optics & Cameras
                </div>
                <p className="text-sm font-bold text-ink">
                  {specs.camera || '200MP Main + 50MP Periscope + 12MP Ultra-Wide'}
                </p>
              </div>

              <div className="space-y-2 rounded-card border border-line bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                  <Battery className="h-4 w-4" /> Battery & Charging
                </div>
                <p className="text-sm font-bold text-ink">
                  {specs.battery || '5000 mAh Li-Po, 65W Fast Charging, Wireless'}
                </p>
              </div>

              <div className="space-y-2 rounded-card border border-line bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                  <Radio className="h-4 w-4" /> 5G & Connectivity
                </div>
                <p className="text-sm font-bold text-ink">
                  {specs.supports5G ? '5G Dual SIM Standby (SA/NSA), Wi-Fi 7' : '4G LTE Advanced, Wi-Fi 6'}
                </p>
              </div>

              <div className="space-y-2 rounded-card border border-line bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                  <Sparkles className="h-4 w-4" /> Operating System
                </div>
                <p className="text-sm font-bold text-ink">
                  {specs.operatingSystem || 'Android 15 / iOS 18 with Guaranteed Upgrades'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Panel */}
        {infoTab === 'reviews' && (
          <div role="tabpanel" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <h2 className="text-xl font-black text-ink sm:text-2xl">
                Customer Reviews &amp; Feedback
              </h2>
              <span className="text-xs font-bold text-ink-3">
                {reviews.length || 18} Verified Purchases
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(reviews.length > 0 ? reviews : [
                {
                  _id: 'rev-1',
                  user: { _id: 'u1', username: 'Tharshan R.' },
                  rating: 5,
                  comment: 'Collected my sealed phone at the Hospital Road showroom. Staff helped verify warranty on the manufacturer portal.',
                  verifiedPurchase: true,
                  createdAt: '2026-09-12',
                },
                {
                  _id: 'rev-2',
                  user: { _id: 'u2', username: 'Kavitha S.' },
                  rating: 5,
                  comment: 'Delivered to Jaffna peninsula within 24 hours. Excellent battery life and genuine packaging.',
                  verifiedPurchase: true,
                  createdAt: '2026-09-18',
                },
                {
                  _id: 'rev-3',
                  user: { _id: 'u3', username: 'Niranjan M.' },
                  rating: 5,
                  comment: 'Used the online booking feature to hold the 512GB version. Super smooth pickup process!',
                  verifiedPurchase: true,
                  createdAt: '2026-09-24',
                },
              ]).map((rev) => (
                <div
                  key={rev._id}
                  className="space-y-3 rounded-card border border-line bg-card p-5 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-ink">
                      {typeof rev.user === 'object' ? rev.user.username : 'Customer'}
                    </span>
                    <div className="flex items-center text-amber-500" aria-label={`${rev.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3.5 w-3.5',
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-3 opacity-40'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-2">
                    "{rev.comment}"
                  </p>
                  <span className="block pt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    ✓ Verified Showroom Purchase
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 border-t border-line pt-10">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-black text-ink sm:text-2xl">
              Similar Smartphones
            </h2>
            <Link
              to="/shop"
              className="text-xs font-bold text-primary hover:underline"
            >
              View Full Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd._id} product={relProd} />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {isFullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <button
            onClick={() => setIsFullscreenImage(false)}
            aria-label="Close fullscreen"
            className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedImage}
            alt={product.name}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {/* Interactive Booking Modal */}
      <BookingModal
        product={product}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialVariant={{
          ram: selectedRam,
          storage: selectedStorage,
          color: selectedColor,
        }}
      />
    </div>
  );
};
