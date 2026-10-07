import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Smartphone,
  AlertTriangle,
  Gift,
  Bot,
  Clock,
} from 'lucide-react';
import { adminApi, type AnalyticsOverview } from '../../api/admin.api';
import { ordersApi } from '../../api/orders.api';
import { productsApi } from '../../api/products.api';
import type { Order, Product } from '../../types';
import { formatLKR, formatDate } from '../../utils/helpers';
import { Button } from '../../components/common/Button';

const orderStatusChip = (status: string): string => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'cancelled':
    case 'returned':
    case 'refunded':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    case 'shipped':
    case 'outForDelivery':
    case 'packed':
    case 'processing':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    default:
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
  }
};

export const AdminDashboard: React.FC = () => {
  const [range, setRange] = useState('30d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, ordRes, prodRes] = await Promise.all([
          adminApi.getOverview(range),
          ordersApi.getAdminOrders(),
          productsApi.getProducts({ limit: 5 }),
        ]);

        if (ovRes.success && ovRes.data) {
          setOverview(ovRes.data);
        }
        if (ordRes.success && ordRes.data) {
          setAllOrders(ordRes.data);
          setRecentOrders(ordRes.data.slice(0, 5));
        }
        if (prodRes.success && prodRes.data) {
          setLowStockProducts(prodRes.data.filter((p) => p.stock <= 5));
        }
      } catch {
        // Handle
      } finally {
      }
    };

    fetchData();
  }, [range]);

  const pendingOrders = allOrders.filter((o) => o.orderStatus === 'pending').length;
  const lowStockCount = overview?.lowStockCount || 0;
  const activeOffersCount = overview?.activeOffersCount || 0;

  const rangeChip = (
    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
      {range} window
    </span>
  );

  const cards: Array<{
    title: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
    chip: React.ReactNode;
  }> = [
    {
      title: 'Gross Revenue',
      value: formatLKR(overview?.totalRevenue || 0),
      icon: DollarSign,
      chip: rangeChip,
    },
    {
      title: 'Total Orders',
      value: overview?.totalOrders || 0,
      icon: ShoppingBag,
      chip: (
        <span className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
          Fulfilled
        </span>
      ),
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      chip:
        pendingOrders > 0 ? (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Needs review
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            All clear
          </span>
        ),
    },
    {
      title: 'Active Customers',
      value: overview?.totalCustomers || 0,
      icon: Users,
      chip: (
        <span className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
          Registered
        </span>
      ),
    },
    {
      title: 'Live Products',
      value: overview?.totalProducts || 0,
      icon: Smartphone,
      chip: (
        <span className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
          Catalog
        </span>
      ),
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockCount,
      icon: AlertTriangle,
      chip:
        lowStockCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
            Restock
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Healthy
          </span>
        ),
    },
    {
      title: 'Active Offers',
      value: activeOffersCount,
      icon: Gift,
      chip:
        activeOffersCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Running
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
            Idle
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Executive Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Store Performance Console
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Live revenue, order flow, and inventory health across the showroom
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date range picker */}
          <div className="flex items-center rounded-xl border border-line bg-surface p-1 text-xs font-semibold">
            {['today', '7d', '30d', '3m', '1y'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  range === r
                    ? 'bg-grad-primary text-white shadow-soft'
                    : 'text-ink-2 hover:text-ink hover:bg-elevated'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Link to="/admin/ai">
            <Button variant="secondary" size="sm" leftIcon={<Bot className="w-4 h-4" />}>
              AI Business Intelligence
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-4 sm:p-5 rounded-card border border-line bg-card shadow-soft flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wide leading-tight">
                  {c.title}
                </span>
                <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-ink mt-3 truncate">
                {c.value}
              </p>
              <div className="mt-2">{c.chip}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 rounded-card border border-line bg-card shadow-soft p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-base font-extrabold text-ink">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-ink-3 mt-0.5">The five latest checkouts in the store</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Manage All Orders →
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-ink-3 uppercase text-[11px] tracking-wide font-semibold border-b border-line">
                  <tr>
                    <th className="py-3 pr-4">Order</th>
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-elevated transition-colors">
                      <td className="py-3 pr-4 font-mono font-bold text-primary text-xs">
                        #{ord._id.slice(-8)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-ink">
                        {ord.shippingAddress?.fullName || 'Customer'}
                      </td>
                      <td className="py-3 pr-4 text-ink-3 text-xs">{formatDate(ord.createdAt)}</td>
                      <td className="py-3 pr-4 font-bold text-ink">{formatLKR(ord.total)}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${orderStatusChip(
                            ord.orderStatus
                          )}`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-ink-3">
              No orders placed yet. Orders will appear here as soon as customers checkout.
            </div>
          )}
        </div>

        {/* Low Stock & Fast Actions */}
        <div className="space-y-6">
          {/* Low Stock Alert Box */}
          <div className="rounded-card border border-line bg-card shadow-soft p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-extrabold text-ink flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Low Stock Inventory</span>
              </h2>
              <Link
                to="/admin/products"
                className="text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                View All
              </Link>
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between text-xs p-3 rounded-xl bg-surface border border-line"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-ink truncate">{p.name}</p>
                      <p className="text-ink-3 text-[11px] font-mono">SKU: {p.sku}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-3 py-4 text-center">
                All catalog models currently have healthy stock levels.
              </p>
            )}
          </div>

          {/* Quick Admin Actions */}
          <div className="rounded-card border border-line bg-card shadow-soft p-6 space-y-3">
            <div>
              <h2 className="font-heading text-sm font-extrabold text-ink">
                Quick Management Shortcuts
              </h2>
              <p className="text-xs text-ink-3 mt-0.5">Jump straight into common admin tasks</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/admin/products/create"
                className="p-3 rounded-xl bg-surface border border-line text-ink-2 font-bold hover:bg-elevated hover:border-primary hover:text-primary transition-colors text-center"
              >
                + Add Phone
              </Link>
              <Link
                to="/admin/brands"
                className="p-3 rounded-xl bg-surface border border-line text-ink-2 font-bold hover:bg-elevated hover:border-primary hover:text-primary transition-colors text-center"
              >
                + New Brand
              </Link>
              <Link
                to="/admin/offers"
                className="p-3 rounded-xl bg-surface border border-line text-ink-2 font-bold hover:bg-elevated hover:border-primary hover:text-primary transition-colors text-center"
              >
                + Create Offer
              </Link>
              <Link
                to="/admin/flash-sales"
                className="p-3 rounded-xl bg-surface border border-line text-ink-2 font-bold hover:bg-elevated hover:border-primary hover:text-primary transition-colors text-center"
              >
                + Flash Sale
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
