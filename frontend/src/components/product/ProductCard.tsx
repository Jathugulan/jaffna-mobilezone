import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ArrowLeftRight,
  Eye,
  Star,
  Zap,
  BookmarkCheck,
  ShoppingBag,
} from 'lucide-react';
import type { Product } from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { cn, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';
import { QuickViewModal } from './QuickViewModal';
import { BookingModal } from '../booking/BookingModal';

export interface ProductCardProps {
  product: Product;
  className?: string;
  onBookNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const brandName =
    typeof product.brand === 'object' && product.brand !== null
      ? product.brand.name
      : 'Brand';

  const inWishlist = isInWishlist(product._id);
  const inCompare = isInCompare(product._id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const image = product.images?.[0] || DEFAULT_PRODUCT_IMAGE;

  // Calculate discount percentage if not pre-set
  const discountPercentage =
    product.discountPercentage ||
    (product.offerPrice && product.offerPrice < product.price
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : undefined);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart(product, 1);
    setIsAdding(false);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product);
    }
  };

  const badgeBase =
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide';

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-card border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover',
          className
        )}
      >
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-surface">
          <Link
            to={`/product/${product.slug}`}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
              }}
            />

            {/* light gradient scrim for badge + action legibility */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-slate-900/10"
            />

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                <span className="rounded-full bg-slate-900/85 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white ring-1 ring-white/20">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Floating Quick Action Overlay */}
            <div className="absolute bottom-3 inset-x-3 flex justify-center opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-md ring-1 ring-white/15">
                <Eye className="w-3.5 h-3.5" /> Quick Preview
              </span>
            </div>
          </Link>

          {/* Compact badges — top left */}
          <div className="absolute left-2.5 top-2.5 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1">
            {discountPercentage && discountPercentage > 0 ? (
              <span className={cn(badgeBase, 'bg-rose-500 text-white shadow-sm')}>
                -{discountPercentage}%
              </span>
            ) : product.deal ? (
              <span className={cn(badgeBase, 'bg-rose-500 text-white shadow-sm')}>
                <Zap className="w-3 h-3 fill-white" /> Flash Deal
              </span>
            ) : null}

            {product.newArrival && (
              <span className={cn(badgeBase, 'bg-blue-600 text-white shadow-sm')}>New</span>
            )}

            {product.bestSeller && !product.newArrival && (
              <span className={cn(badgeBase, 'bg-violet-500 text-white shadow-sm')}>
                Best Seller
              </span>
            )}

            {product.specifications?.supports5G && (
              <span className={cn(badgeBase, 'bg-emerald-500/95 text-white shadow-sm')}>5G</span>
            )}
          </div>
        </div>

        {/* Product Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wide text-ink-3">
              {brandName}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-ink-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              4.8 <span className="font-medium text-ink-3">(120)</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors hover:text-primary sm:text-[15px]"
          >
            {product.name}
          </Link>

          {/* Key Specs Pills */}
          {(product.specifications?.ram || product.specifications?.storage) && (
            <p className="mt-1 text-[11px] font-medium text-ink-3">
              {[product.specifications?.ram, product.specifications?.storage]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}

          {/* Live Stock Indicator */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold">
            {isOutOfStock ? (
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="flex items-center gap-1 text-amber-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Low Stock ({product.stock} units left)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                In Stock · Jaffna Showroom
              </span>
            )}
          </div>

          {/* Pricing & CTAs */}
          <div className="mt-auto pt-3.5">
            <div className="flex items-end justify-between gap-2 border-t border-line pt-3.5">
              <PriceDisplay
                price={product.price}
                offerPrice={product.offerPrice}
                showSavings={true}
                size="md"
              />

              {/* Wishlist + Compare */}
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={handleToggleCompare}
                  title={inCompare ? 'Remove from comparison' : 'Compare model'}
                  aria-label="Compare"
                  className={cn(
                    'rounded-full border p-2 transition-all duration-200 active:scale-95',
                    inCompare
                      ? 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-line text-ink-3 hover:border-blue-500/50 hover:text-primary'
                  )}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleWishlist}
                  aria-label="Toggle wishlist"
                  className={cn(
                    'rounded-full border p-2 transition-all duration-200 active:scale-95',
                    inWishlist
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                      : 'border-line text-ink-3 hover:border-rose-400/50 hover:text-rose-500'
                  )}
                >
                  <Heart className={cn('w-4 h-4', inWishlist && 'fill-rose-500 text-rose-500')} />
                </button>
              </div>
            </div>

            {/* Action Buttons: [View Details] [Book Now] */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                to={`/product/${product.slug}`}
                className="flex items-center justify-center rounded-xl border border-line bg-surface px-2.5 py-2 text-center text-xs font-bold text-ink-2 transition-all duration-150 hover:-translate-y-px hover:border-blue-500/50 hover:text-primary"
              >
                View Details
              </Link>

              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="flex items-center justify-center gap-1 rounded-xl bg-grad-primary px-2.5 py-2 text-xs font-extrabold text-white shadow-soft transition-all duration-150 hover:scale-[1.02] hover:shadow-glow active:scale-100"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Book Now</span>
              </button>
            </div>

            {/* Optional Add To Cart small CTA */}
            <button
              disabled={isOutOfStock || isAdding}
              onClick={handleAddToCart}
              className={cn(
                'mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl border py-2 text-[11px] font-bold transition-all duration-150',
                isOutOfStock
                  ? 'cursor-not-allowed border-line text-ink-3 opacity-60'
                  : 'border-line text-ink-2 hover:-translate-y-px hover:border-blue-500/50 hover:text-primary'
              )}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />

      {/* Booking Modal */}
      <BookingModal
        product={product}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
};
