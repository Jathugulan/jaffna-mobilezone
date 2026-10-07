import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  usageCount: number;
  maxUsage: number;
  expiry: string;
  active: boolean;
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([
    {
      id: 'CPN-1',
      code: 'JAFFNA5',
      discountType: 'percentage',
      discountValue: 5,
      minOrder: 100000,
      usageCount: 42,
      maxUsage: 100,
      expiry: '2026-12-31',
      active: true,
    },
    {
      id: 'CPN-2',
      code: 'NEWFLAGSHIP',
      discountType: 'fixed',
      discountValue: 10000,
      minOrder: 250000,
      usageCount: 18,
      maxUsage: 50,
      expiry: '2026-11-30',
      active: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newValue, setNewValue] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(50000);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newCoupon: CouponItem = {
      id: `CPN-${Date.now()}`,
      code: newCode.toUpperCase().trim(),
      discountType: 'percentage',
      discountValue: Number(newValue),
      minOrder: Number(newMinOrder),
      usageCount: 0,
      maxUsage: 100,
      expiry: '2026-12-31',
      active: true,
    };

    setCoupons([newCoupon, ...coupons]);
    setShowAddModal(false);
    setNewCode('');
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Delete coupon code?')) {
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Vouchers &amp; Incentives
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Promotional Coupons
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Configure discount vouchers, percentage deductions, and customer checkout incentives
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setShowAddModal(true);
            setNewCode('');
            setNewValue(10);
            setNewMinOrder(50000);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3">Coupon Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-elevated transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 text-xs">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : `Rs. ${c.discountValue.toLocaleString()} OFF`}
                  </td>
                  <td className="px-4 py-3 text-ink-2">Rs. {c.minOrder.toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink-2">{c.usageCount} / {c.maxUsage}</td>
                  <td className="px-4 py-3 text-ink-3">{c.expiry}</td>
                  <td className="px-4 py-3">
                    {c.active ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wide">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-elevated text-ink-3 font-bold text-[10px] uppercase tracking-wide">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleCoupon(c.id)}
                        className="px-2.5 py-1 rounded-lg border border-line bg-surface hover:bg-elevated font-bold text-[11px] text-ink-2 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {c.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        title="Delete coupon"
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="couponCode">
              Coupon Code
            </label>
            <input
              id="couponCode"
              type="text"
              required
              placeholder="e.g. FLASH10"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className={`${inputCls} uppercase font-mono font-bold`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="couponValue">
              Discount (%)
            </label>
            <input
              id="couponValue"
              type="number"
              required
              min={1}
              max={50}
              value={newValue}
              onChange={(e) => setNewValue(Number(e.target.value))}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="couponMin">
              Minimum Order (LKR)
            </label>
            <input
              id="couponMin"
              type="number"
              required
              value={newMinOrder}
              onChange={(e) => setNewMinOrder(Number(e.target.value))}
              className={inputCls}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;