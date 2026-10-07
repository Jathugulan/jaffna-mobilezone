import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Banknote,
  Building,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/orders.api';
import type { Address, Order } from '../../types';
import { Button } from '../../components/common/Button';
import { formatLKR, cn } from '../../utils/helpers';

const STEPS = [
  { index: 1, number: '01', label: 'Delivery' },
  { index: 2, number: '02', label: 'Payment' },
  { index: 3, number: '03', label: 'Review' },
] as const;

export const Checkout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, discount, deliveryFee, total, clearCart } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Address & Contact state
  const [fullName, setFullName] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2] = useState('');
  const [city, setCity] = useState('Jaffna');
  const [district, setDistrict] = useState('Jaffna');
  const [province] = useState('Northern');
  const [postalCode, setPostalCode] = useState('40000');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'card'>('cod');

  const inputClass =
    'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-primary focus:ring-2 focus:ring-blue-500/30';
  const labelClass = 'mb-1 block font-bold text-ink-2';

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-ink">
          No items to checkout
        </h2>
        <p className="text-xs text-ink-3">
          Your cart is currently empty. Please add smartphones to proceed with checkout.
        </p>
        <Link to="/shop">
          <Button variant="primary">Browse Phones</Button>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !addressLine1 || !city) {
      setError('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const shippingAddress: Address = {
      _id: '',
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      district,
      province,
      postalCode,
      deliveryInstructions,
      isDefault: true,
    };

    try {
      const res = await ordersApi.createOrder({
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          variant: item.variant ?? undefined,
        })),
        shippingAddress,
        paymentMethod,
      });

      if (res.success && res.data) {
        setCreatedOrder(res.data);
        await clearCart();
      } else {
        throw new Error(res.message || 'Failed to place order.');
      }
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to process order. Please verify that all items are in stock.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (createdOrder) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-card border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-soft">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Order Confirmed
          </span>
          <h1 className="text-3xl font-black tracking-[-0.03em] text-ink">
            Thank You For Your Purchase!
          </h1>
          <p className="mx-auto max-w-md text-xs text-ink-3">
            Order <span className="font-mono font-bold text-primary">#{createdOrder._id.slice(-8)}</span> has been registered and sent to our Jaffna dispatch center.
          </p>
        </div>

        <div className="space-y-4 rounded-card border border-line bg-card p-6 text-left shadow-card">
          <div className="flex items-center justify-between border-b border-line pb-3 text-xs font-bold">
            <span className="text-ink-3">Delivery Address:</span>
            <span className="text-ink">
              {createdOrder.shippingAddress.addressLine1}, {createdOrder.shippingAddress.city}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-line pb-3 text-xs font-bold">
            <span className="text-ink-3">Payment Mode:</span>
            <span className="uppercase text-ink">{paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-extrabold">
            <span className="text-ink-2">Total Paid/Due:</span>
            <span className="text-primary">{formatLKR(createdOrder.total)}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
          {isAuthenticated ? (
            <Link to="/customer/orders">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Track in Customer Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="primary">Return to Storefront</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <header className="space-y-2 border-b border-line pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Safe &amp; Sealed Delivery
        </span>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
          Complete Your <span className="grad-text">Order</span>
        </h1>
      </header>

      {error && (
        <div className="rounded-card border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Progress Steps — static indicator (state changes via form buttons) */}
      <ol className="flex flex-wrap items-center gap-3 text-xs font-bold sm:gap-4" aria-label="Checkout progress">
        {STEPS.map((s) => {
          const isActive = step === s.index;
          const isDone = step > s.index;
          return (
            <li key={s.index} className="flex items-center gap-3 sm:gap-4">
              <span
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors',
                  isActive &&
                    'border-transparent bg-grad-primary text-white shadow-soft',
                  isDone &&
                    'border-blue-500/30 bg-blue-500/10 text-primary',
                  !isActive && !isDone &&
                    'border-line bg-surface text-ink-3'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={cn('text-[10px] font-black tracking-widest', isActive && 'text-white/70')}>
                  {s.number}
                </span>
                {s.label}
                {isDone && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
              {s.index < 3 && (
                <span aria-hidden="true" className="hidden h-px w-8 bg-line sm:block lg:w-14" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Steps */}
        <div className="lg:col-span-2 rounded-card border border-line bg-card p-6 shadow-card space-y-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-ink">
                Contact &amp; Shipping Address
              </h2>

              <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="co-fullname">
                    Full Name *
                  </label>
                  <input
                    id="co-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's Full Name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="co-phone">
                    Phone Number (for Courier Delivery) *
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className={labelClass} htmlFor="co-address">
                  Street Address Line 1 *
                </label>
                <input
                  id="co-address"
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. No. 42, Hospital Road"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div>
                  <label className={labelClass} htmlFor="co-city">
                    City / Town *
                  </label>
                  <input
                    id="co-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaffna"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="co-district">
                    District *
                  </label>
                  <input
                    id="co-district"
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Jaffna, Colombo, etc."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="co-postal">
                    Postal Code
                  </label>
                  <input
                    id="co-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="40000"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className={labelClass} htmlFor="co-notes">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  id="co-notes"
                  rows={2}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Special instructions for the courier driver..."
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!fullName || !phone || !addressLine1 || !city) {
                      setError('Please complete all required shipping fields.');
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-ink">
                Select Payment Option
              </h2>

              <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                {[
                  {
                    id: 'cod',
                    title: 'Cash on Delivery (Islandwide)',
                    desc: 'Pay cash upon safe handover by courier driver across Sri Lanka.',
                    icon: Banknote,
                  },
                  {
                    id: 'bank',
                    title: 'Bank Wire / Direct Transfer (BOC / Commercial Bank)',
                    desc: 'Deposit directly to our Jaffna Mobile Zone company account.',
                    icon: Building,
                  },
                  {
                    id: 'card',
                    title: 'Credit / Debit Card (Visa, Mastercard, Genie)',
                    desc: 'Fast 256-bit encrypted card processing.',
                    icon: CreditCard,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = paymentMethod === opt.id;
                  return (
                    <div
                      key={opt.id}
                      role="radio"
                      aria-checked={isSel}
                      tabIndex={0}
                      onClick={() => setPaymentMethod(opt.id as typeof paymentMethod)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPaymentMethod(opt.id as typeof paymentMethod);
                        }
                      }}
                      className={cn(
                        'flex cursor-pointer items-start gap-4 rounded-card border p-4 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                        isSel
                          ? 'border-primary bg-blue-50 ring-2 ring-blue-500/30 dark:bg-blue-500/10'
                          : 'border-line bg-card hover:border-blue-500/50'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-xl p-2 transition-colors',
                          isSel
                            ? 'bg-grad-primary text-white shadow-soft'
                            : 'border border-line bg-surface text-ink-3'
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-bold text-ink">
                          {opt.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-3">
                          {opt.desc}
                        </span>
                      </div>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-1 h-4 w-4 shrink-0 rounded-full border transition-all',
                          isSel
                            ? 'border-[5px] border-primary bg-white'
                            : 'border-line bg-surface'
                        )}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-ink">
                Final Order Confirmation
              </h2>

              <div className="space-y-3 rounded-card border border-line bg-surface p-4 text-xs text-ink-2">
                <div className="flex justify-between gap-4">
                  <span className="text-ink-3">Recipient:</span>
                  <span className="text-right font-bold text-ink">{fullName} ({phone})</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-ink-3">Shipping To:</span>
                  <span className="text-right font-bold text-ink">{addressLine1}, {city}, {district}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-ink-3">Payment Option:</span>
                  <span className="font-bold uppercase text-primary">{paymentMethod}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="sm" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handlePlaceOrder}
                  rightIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Place Order Now ({formatLKR(total)})
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="rounded-card border border-line bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-black text-ink">
              Order Items ({items.length})
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Sealed
            </span>
          </div>

          <div className="max-h-64 divide-y divide-line overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between gap-3 py-2.5 text-xs">
                <div className="min-w-0 truncate pr-2">
                  <span className="block truncate font-bold text-ink">
                    {item.product.name}
                  </span>
                  <span className="text-[11px] text-ink-3">Qty: {item.quantity}</span>
                </div>
                <span className="shrink-0 font-bold text-ink">
                  {formatLKR((item.product.offerPrice || item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-line pt-3 text-xs">
            <div className="flex justify-between text-ink-3">
              <span>Subtotal:</span>
              <span className="font-semibold text-ink-2">{formatLKR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>Savings:</span>
                <span>-{formatLKR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-3">
              <span>Islandwide Delivery:</span>
              <span className="font-semibold text-ink-2">{deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold text-ink">
              <span>Total:</span>
              <span className="text-primary">{formatLKR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
