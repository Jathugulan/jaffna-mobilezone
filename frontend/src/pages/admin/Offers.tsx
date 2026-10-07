import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { offersApi } from '../../api/offers.api';
import type { Offer } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { CountdownTimer } from '../../components/deals/CountdownTimer';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

export const AdminOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Offer['type']>('flashSale');
  const [discountType, setDiscountType] = useState<Offer['discountType']>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>(10);
  const [bannerUrl, setBannerUrl] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [active, setActive] = useState(true);

  const loadOffers = () => {
    offersApi.getOffers().then((res) => {
      if (res.success && res.data) {
        setOffers(res.data);
      }
    });
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openCreate = () => {
    setEditingOffer(null);
    setName('');
    setDescription('');
    setType('flashSale');
    setDiscountType('percentage');
    setDiscountValue(10);
    setBannerUrl('');
    setStartDate(new Date().toISOString().slice(0, 16));
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (off: Offer) => {
    setEditingOffer(off);
    setName(off.name);
    setDescription(off.description || '');
    setType(off.type);
    setDiscountType(off.discountType);
    setDiscountValue(off.discountValue);
    setBannerUrl(off.bannerUrl || '');
    setStartDate(new Date(off.startDate).toISOString().slice(0, 16));
    setEndDate(new Date(off.endDate).toISOString().slice(0, 16));
    setActive(off.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || discountValue === '') return;

    const payload: Partial<Offer> = {
      name,
      description,
      type,
      discountType,
      discountValue: Number(discountValue),
      bannerUrl: bannerUrl || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      active,
    };

    try {
      if (editingOffer) {
        await offersApi.updateOffer(editingOffer._id, payload);
      } else {
        await offersApi.createOffer(payload);
      }
      setIsModalOpen(false);
      loadOffers();
    } catch {
      alert('Failed to save offer.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this promotion offer?')) return;
    try {
      await offersApi.deleteOffer(id);
      loadOffers();
    } catch {
      alert('Failed to delete offer.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Discounts &amp; Campaigns
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Offers Management ({offers.length})
          </h1>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Create Special Offer
        </Button>
      </div>

      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3">Offer Name</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Countdown</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {offers.map((off) => {
                const isExpired = new Date(off.endDate).getTime() <= Date.now();
                return (
                  <tr key={off._id} className="hover:bg-elevated transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-ink block text-sm">{off.name}</span>
                      {off.description && (
                        <span className="text-ink-3 text-xs truncate max-w-xs block">
                          {off.description}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400 text-sm">
                      {off.discountType === 'percentage'
                        ? `${off.discountValue}% OFF`
                        : `Rs. ${off.discountValue.toLocaleString()} OFF`}
                    </td>

                    <td className="px-4 py-3 uppercase font-semibold text-ink-3 text-xs">
                      {off.type}
                    </td>

                    <td className="px-4 py-3 text-ink-3 text-xs">
                      <span>{formatDate(off.startDate)} → {formatDate(off.endDate)}</span>
                    </td>

                    <td className="px-4 py-3">
                      {off.active && !isExpired ? (
                        <CountdownTimer targetDate={off.endDate} size="sm" />
                      ) : (
                        <span className="text-ink-3 font-semibold text-xs">Expired / Inactive</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          off.active && !isExpired
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {off.active && !isExpired ? 'Active' : 'Expired'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(off)}
                          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          title="Edit Offer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(off._id)}
                          className="p-1.5 rounded-lg text-ink-3 hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          title="Delete Offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? 'Edit Promotion Offer' : 'Create Special Offer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="offerName">
              Offer Name *
            </label>
            <input
              id="offerName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekend Mega Flagship Sale"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="offerType">
                Campaign Type
              </label>
              <select
                id="offerType"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className={inputCls}
              >
                <option value="flashSale">Flash Sale</option>
                <option value="product">Product Specific</option>
                <option value="brand">Brand Specific</option>
                <option value="category">Category Specific</option>
                <option value="bundle">Bundle Offer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="discountType">
                Discount Type
              </label>
              <select
                id="discountType"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
                className={inputCls}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (LKR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="discountValue">
                Discount Value *
              </label>
              <input
                id="discountValue"
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : '')}
                placeholder="10"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="offerStart">
                Start Date &amp; Time
              </label>
              <input
                id="offerStart"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="offerEnd">
                End Date &amp; Time
              </label>
              <input
                id="offerEnd"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-ink-2 text-xs">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Campaign Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-line">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};