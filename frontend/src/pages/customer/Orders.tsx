import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import type { Order } from '../../types';
import { formatLKR, formatDate } from '../../utils/helpers';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi.getMyOrders().then((res) => {
      if (res.success && res.data) {
        setOrders(res.data);
      }
      setIsLoading(false);
    });
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
      confirmed: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
      processing: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
      shipped: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400',
      outForDelivery: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400',
      delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
      cancelled: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400',
    };
    return (
      <span
        className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          styles[status] || 'border-line bg-elevated text-ink-2'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
          Purchases
        </span>
        <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
          My Order History
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-3">
          Every sealed device you have reserved or purchased, with live delivery status.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-card" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="surface-card surface-card-hover rounded-card p-5 sm:p-6"
            >
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-primary">
                      Order #{ord._id.slice(-8)}
                    </span>
                    <span className="text-ink-3">·</span>
                    <span className="text-xs text-ink-3">{formatDate(ord.createdAt)}</span>
                    {getStatusBadge(ord.orderStatus)}
                  </div>

                  <div className="space-y-1">
                    {ord.items.map((item, idx) => (
                      <p key={idx} className="text-xs font-semibold text-ink-2">
                        {item.quantity}x {item.nameSnapshot} — {formatLKR(item.priceSnapshot)}
                      </p>
                    ))}
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-ink-3">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    Delivering to:{' '}
                    <strong className="font-bold text-ink-2">
                      {ord.shippingAddress.city}, Sri Lanka
                    </strong>
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line pt-4 md:flex-col md:items-end md:justify-start md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <div className="md:text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-3">
                      Total Amount
                    </span>
                    <span className="font-heading text-lg font-extrabold tracking-[-0.02em] text-ink">
                      {formatLKR(ord.total)}
                    </span>
                  </div>

                  <Link to={`/customer/orders/${ord._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Track &amp; Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="No orders placed yet"
          description="Explore our smartphones catalog and your orders will show up here."
          actionText="Browse Phones"
          onAction={() => window.location.assign('/shop')}
        />
      )}
    </div>
  );
};
