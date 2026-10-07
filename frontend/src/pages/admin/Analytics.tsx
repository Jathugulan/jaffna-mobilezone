import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Award,
  BarChart3,
  RotateCcw,
  Package,
} from 'lucide-react';
import { adminApi, type AnalyticsOverview } from '../../api/admin.api';
import { formatLKR } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminAnalytics: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number; orders: number }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ _id: string; name: string; salesCount: number; revenue: number }>>([]);
  const [topBrands, setTopBrands] = useState<Array<{ _id: string; name: string; count: number; revenue: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [ovRes, revRes, prodRes, brandRes] = await Promise.all([
        adminApi.getOverview(range),
        adminApi.getRevenueAnalytics(range),
        adminApi.getTopProducts(5),
        adminApi.getTopBrands(),
      ]);

      if (ovRes.success && ovRes.data) setOverview(ovRes.data);
      if (revRes.success && revRes.data) setRevenueData(revRes.data);
      if (prodRes.success && prodRes.data) setTopProducts(prodRes.data);
      if (brandRes.success && brandRes.data) setTopBrands(brandRes.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);
  const totalRangeRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalRangeOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);

  const kpis = [
    {
      label: 'Total Revenue',
      hint: 'Gross sales in selected period',
      icon: DollarSign,
      tint: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      value: isLoading ? <Skeleton className="h-8 w-28" /> : formatLKR(overview?.totalRevenue || 0),
      accent: 'text-ink',
    },
    {
      label: 'Orders Fulfilled',
      hint: 'Processed customer orders',
      icon: ShoppingBag,
      tint: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      value: isLoading ? <Skeleton className="h-8 w-16" /> : overview?.totalOrders || 0,
      accent: 'text-ink',
    },
    {
      label: 'Active Customers',
      hint: 'Registered buyer accounts',
      icon: Users,
      tint: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      value: isLoading ? <Skeleton className="h-8 w-16" /> : overview?.totalCustomers || 0,
      accent: 'text-ink',
    },
    {
      label: 'Low Stock Alert',
      hint: 'Products with stock \u2264 5 units',
      icon: AlertTriangle,
      tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      value: isLoading ? <Skeleton className="h-8 w-16" /> : overview?.lowStockCount || 0,
      accent: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Reporting Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Analytics &amp; Reports
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Real-time business performance, revenue trends, and top converting phone models
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Date range presets"
            className="flex items-center bg-surface border border-line rounded-xl p-1"
          >
            {(['7d', '30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  range === r
                    ? 'bg-grad-primary text-white shadow-soft'
                    : 'text-ink-2 hover:text-ink hover:bg-elevated'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            isLoading={isLoading}
            title="Refresh analytics"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="p-5 rounded-card border border-line bg-card shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-3">
                  {k.label}
                </span>
                <span className={`p-2 rounded-xl ${k.tint}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className={`font-heading text-2xl sm:text-3xl font-extrabold mt-3 ${k.accent}`}>
                {k.value}
              </div>
              <p className="text-xs text-ink-3 mt-1">{k.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend Visual Bar Chart */}
      <div className="rounded-card border border-line bg-card shadow-soft p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading text-base font-extrabold text-ink">
                Revenue History ({range.toUpperCase()})
              </h2>
              <p className="text-xs text-ink-3">
                Values calibrated to Sri Lankan Rupee (LKR)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary" aria-hidden="true" />
              Daily revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-elevated border border-line" aria-hidden="true" />
              Peak {formatLKR(maxRevenue)}
            </span>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : revenueData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-ink-3 text-sm italic">
            No sales recorded during this range.
          </div>
        ) : (
          <div className="pt-4">
            {/* Summary strip */}
            <div className="flex flex-wrap gap-6 pb-4 mb-2 border-b border-line text-xs">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Period Revenue</p>
                <p className="font-heading text-lg font-extrabold text-ink">
                  {formatLKR(totalRangeRevenue)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Period Orders</p>
                <p className="font-heading text-lg font-extrabold text-ink">{totalRangeOrders}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Data Points</p>
                <p className="font-heading text-lg font-extrabold text-ink">{revenueData.length}</p>
              </div>
            </div>

            <div className="relative">
              {/* Consistent grid lines */}
              <div
                className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between pointer-events-none"
                aria-hidden="true"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-line" />
                ))}
              </div>

              <div className="h-44 flex items-end gap-2 sm:gap-4 overflow-x-auto pb-5 relative">
                {revenueData.map((point, idx) => {
                  const heightPercent = Math.max(8, Math.round((point.revenue / maxRevenue) * 100));
                  return (
                    <div key={idx} className="flex-1 min-w-[32px] flex flex-col items-center gap-2 group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-ink bg-elevated border border-line px-1.5 py-0.5 rounded shadow-card whitespace-nowrap pointer-events-none">
                        {formatLKR(point.revenue)} ({point.orders} orders)
                      </div>
                      <div className="w-full bg-elevated/60 rounded-t-lg overflow-hidden flex items-end h-32">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-primary group-hover:brightness-110 transition-all rounded-t-lg"
                        />
                      </div>
                      <span className="text-[11px] text-ink-3 truncate w-full text-center">
                        {point.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Breakdowns: Top Products & Top Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="rounded-card border border-line bg-card shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-line">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading text-base font-extrabold text-ink">
                Top Performing Phones
              </h2>
              <p className="text-xs text-ink-3">Ranked by units sold and revenue</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-xs text-ink-3 italic py-6 text-center">
              No sales data recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {topProducts.map((p, idx) => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                      <p className="text-xs text-ink-3">{p.salesCount} units ordered</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">
                    {formatLKR(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Brands */}
        <div className="rounded-card border border-line bg-card shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-line">
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Package className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading text-base font-extrabold text-ink">
                Brand Sales Distribution
              </h2>
              <p className="text-xs text-ink-3">Revenue contribution by manufacturer</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : topBrands.length === 0 ? (
            <p className="text-xs text-ink-3 italic py-6 text-center">
              No brand order metrics available yet.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {topBrands.map((b, idx) => (
                <div key={b._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center text-[11px] font-bold text-violet-600 dark:text-violet-400 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{b.name}</p>
                      <p className="text-xs text-ink-3">{b.count} sales</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-ink shrink-0">
                    {formatLKR(b.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminAnalytics;
