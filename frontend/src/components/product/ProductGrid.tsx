import React from 'react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { cn } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { PriceDisplay } from '../common/PriceDisplay';
import { Star, BookmarkCheck, ArrowLeftRight, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { BookingModal } from '../booking/BookingModal';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
  skeletonCount?: number;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No smartphones match your filters',
  emptyDescription = 'Try clearing some filters or searching for another smartphone model.',
  onClearFilters,
  skeletonCount = 8,
  className,
  viewMode = 'grid',
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const [bookingProduct, setBookingProduct] = React.useState<Product | null>(null);

  if (isLoading) {
    return (
      <div
        className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6'
            : 'space-y-4',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={onClearFilters ? 'Clear All Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="space-y-4">
          {products.map((product) => {
            const brandName =
              typeof product.brand === 'object' && product.brand !== null
                ? product.brand.name
                : 'Brand';
            const inWishlist = isInWishlist(product._id);
            const inCompare = isInCompare(product._id);
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col gap-5 overflow-hidden rounded-card border border-line bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover sm:flex-row sm:items-center sm:gap-6"
              >
                {/* hover glow wash */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                {/* Image */}
                <Link
                  to={`/product/${product.slug}`}
                  className="relative aspect-square w-full shrink-0 overflow-hidden rounded-featured border border-line bg-surface p-4 sm:w-44"
                >
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400'}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2 text-left w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wide text-ink-3">
                      {brandName}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-ink-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    className="block text-base font-semibold text-ink transition-colors hover:text-primary sm:text-lg"
                  >
                    {product.name}
                  </Link>

                  <p className="text-xs leading-relaxed text-ink-3 line-clamp-2">
                    {product.description || 'Authentic smartphone with official manufacturer warranty and sealed box delivery.'}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-2">
                    {product.specifications?.ram && (
                      <span className="rounded-full border border-line bg-surface px-2.5 py-0.5">
                        {product.specifications.ram} RAM
                      </span>
                    )}
                    {product.specifications?.storage && (
                      <span className="rounded-full border border-line bg-surface px-2.5 py-0.5">
                        {product.specifications.storage} Storage
                      </span>
                    )}
                    {product.specifications?.supports5G && (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-600 dark:text-emerald-400">
                        5G Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="relative flex w-full shrink-0 flex-col items-start justify-between gap-4 border-line sm:w-auto sm:items-end sm:border-l sm:pl-6">
                  <div>
                    <PriceDisplay
                      price={product.price}
                      offerPrice={product.offerPrice}
                      showSavings={true}
                      size="md"
                    />
                    <span className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-bold ${isOutOfStock ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      {isOutOfStock ? 'Sold Out' : 'Available in Jaffna'}
                    </span>
                  </div>

                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      onClick={() =>
                        inCompare ? removeFromCompare(product._id) : addToCompare(product)
                      }
                      title="Compare"
                      aria-label="Compare this product"
                      className={`rounded-xl border p-2.5 transition-all duration-200 active:scale-95 ${inCompare
                        ? 'border-blue-500/50 bg-blue-500/10 text-primary'
                        : 'border-line text-ink-3 hover:border-blue-500/50 hover:text-primary'
                        }`}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      title="Wishlist"
                      aria-label="Toggle wishlist"
                      className="rounded-xl border border-line p-2.5 text-ink-3 transition-all duration-200 hover:border-rose-400/50 hover:text-rose-500 active:scale-95"
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => setBookingProduct(product)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-grad-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-soft transition-all duration-150 hover:scale-[1.02] hover:shadow-glow active:scale-100 sm:flex-initial"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* List View Booking Modal */}
        <BookingModal
          product={bookingProduct}
          isOpen={!!bookingProduct}
          onClose={() => setBookingProduct(null)}
        />
      </>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
