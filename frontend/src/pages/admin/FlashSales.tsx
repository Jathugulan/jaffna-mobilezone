import React, { useState, useEffect } from 'react';
import { Plus, Zap, Trash2 } from 'lucide-react';
import { offersApi } from '../../api/offers.api';
import { productsApi } from '../../api/products.api';
import type { FlashSale, Product } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatLKR } from '../../utils/helpers';
import { CountdownTimer } from '../../components/deals/CountdownTimer';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

export const AdminFlashSales: React.FC = () => {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [productId, setProductId] = useState('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const loadData = async () => {
    try {
      const [salesRes, prodsRes] = await Promise.all([
        offersApi.getFlashSales(),
        productsApi.getProducts({ limit: 100 }),
      ]);
      if (salesRes.success && salesRes.data) setSales(salesRes.data);
      if (prodsRes.success && prodsRes.data) {
        setProducts(prodsRes.data);
        if (prodsRes.data.length > 0) setProductId(prodsRes.data[0]._id);
      }
    } finally {
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const productFor = (sale: FlashSale): Product | undefined => {
    const first = Array.isArray(sale.products) ? sale.products[0] : undefined;
    if (first && typeof first === 'object') return first;
    return products.find((p) => p._id === first);
  };

  const salePriceOf = (sale: FlashSale): number => {
    const product = productFor(sale);
    if (!product) return 0;
    return sale.discountType === 'percentage'
      ? Math.round(product.price * (1 - sale.discountValue / 100))
      : Math.max(0, product.price - sale.discountValue);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProduct = products.find((p) => p._id === productId);
    if (!selectedProduct || salePrice === '') return;

    try {
      // Flash sales are stored as discount offers on the selected product.
      await offersApi.createFlashSale({
        name: `Flash Sale — ${selectedProduct.name}`,
        discountType: 'fixed',
        discountValue: Math.max(0, selectedProduct.price - Number(salePrice)),
        products: [selectedProduct._id],
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        active: true,
      });
      setIsModalOpen(false);
      loadData();
    } catch {
      alert('Failed to schedule flash sale.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this flash sale?')) return;
    try {
      await offersApi.deleteFlashSale(id);
      loadData();
    } catch {
      alert('Unable to delete flash sale.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-rose-500" /> Limited Time Sales
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Flash Sales Schedule
          </h1>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Schedule Flash Sale
        </Button>
      </div>

      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3">Smartphone</th>
                <th className="px-4 py-3">Sale Price</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Live Timer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-elevated transition-colors">
                  <td className="px-4 py-3 font-bold text-ink">{productFor(sale)?.name || sale.name}</td>
                  <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {formatLKR(salePriceOf(sale))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                    {sale.discountType === 'percentage'
                      ? `${sale.discountValue}% off`
                      : `${formatLKR(sale.discountValue)} off`}
                  </td>
                  <td className="px-4 py-3">
                    <CountdownTimer targetDate={sale.endDate} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {sale.active ? 'Running' : 'Ended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(sale._id)}
                      title="Delete Flash Sale"
                      className="p-1.5 rounded-lg text-ink-3 hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-3">
                    No flash sales currently scheduled. Click &quot;Schedule Flash Sale&quot; above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Flash Sale">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="saleProduct">
              Select Smartphone *
            </label>
            <select
              id="saleProduct"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={inputCls}
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Regular: {formatLKR(p.price)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="salePrice">
              Flash Sale Price (LKR) *
            </label>
            <input
              id="salePrice"
              type="number"
              required
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : '')}
              placeholder="219999"
              className={inputCls}
            />
            <span className="block mt-1 text-[11px] text-ink-3">
              The discount is calculated from the selected phone's regular price.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="saleStart">
                Start Time
              </label>
              <input
                id="saleStart"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="saleEnd">
                End Time
              </label>
              <input
                id="saleEnd"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-line">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Schedule Sale
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};