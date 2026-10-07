import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Heart className="w-8 h-8 text-rose-500" />}
          title="Your wishlist is empty"
          description="Save the flagship smartphones you love and keep track of price drops right here."
          actionText="Explore All Phones"
          onAction={() => window.location.assign('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-hero border border-line bg-card aurora-bg p-6 shadow-soft sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Saved Shortlist
            </span>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              My <span className="grad-text">Wishlist</span>
            </h1>
            <p className="text-xs text-ink-3">
              {wishlist.length} {wishlist.length === 1 ? 'device' : 'devices'} saved · Track price drops before they disappear
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-card border border-line bg-card px-4 py-2 text-xs font-bold text-ink-2 shadow-soft">
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" aria-hidden="true" />
            {wishlist.length} Saved
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {wishlist.map((product) => {
          const isOutOfStock = product.stock <= 0;
          return (
            <div
              key={product._id}
              className="group relative flex flex-col rounded-card border border-line bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover"
            >
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute right-3 top-3 z-10 rounded-full border border-line bg-surface p-2 text-ink-3 transition-all duration-200 hover:scale-110 hover:border-rose-400/50 hover:text-rose-500"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <Link
                to={`/product/${product.slug}`}
                className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-card border border-line bg-surface p-4"
              >
                <img
                  src={product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    {typeof product.brand === 'object' ? product.brand?.name : 'JMZ'}
                  </span>
                  <Link
                    to={`/product/${product.slug}`}
                    className="mt-0.5 block truncate text-sm font-bold text-ink transition-colors hover:text-primary"
                    title={product.name}
                  >
                    {product.name}
                  </Link>

                  <div className="mt-2">
                    <PriceDisplay
                      price={product.price}
                      offerPrice={product.offerPrice}
                      size="sm"
                    />
                  </div>

                  {isOutOfStock && (
                    <span className="mt-2 inline-block rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-rose-600 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t border-line pt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product, 1)}
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                  >
                    {isOutOfStock ? 'Sold Out' : 'Move to Cart'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
