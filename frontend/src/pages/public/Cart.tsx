import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatLKR, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, discount, deliveryFee, total, updateQuantity, removeFromCart, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your shopping cart is empty"
          description="Browse our catalog to select your favorite flagship smartphones."
          actionText="Explore Phones"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-line pb-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Review Order
          </span>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
            Shopping <span className="grad-text">Cart</span>
          </h1>
          <p className="text-xs font-bold text-ink-3">
            {items.length} {items.length === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>

        <button
          onClick={clearCart}
          className="rounded-full border border-line bg-card px-4 py-2 text-xs font-bold text-ink-2 transition-colors hover:border-rose-400/50 hover:text-rose-500"
        >
          Clear Cart
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const currentPrice = item.product.offerPrice || item.product.price;
            return (
              <div
                key={item.product._id}
                className="flex flex-col gap-4 rounded-card border border-line bg-card p-4 shadow-soft transition-all duration-300 hover:border-blue-500/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0 rounded-card border border-line bg-surface p-2">
                    <img
                      src={item.product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                      alt={item.product.name}
                      className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      {typeof item.product.brand === 'object' ? item.product.brand?.name : 'JMZ'}
                    </span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="block truncate text-sm font-bold text-ink hover:text-primary sm:text-base"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-xs font-black text-primary">
                      {formatLKR(currentPrice)}
                    </p>
                  </div>
                </div>

                {/* Stepper & Total */}
                <div className="flex items-center justify-between gap-6 w-full border-t border-line pt-3 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
                  <div className="flex items-center rounded-xl border border-line bg-surface p-1">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="rounded-lg px-2.5 py-1 text-ink-3 transition-colors hover:bg-card hover:text-ink"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-xs font-black text-ink">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="rounded-lg px-2.5 py-1 text-ink-3 transition-colors hover:bg-card hover:text-ink"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="block text-sm font-extrabold text-ink">
                      {formatLKR(currentPrice * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-ink-3 transition-colors hover:text-rose-500"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="rounded-card border border-line bg-card p-6 space-y-6 shadow-card sticky top-24 sm:p-8">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="text-lg font-black text-ink">Order Summary</h2>
            <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-ink-3">
              {items.length} items
            </span>
          </div>

          <div className="space-y-3 text-xs text-ink-3 sm:text-sm">
            <div className="flex justify-between">
              <span>Catalog Subtotal</span>
              <span className="font-bold text-ink">{formatLKR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Offer Savings</span>
                <span>-{formatLKR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee (Sri Lanka)</span>
              <span className="font-bold text-ink">
                {deliveryFee === 0 ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    Free
                  </span>
                ) : (
                  formatLKR(deliveryFee)
                )}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-t border-line pt-3 text-lg font-extrabold text-ink sm:text-xl">
              <span>Total Payable</span>
              <span className="text-primary">{formatLKR(total)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/checkout')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Checkout
          </Button>

          <div className="space-y-2 border-t border-line pt-4 text-[11px] font-medium text-ink-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Islandwide Delivery within 24-48 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <span>100% Genuine Sealed Unit with Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
