import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import type { Product } from '../../types';
import { Button } from '../../components/common/Button';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.getProducts({ limit: 50 });
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = (id: string, delta: number) => {
    const updated = products.map((p) =>
      p._id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    );
    setProducts(updated);
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    if (stockFilter === 'low') return matchesSearch && p.stock > 0 && p.stock <= 5;
    if (stockFilter === 'out') return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const filterTabs: Array<{ id: 'all' | 'low' | 'out'; label: string; count: number; activeCls: string }> = [
    { id: 'all', label: 'All Items', count: products.length, activeCls: 'bg-grad-primary text-white shadow-soft' },
    { id: 'low', label: 'Low Stock', count: lowCount, activeCls: 'bg-amber-500 text-white shadow-soft' },
    { id: 'out', label: 'Out of Stock', count: outCount, activeCls: 'bg-rose-500 text-white shadow-soft' },
  ];

  const statusChip = (stock: number) => {
    if (stock === 0)
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    if (stock <= 5)
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  };

  const statusLabel = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'Healthy';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Warehouse &amp; Allocation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Inventory &amp; Stock Allocation
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Monitor real-time physical showroom stock, reserved units, and threshold alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search product or SKU..."
              aria-label="Search inventory"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-line text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <Button variant="outline" size="sm" onClick={fetchInventory} title="Refresh inventory">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-card border border-line bg-card shadow-soft space-y-1">
          <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wide">Total Catalog Items</span>
          <p className="font-heading text-2xl font-extrabold text-ink">{products.length}</p>
        </div>
        <div className="p-5 rounded-card border border-amber-500/25 bg-amber-500/5 space-y-1">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Low Stock Alerts
          </span>
          <p className="font-heading text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {lowCount}
          </p>
        </div>
        <div className="p-5 rounded-card border border-rose-500/25 bg-rose-500/5 space-y-1">
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
            Out of Stock
          </span>
          <p className="font-heading text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {outCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStockFilter(tab.id)}
            aria-pressed={stockFilter === tab.id}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              stockFilter === tab.id
                ? tab.activeCls
                : 'border border-line bg-card text-ink-2 hover:text-ink hover:bg-elevated'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Smartphone</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price (LKR)</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-elevated transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-ink text-xs">{p.sku}</td>
                  <td className="px-4 py-3 font-bold text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink-3">
                    {typeof p.brand === 'object' ? p.brand.name : 'Brand'}
                  </td>
                  <td className="px-4 py-3 font-extrabold text-ink">
                    Rs. {(p.offerPrice || p.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-ink">{p.stock} units</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${statusChip(p.stock)}`}>
                      {statusLabel(p.stock)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleAdjustStock(p._id, -1)}
                        className="w-7 h-7 rounded-lg border border-line bg-surface hover:bg-elevated font-bold text-ink-2 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Deduct 1"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAdjustStock(p._id, 1)}
                        className="w-7 h-7 rounded-lg border border-line bg-surface hover:bg-elevated font-bold text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Add 1"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleAdjustStock(p._id, 10)}
                        className="px-2 py-1 rounded-lg bg-primary hover:brightness-110 text-white font-bold text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-3">
                    No inventory items match the current filter.
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

export default AdminInventory;