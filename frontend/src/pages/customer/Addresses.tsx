import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { contentApi } from '../../api/content.api';
import type { Address } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2';

export const CustomerAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Jaffna');
  const [district, setDistrict] = useState('Jaffna');
  const [postalCode] = useState('40000');
  const [deliveryInstructions] = useState('');

  const loadAddresses = () => {
    contentApi.getAddresses().then((res) => {
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    });
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contentApi.createAddress({
        fullName,
        phone,
        addressLine1,
        city,
        district,
        postalCode,
        province: 'Northern',
        deliveryInstructions,
        isDefault: addresses.length === 0,
      });
      setIsModalOpen(false);
      // Reset form
      setFullName('');
      setPhone('');
      setAddressLine1('');
      loadAddresses();
    } catch {
      alert('Failed to save address.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      await contentApi.deleteAddress(id);
      loadAddresses();
    } catch {
      alert('Unable to delete address.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await contentApi.setDefaultAddress(id);
      loadAddresses();
    } catch {
      alert('Unable to set as default address.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
            Delivery Locations
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
            My Addresses
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-3">
            Save your delivery points across Sri Lanka for a faster checkout.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add New Address
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`surface-card flex flex-col justify-between rounded-card p-5 transition-all ${
                addr.isDefault ? 'border-primary/50 ring-1 ring-primary/20' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-extrabold tracking-[-0.01em] text-ink">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    {addr.fullName}
                  </span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-grad-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Default
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-3">
                  <Phone className="h-3.5 w-3.5" />
                  {addr.phone}
                </p>
                <p className="text-xs leading-relaxed text-ink-2">
                  {addr.addressLine1}, {addr.city}, {addr.district} ({addr.postalCode})
                </p>
                {addr.deliveryInstructions && (
                  <p className="text-[11px] italic text-ink-3">
                    Note: {addr.deliveryInstructions}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="font-semibold text-primary hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Default Address
                  </span>
                )}

                <button
                  onClick={() => handleDelete(addr._id)}
                  aria-label="Delete address"
                  className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus-ring"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-line bg-card p-10 text-center text-xs text-ink-3">
          No saved addresses. Add an address for fast checkout!
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Delivery Address"
        description="We only use this to deliver your sealed devices safely."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="addr-name" className={labelClass}>
              Recipient Full Name *
            </label>
            <input
              id="addr-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jathugulan"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="addr-phone" className={labelClass}>
              Phone Number *
            </label>
            <input
              id="addr-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="077 123 4567"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="addr-line1" className={labelClass}>
              Address Line 1 *
            </label>
            <input
              id="addr-line1"
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Hospital Road, Jaffna"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="addr-city" className={labelClass}>
                City *
              </label>
              <input
                id="addr-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="addr-district" className={labelClass}>
                District *
              </label>
              <input
                id="addr-district"
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
