import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  CheckCircle2,
  ChevronRight,
  Bot,
  Truck,
  Package,
  Receipt,
  MapPin,
  CalendarDays,
  Bell,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { ordersApi } from '../../api/orders.api';
import { productsApi } from '../../api/products.api';
import type { Order, Product } from '../../types';
import { formatLKR, formatDate, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';
import { Button } from '../../components/common/Button';

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
  confirmed: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
  processing: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
  packed: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400',
  shipped: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400',
  outForDelivery: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400',
};

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  chip: string;
  tone: string;
}

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { count: wishlistCount } = useWishlist();

  const [orders, setOrders] = useState<Order[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, prodsRes] = await Promise.all([
          ordersApi.getMyOrders(),
          productsApi.getProducts({ limit: 4, featured: true }),
        ]);

        if (ordersRes.success && ordersRes.data) {
          setOrders(ordersRes.data);
        }
        if (prodsRes.success && prodsRes.data) {
          setRecommendations(prodsRes.data);
        }
      } catch {
        // Handle
      } finally {
      }
    };

    fetchData();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'outForDelivery'].includes(
      o.orderStatus
    )
  ).length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;

  const stats: StatCard[] = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      chip: 'Lifetime',
      tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Active / In Transit',
      value: pendingOrders,
      icon: Truck,
      chip: 'In progress',
      tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Delivered',
      value: deliveredOrders,
      icon: CheckCircle2,
      chip: 'Completed',
      tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Saved in Wishlist',
      value: wishlistCount,
      icon: Heart,
      chip: 'Wishlist',
      tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ];

  const shortcuts = [
    { label: 'My Orders', to: '/customer/orders', icon: Package },
    { label: 'Bookings', to: '/customer/bookings', icon: CalendarDays },
    { label: 'Payments', to: '/customer/payments', icon: Receipt },
    { label: 'Addresses', to: '/customer/addresses', icon: MapPin },
    { label: 'Notifications', to: '/customer/notifications', icon: Bell },
    { label: 'Settings', to: '/customer/settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting Header */}
      <div className="relative overflow-hidden rounded-hero border border-line bg-card p-6 sm:p-8 shadow-card">
        <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
              Welcome back 👋
            </span>
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
              Hello, {user?.username}!
            </h1>
            <p className="max-w-lg text-[13px] leading-relaxed text-ink-3">
              Track your smartphone orders, manage shipping addresses across Sri Lanka, or use our
              AI assistant to find device upgrades.
            </p>
          </div>

          <Link to="/customer/ai-assistant" className="shrink-0">
            <Button variant="primary" leftIcon={<Bot className="h-4 w-4" />}>
              Ask AI Shopping Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="surface-card surface-card-hover rounded-card p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
                  {stat.label}
                </span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.03em] text-ink">
                {stat.value}
              </p>
              <span className="mt-2 inline-flex items-center rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-3">
                {stat.chip}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bento: Recent Orders + Shortcuts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <section className="rounded-card border border-line bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-base font-extrabold tracking-[-0.02em] text-ink">Recent Orders</h2>
            <Link
              to="/customer/orders"
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line text-[10px] font-bold uppercase tracking-wider text-ink-3">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.slice(0, 5).map((ord) => (
                    <tr
                      key={ord._id}
                      className="transition-colors hover:bg-surface dark:hover:bg-elevated/60"
                    >
                      <td className="px-6 py-3 font-mono font-bold text-primary">
                        #{ord._id.slice(-8)}
                      </td>
                      <td className="px-6 py-3 text-ink-3">{formatDate(ord.createdAt)}</td>
                      <td className="max-w-xs truncate px-6 py-3 font-semibold text-ink-2">
                        {ord.items?.[0]?.nameSnapshot}
                        {ord.items.length > 1 && ` + ${ord.items.length - 1} more`}
                      </td>
                      <td className="px-6 py-3 font-bold text-ink">{formatLKR(ord.total)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            ORDER_STATUS_STYLES[ord.orderStatus] ||
                            'border-line bg-elevated text-ink-2'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          to={`/customer/orders/${ord._id}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-xs text-ink-3">
              You haven&apos;t placed any orders yet.{' '}
              <Link to="/shop" className="font-semibold text-primary underline">
                Browse smartphones
              </Link>
            </div>
          )}
        </section>

        {/* Shortcuts */}
        <section className="rounded-card border border-line bg-card p-6">
          <h2 className="mb-4 text-base font-extrabold tracking-[-0.02em] text-ink">
            Quick Shortcuts
          </h2>
          <div className="space-y-2">
            {shortcuts.map((sc) => {
              const Icon = sc.icon;
              return (
                <Link
                  key={sc.label}
                  to={sc.to}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition-all hover:border-primary/40 hover:bg-elevated"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-ink-2 transition-colors group-hover:text-ink">
                      {sc.label}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recommended For You */}
      {recommendations.length > 0 && (
        <section className="rounded-card border border-line bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                Curated for you
              </span>
              <h2 className="mt-1 text-base font-extrabold tracking-[-0.02em] text-ink">
                Recommended Smartphones For You
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden items-center gap-1 text-xs font-bold text-primary hover:underline sm:flex"
            >
              Browse All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {recommendations.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p.slug}`}
                className="group flex flex-col justify-between rounded-card border border-line bg-surface p-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-card"
              >
                <img
                  src={p.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                  alt={p.name}
                  className="mb-3 aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {typeof p.brand === 'object' ? p.brand?.name : 'JMZ'}
                  </span>
                  <p className="truncate text-xs font-bold text-ink">{p.name}</p>
                  <p className="mt-1 text-xs font-extrabold text-primary">
                    {formatLKR(p.offerPrice || p.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
