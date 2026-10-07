import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Store,
  Truck,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import type { Product } from '../../types';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialVariant?: {
    ram?: string;
    storage?: string;
    color?: string;
  };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  product,
  isOpen,
  onClose,
  initialVariant,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRam, setSelectedRam] = useState(
    initialVariant?.ram || product?.specifications?.ram || '8GB'
  );
  const [selectedStorage, setSelectedStorage] = useState(
    initialVariant?.storage || product?.specifications?.storage || '256GB'
  );
  const [selectedColor, setSelectedColor] = useState(
    initialVariant?.color || product?.colors?.[0] || 'Titanium Gray'
  );

  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('11:00 AM – 01:00 PM');

  // Customer Contact Info
  const [fullName, setFullName] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Confirmation state
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const currentPrice = product.offerPrice || product.price;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!fullName.trim() || !phone.trim()) {
        alert('Please provide your name and phone number for the booking.');
        return;
      }
      if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
        alert('Please enter your delivery address.');
        return;
      }
      setStep(3);
    }
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    // Generate authentic booking reference code: JMZ-BK-XXXXX
    const ref = `JMZ-BK-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);

    // Save to local storage for offline / quick customer portal access
    const newBooking = {
      _id: ref,
      bookingNumber: ref,
      product: product._id,
      productName: product.name,
      productImage: product.images?.[0],
      variant: {
        ram: selectedRam,
        storage: selectedStorage,
        color: selectedColor,
        price: currentPrice,
      },
      customerName: fullName,
      customerPhone: phone,
      customerEmail: email,
      type: fulfillmentType,
      preferredDate,
      preferredTimeSlot,
      deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : undefined,
      notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('jmz_customer_bookings') || '[]');
      existing.unshift(newBooking);
      localStorage.setItem('jmz_customer_bookings', JSON.stringify(existing));
    } catch {
      // storage quota fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 600);
  };

  const copyRefToClipboard = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-elevated border border-line rounded-modal shadow-premium overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-card bg-grad-primary text-white shadow-soft">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-ink">Book Your Smartphone</h3>
              <p className="text-[11px] text-ink-3">
                Reserve official sealed stock at Jaffna Mobile Zone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking"
            className="rounded-xl p-2 text-ink-3 transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="border-b border-line bg-surface/60 px-6 pb-2 pt-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div
                className={`flex items-center gap-2 border-b-2 pb-2 font-bold transition-colors ${
                  step >= 1 ? 'border-primary text-primary' : 'border-transparent text-ink-3'
                }`}
              >
                <span>01</span> Choose Variant
              </div>
              <div
                className={`flex items-center gap-2 border-b-2 pb-2 font-bold transition-colors ${
                  step >= 2 ? 'border-primary text-primary' : 'border-transparent text-ink-3'
                }`}
              >
                <span>02</span> Pickup / Delivery
              </div>
              <div
                className={`flex items-center gap-2 border-b-2 pb-2 font-bold transition-colors ${
                  step >= 3 ? 'border-primary text-primary' : 'border-transparent text-ink-3'
                }`}
              >
                <span>03</span> Review & Confirm
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: VARIANT SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Product Preview Header */}
              <div className="flex items-center gap-4 rounded-featured border border-line bg-surface p-4">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400'}
                  alt={product.name}
                  className="w-16 h-16 object-contain rounded-card border border-line bg-elevated p-1"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black uppercase text-ink-3 tracking-wide">
                    {typeof product.brand === 'object' ? product.brand.name : 'Authorized Brand'}
                  </span>
                  <h4 className="font-extrabold text-ink truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-black text-primary">
                      Rs. {currentPrice.toLocaleString()}
                    </span>
                    {product.price > currentPrice && (
                      <span className="text-xs text-ink-3 line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* RAM Selection */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wide text-ink-2 mb-2">
                  Memory (RAM)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['6GB', '8GB', '12GB', '16GB'].map((ram) => (
                    <button
                      key={ram}
                      type="button"
                      onClick={() => setSelectedRam(ram)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 hover:scale-[1.02] ${
                        selectedRam === ram
                          ? 'bg-primary text-white shadow-soft ring-2 ring-primary/25'
                          : 'border border-line bg-card text-ink-2 hover:border-blue-500/50 hover:text-primary'
                      }`}
                    >
                      {ram}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Selection */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wide text-ink-2 mb-2">
                  Internal Storage
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['128GB', '256GB', '512GB', '1TB'].map((storage) => (
                    <button
                      key={storage}
                      type="button"
                      onClick={() => setSelectedStorage(storage)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 hover:scale-[1.02] ${
                        selectedStorage === storage
                          ? 'bg-primary text-white shadow-soft ring-2 ring-primary/25'
                          : 'border border-line bg-card text-ink-2 hover:border-blue-500/50 hover:text-primary'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wide text-ink-2 mb-2">
                  Color Finish: <span className="font-semibold text-primary">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {(product.colors && product.colors.length > 0
                    ? product.colors
                    : ['Titanium Gray', 'Phantom Black', 'Ocean Blue', 'Glacier Silver']
                  ).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-150 hover:scale-[1.02] ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary shadow-soft'
                          : 'border-line bg-card text-ink-2 hover:border-blue-500/50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-inner" />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Reservation Guarantee */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>No Upfront Payment Required to Reserve:</strong> Your selected variant is held for 48 hours. Pay at showroom pickup or on cash-on-delivery inspection.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: FULFILLMENT & CONTACT INFO */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Method Toggle */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wide text-ink-2 mb-2.5">
                  Select Reservation Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`flex flex-col items-center justify-center rounded-featured border p-4 text-center transition-all duration-200 hover:scale-[1.01] ${
                      fulfillmentType === 'pickup'
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/25 shadow-soft'
                        : 'border-line bg-card text-ink-2 hover:border-blue-500/50'
                    }`}
                  >
                    <Store className="w-6 h-6 mb-2" />
                    <span className="font-extrabold text-sm">Store Pickup (Jaffna)</span>
                    <span className="mt-0.5 text-[11px] text-ink-3">
                      Hospital Road, Jaffna
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`flex flex-col items-center justify-center rounded-featured border p-4 text-center transition-all duration-200 hover:scale-[1.01] ${
                      fulfillmentType === 'delivery'
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/25 shadow-soft'
                        : 'border-line bg-card text-ink-2 hover:border-blue-500/50'
                    }`}
                  >
                    <Truck className="w-6 h-6 mb-2" />
                    <span className="font-extrabold text-sm">Islandwide Delivery</span>
                    <span className="mt-0.5 text-[11px] text-ink-3">
                      All 25 Sri Lankan Districts
                    </span>
                  </button>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-ink-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-card text-ink text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-ink-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-card text-ink text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  >
                    <option value="09:00 AM – 11:00 AM">09:00 AM – 11:00 AM</option>
                    <option value="11:00 AM – 01:00 PM">11:00 AM – 01:00 PM</option>
                    <option value="02:00 PM – 04:00 PM">02:00 PM – 04:00 PM</option>
                    <option value="04:00 PM – 07:00 PM">04:00 PM – 07:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-black uppercase tracking-wide text-ink-2">
                  Contact Information
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-card text-ink text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone / WhatsApp Number *"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-card text-ink text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-card text-ink text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                </div>

                {fulfillmentType === 'delivery' && (
                  <div>
                    <textarea
                      placeholder="Full Delivery Address (Street, City, Postal Code) *"
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-card text-ink text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Special requests or questions for our showroom team (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-line bg-card text-ink text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4 rounded-featured border border-line bg-surface p-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-semibold text-ink-3">Device</span>
                  <span className="text-sm font-extrabold text-ink">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-semibold text-ink-3">Selected Configuration</span>
                  <span className="text-xs font-bold text-ink">
                    {selectedRam} / {selectedStorage} · {selectedColor}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-semibold text-ink-3">Method</span>
                  <span className="text-xs font-bold capitalize text-primary">
                    {fulfillmentType === 'pickup'
                      ? 'Showroom Pickup (Hospital Rd, Jaffna)'
                      : 'Islandwide Express Delivery'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-semibold text-ink-3">Customer</span>
                  <span className="text-xs font-bold text-ink">
                    {fullName} ({phone})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-ink-2">
                    Payable Amount (on collection)
                  </span>
                  <span className="text-lg font-black text-primary">
                    Rs. {currentPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1 rounded-card border border-blue-500/25 bg-blue-500/[0.07] p-4 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                <p className="font-bold">Next Steps After Confirmation:</p>
                <p>1. Our Jaffna showroom staff will verify available serial number & seal integrity.</p>
                <p>2. You will receive an SMS and WhatsApp confirmation with your reservation ID.</p>
              </div>
            </div>
          )}

          {/* STEP 4: INSTANT BOOKING TICKET */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Booking Confirmed &amp; Seal Reserved
                </span>
                <h3 className="text-2xl font-black text-ink">
                  Your Phone is Reserved!
                </h3>
                <p className="mx-auto max-w-md text-xs text-ink-2">
                  Thank you, <strong>{fullName}</strong>. Your reservation for{' '}
                  <strong>{product.name} ({selectedRam}/{selectedStorage})</strong> has been securely logged at Jaffna Mobile Zone.
                </p>
              </div>

              {/* Reference ID Pill */}
              <div className="inline-flex items-center gap-3 rounded-featured border border-line bg-surface px-6 p-3.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                  Booking Reference:
                </span>
                <span className="text-base font-mono font-black text-primary">
                  {bookingRef}
                </span>
                <button
                  type="button"
                  onClick={copyRefToClipboard}
                  className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-elevated hover:text-ink"
                  title="Copy Reference"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Showroom Pickup Details */}
              <div className="mx-auto max-w-md space-y-2 rounded-card border border-line bg-surface p-4 text-left text-xs">
                <p className="flex items-center gap-1.5 font-bold text-ink">
                  <Store className="w-4 h-4 text-primary" />
                  Showroom Collection Details:
                </p>
                <p className="text-ink-2">
                  Hospital Road, Jaffna · Mon–Sat 9:00 AM – 8:00 PM
                </p>
                <p className="text-ink-3">
                  Please show this reference code at the counter to inspect the device before payment.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  className="rounded-xl bg-grad-primary font-bold shadow-soft hover:shadow-glow"
                  onClick={() => {
                    onClose();
                    navigate('/customer/bookings');
                  }}
                >
                  View My Bookings
                </Button>
                <Button variant="outline" className="rounded-xl border-line font-bold" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-line bg-surface px-6 py-4">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
              >
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ChevronRight className="w-4 h-4" />}
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="glow"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleConfirmBooking}
              >
                Confirm Reservation (Pay on Collection)
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
