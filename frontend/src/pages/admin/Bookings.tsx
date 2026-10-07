import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface AdminBooking {
  _id: string;
  bookingNumber: string;
  productName: string;
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
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
  createdAt: string;
}

const statusChip = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'confirmed':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'ready_for_pickup':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    case 'out_for_delivery':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'cancelled':
      return 'bg-elevated text-ink-3 border-line';
    default:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  }
};

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load bookings from storage or generate demo
    const defaultData: AdminBooking[] = [
      {
        _id: 'JMZ-BK-918234',
        bookingNumber: 'JMZ-BK-918234',
        productName: 'Samsung Galaxy S26 Ultra 5G',
        variant: { ram: '12GB', storage: '256GB', color: 'Titanium Gray', price: 289000 },
        customerName: 'Sivatharan K.',
        customerPhone: '+94 77 234 5678',
        customerEmail: 'siva@example.com',
        type: 'pickup',
        preferredDate: '2026-10-04',
        preferredTimeSlot: '11:00 AM – 01:00 PM',
        status: 'confirmed',
        createdAt: '2026-10-03',
      },
      {
        _id: 'JMZ-BK-748192',
        bookingNumber: 'JMZ-BK-748192',
        productName: 'Apple iPhone 16 Pro Max',
        variant: { ram: '8GB', storage: '512GB', color: 'Desert Titanium', price: 445000 },
        customerName: 'Kavitha R.',
        customerPhone: '+94 71 890 1234',
        customerEmail: 'kavitha@example.com',
        type: 'delivery',
        preferredDate: '2026-10-05',
        status: 'pending',
        createdAt: '2026-10-03',
      },
      {
        _id: 'JMZ-BK-639102',
        bookingNumber: 'JMZ-BK-639102',
        productName: 'Xiaomi 15 Pro 5G',
        variant: { ram: '16GB', storage: '512GB', color: 'Black', price: 215000 },
        customerName: 'Niranjan M.',
        customerPhone: '+94 76 543 2109',
        type: 'pickup',
        preferredDate: '2026-10-03',
        status: 'ready_for_pickup',
        createdAt: '2026-10-02',
      },
    ];

    try {
      const stored = localStorage.getItem('jmz_customer_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookings([...parsed, ...defaultData.filter(d => !parsed.some((p: AdminBooking) => p._id === d._id))]);
      } else {
        setBookings(defaultData);
      }
    } catch {
      setBookings(defaultData);
    }
  }, []);

  const handleUpdateStatus = (id: string, newStatus: AdminBooking['status']) => {
    const updated = bookings.map((b) => (b._id === id ? { ...b, status: newStatus } : b));
    setBookings(updated);
    try {
      localStorage.setItem('jmz_customer_bookings', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'ready_for_pickup', label: 'Ready for Pickup' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Showroom Reservations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Phone Booking Reservations
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Manage showroom counter reservations, pickup time slots, and verify customer identities
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search reference, customer..."
            aria-label="Search bookings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-line text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            aria-pressed={filterStatus === tab.id}
            className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              filterStatus === tab.id
                ? 'bg-grad-primary text-white shadow-soft'
                : 'border border-line bg-card text-ink-2 hover:text-ink hover:bg-elevated'
            }`}
          >
            {tab.label.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Reserved Smartphone</th>
                <th className="px-4 py-3">Method &amp; Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((b) => (
                <tr key={b._id} className="hover:bg-elevated transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary text-xs">
                    {b.bookingNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink">{b.customerName}</p>
                    <p className="text-[11px] text-ink-3">{b.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink">{b.productName}</p>
                    <p className="text-[11px] text-ink-3">
                      {b.variant?.ram} / {b.variant?.storage} · {b.variant?.color}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    <span className="capitalize block font-semibold text-xs">{b.type}</span>
                    <span className="text-ink-3 text-xs">{b.preferredDate}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`capitalize inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusChip(b.status)}`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'ready_for_pickup')}
                          className="px-2.5 py-1 rounded-lg bg-primary hover:brightness-110 text-white font-bold text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Ready at Store
                        </button>
                      )}
                      {b.status === 'ready_for_pickup' && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'completed')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                        >
                          Mark Collected
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                          className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-3">
                    No bookings match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;