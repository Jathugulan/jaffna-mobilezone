import React, { useState, useEffect } from 'react';
import { Calendar, Store, Truck, X, CalendarDays, Ticket } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

interface CustomerBooking {
  _id: string;
  bookingNumber: string;
  productName: string;
  productImage?: string;
  variant?: {
    ram?: string;
    storage?: string;
    color?: string;
    price?: number;
  };
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: 'pickup' | 'delivery';
  preferredDate: string;
  preferredTimeSlot?: string;
  deliveryAddress?: string;
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
  createdAt: string;
}

export const CustomerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);

  useEffect(() => {
    // Load from localStorage or mock initial state
    try {
      const stored = localStorage.getItem('jmz_customer_bookings');
      if (stored) {
        setBookings(JSON.parse(stored));
      } else {
        const sample: CustomerBooking[] = [
          {
            _id: 'JMZ-BK-918234',
            bookingNumber: 'JMZ-BK-918234',
            productName: 'Samsung Galaxy S26 Ultra 5G',
            productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400',
            variant: {
              ram: '12GB',
              storage: '256GB',
              color: 'Titanium Gray',
              price: 289000,
            },
            customerName: 'Customer',
            customerPhone: '+94 77 123 4567',
            type: 'pickup',
            preferredDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
            preferredTimeSlot: '11:00 AM – 01:00 PM',
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          },
        ];
        setBookings(sample);
        localStorage.setItem('jmz_customer_bookings', JSON.stringify(sample));
      }
    } catch {
      // quota fallback
    }
  }, []);

  const handleCancelBooking = (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    const updated = bookings.map((b) =>
      b._id === id ? { ...b, status: 'cancelled' as const } : b
    );
    setBookings(updated);
    localStorage.setItem('jmz_customer_bookings', JSON.stringify(updated));
    if (selectedBooking?._id === id) {
      setSelectedBooking(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status: CustomerBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            ● Confirmed &amp; Reserved
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            ● Ready at Showroom
          </span>
        );
      case 'completed':
        return (
          <span className="whitespace-nowrap rounded-full border border-line bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
            ✓ Collected
          </span>
        );
      case 'cancelled':
        return (
          <span className="whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            ✕ Cancelled
          </span>
        );
      default:
        return (
          <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            ● Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
            Reservations
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
            My Phone Bookings
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
            Track your reserved smartphones for counter collection or islandwide delivery
          </p>
        </div>

        <Link to="/shop">
          <Button variant="primary" size="sm" leftIcon={<CalendarDays className="h-4 w-4" />}>
            Book Another Phone
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            aria-pressed={filterStatus === st}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
              filterStatus === st
                ? 'border-transparent bg-grad-primary text-white shadow-soft'
                : 'border-line bg-card text-ink-2 hover:border-primary/40 hover:text-ink'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((bk) => (
            <div
              key={bk._id}
              className="surface-card surface-card-hover flex flex-col justify-between gap-6 rounded-card p-5 sm:p-6 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    bk.productImage ||
                    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300'
                  }
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border border-line bg-surface object-contain p-2"
                />
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {bk.bookingNumber}
                    </span>
                    {getStatusBadge(bk.status)}
                  </div>
                  <h2 className="text-base font-extrabold tracking-[-0.02em] text-ink">
                    {bk.productName}
                  </h2>
                  <p className="text-xs text-ink-3">
                    {bk.variant?.ram} / {bk.variant?.storage} · {bk.variant?.color}
                  </p>
                </div>
              </div>

              {/* Details & Action */}
              <div className="w-full space-y-2 border-t border-line pt-3 text-xs sm:w-auto sm:border-0 sm:pt-0">
                <div className="flex items-center gap-2 font-semibold text-ink-2">
                  {bk.type === 'pickup' ? (
                    <>
                      <Store className="h-3.5 w-3.5 text-primary" />
                      <span>Showroom Pickup (Hospital Rd, Jaffna)</span>
                    </>
                  ) : (
                    <>
                      <Truck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Islandwide Delivery</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-ink-3">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {bk.preferredDate} ({bk.preferredTimeSlot || 'Standard Hours'})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {bk.status !== 'cancelled' && bk.status !== 'completed' && (
                    <button
                      onClick={() => handleCancelBooking(bk._id)}
                      className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10 focus-ring"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBooking(bk)}
                    className="rounded-xl bg-grad-primary px-3 py-1.5 text-xs font-bold text-white shadow-soft transition-all hover:brightness-110 focus-ring"
                  >
                    View Reservation Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 rounded-card border border-dashed border-line bg-card px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-primary">
            <Ticket className="h-6 w-6" />
          </span>
          <h2 className="text-base font-extrabold text-ink">No bookings found</h2>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-ink-3">
            You have not reserved any smartphones yet. Reserve today to hold sealed units without
            upfront payment.
          </p>
          <div className="pt-1">
            <Link to="/shop">
              <Button variant="primary" size="sm">
                Browse Phones
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md space-y-4 rounded-modal border border-line bg-elevated p-6 shadow-premium animate-fadeInSoft">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-extrabold tracking-[-0.02em] text-ink">
                Reservation Ticket
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                aria-label="Close ticket"
                className="focus-ring rounded-full border border-line bg-card p-2 text-ink-3 transition-colors hover:border-primary hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 py-2 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Booking Reference
              </span>
              <p className="font-mono text-xl font-black text-primary">
                {selectedBooking.bookingNumber}
              </p>
            </div>

            <div className="space-y-2 rounded-card border border-line bg-surface p-4 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-ink-3">Device</span>
                <span className="text-right font-bold text-ink">
                  {selectedBooking.productName}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink-3">Configuration</span>
                <span className="text-right font-bold text-ink">
                  {selectedBooking.variant?.ram} / {selectedBooking.variant?.storage}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink-3">Color Finish</span>
                <span className="text-right font-bold text-ink">
                  {selectedBooking.variant?.color}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink-3">Showroom</span>
                <span className="text-right font-bold text-ink">Hospital Road, Jaffna</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <span className="font-bold text-ink-2">Payable Amount</span>
                <span className="text-sm font-black text-primary">
                  Rs. {selectedBooking.variant?.price?.toLocaleString() || '—'}
                </span>
              </div>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-ink-3">
              Please present this reservation ticket at our counter in Jaffna to inspect and collect
              your phone.
            </p>

            <Button variant="primary" className="w-full" onClick={() => setSelectedBooking(null)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
