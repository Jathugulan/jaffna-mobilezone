import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatLKR, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';
import { Button } from '../common/Button';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    total,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCartDrawer}
      />

      {/* Drawer Panel */}
      <div className="glass-card relative z-50 flex h-full w-full max-w-md flex-col rounded-l-featured border-line shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-primary text-white shadow-soft">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-black leading-tight text-ink">
                Shopping Cart
              </h3>
              <p className="text-[11px] font-bold text-ink-3">{itemCount} items</p>
            </div>
          </div>
          <button
            onClick={closeCartDrawer}
            aria-label="Close cart"
            className="rounded-lg border border-line bg-surface p-2 text-ink-3 transition-all duration-200 hover:scale-110 hover:border-rose-400/50 hover:text-rose-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-card border border-line bg-blue-50 text-primary dark:bg-blue-500/10">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h4 className="text-base font-black text-ink">Your cart is empty</h4>
              <p className="mx-auto mt-1 max-w-xs text-xs text-ink-3">
                Explore our catalog of smartphones and deals to add items.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-6"
                onClick={() => {
                  closeCartDrawer();
                  navigate('/shop');
                }}
              >
                Browse Phones
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const currentPrice = item.product.offerPrice || item.product.price;
              return (
                <div
                  key={item.product._id}
                  className="flex gap-4 rounded-card border border-line bg-surface p-3 transition-colors hover:border-blue-500/40"
                >
                  <div className="shrink-0 rounded-card border border-line bg-card p-1.5">
                    <img
                      src={item.product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                      alt={item.product.name}
                      className="h-14 w-14 object-contain"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h4 className="truncate text-xs font-bold text-ink sm:text-sm">
                        {item.product.name}
                      </h4>
                      <p className="mt-0.5 text-xs font-black text-primary">
                        {formatLKR(currentPrice)}
                      </p>
                    </div>

                    {/* Quantity Selector & Remove */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-line bg-card p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="rounded-md p-1 text-ink-3 transition-colors hover:bg-surface hover:text-ink"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="rounded-md p-1 text-ink-3 transition-colors hover:bg-surface hover:text-ink"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="rounded-md p-1 text-ink-3 transition-colors hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Calculations */}
        {items.length > 0 && (
          <div className="space-y-3 border-t border-line bg-slate-50/60 dark:bg-white/[0.02] p-5">
            <div className="space-y-1.5 text-xs text-ink-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-ink">{formatLKR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Offer Savings</span>
                  <span>-{formatLKR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Islandwide Delivery</span>
                <span className="font-bold text-ink">
                  {deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm font-black text-ink">
                <span>Estimated Total</span>
                <span className="text-primary">{formatLKR(total)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                closeCartDrawer();
                navigate('/checkout');
              }}
            >
              Proceed to Checkout
            </Button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-ink-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              <span>100% Secure Checkout &amp; Genuine Warranty</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
