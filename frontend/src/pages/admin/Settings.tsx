import React, { useState, useEffect } from 'react';
import { Eye, Copy, Save, Bell, Shield, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

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

export const AdminSettings: React.FC = () => {
  // Store Settings tab
  const [shopName, setShopName] = useState('Jaffna Mobile Zone');
  const [currency, setCurrency] = useState('LKR');
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(false);

  // Payment tab
  const [paymentMode, setPaymentMode] = useState('cod');
  const [cardFee, setCardFee] = useState(0);

  // Payments API
  const paymentLink =
    'https://sandbox.payhere.lk/merchant/payments?merchantid=121XXX&orderid=JML365&amount=100000.00&currency=LKR';
  const [paymode, setPaymode] = useState(false);

  const handleSaveStore = () => {
    window.alert('Store settings saved successfully!');
  };

  const handleCopyLink = () => {
    navigator.clipboard
      ?.writeText(paymentLink)
      .then(() => window.alert('Payment link copied to clipboard!'))
      .catch(() => window.alert('Copy failed. Link shown on screen.'));
  };

  useEffect(() => {
    if (paymode === true) {
      setPaymentMode('card');
    } else {
      setPaymentMode('cod');
    }
  }, [paymode]);

  const [cp, setCp] = useState<CouponItem[]>([]);
  const [cpVal, setCpVal] = useState('');
  const [cpMin, setCpMin] = useState(0);

  const generateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpVal.trim()) return;
    const newCoupon: CouponItem = {
      id: `CPN-${Date.now()}`,
      code: cpVal.toUpperCase().trim(),
      discountType: 'percentage',
      discountValue: 7,
      minOrder: cpMin,
      usageCount: 0,
      maxUsage: 50,
      expiry: '2026-12-31',
      active: true,
    };
    setCp([newCoupon, ...cp]);
    setCpVal('');
    setCpMin(0);
  };

  const toggleCoupon = (id: string) => {
    setCp(cp.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const currencyOptions = ['LKR', 'USD', 'EUR', 'GBP', 'AED'];
  const languageOptions = ['English', 'Tamil', 'Sinhala'];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
          Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
          Store Settings
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          Configure store identity, checkout, notifications, and staff access credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Identity */}
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div>
            <h2 className="font-heading font-bold text-ink">General Store Identity</h2>
            <p className="text-xs text-ink-3 mt-0.5">Name, region, currency used across checkout</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="shopName">
              Store Name
            </label>
            <input
              id="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="currency">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={inputCls}
            >
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="language">
              Default Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={inputCls}
            >
              {languageOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <Button variant="primary" size="sm" onClick={handleSaveStore} leftIcon={<Save className="w-4 h-4" />}>
            Save Store Settings
          </Button>
        </section>

        {/* Payment Gateway */}
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div>
            <h2 className="font-heading font-bold text-ink">Checkout &amp; Payment Gateway</h2>
            <p className="text-xs text-ink-3 mt-0.5">
              Choose cash on delivery or online card via PayHere
            </p>
          </div>

          <div>
            <span className="block text-xs font-bold text-ink-3 mb-2">Payment Mode</span>
            <div className="bg-surface border border-line rounded-xl p-1 inline-flex">
              <button
                type="button"
                onClick={() => setPaymode(false)}
                aria-pressed={!paymode}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !paymode ? 'bg-grad-primary text-white shadow-soft' : 'text-ink-2 hover:text-ink'
                }`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymode(true)}
                aria-pressed={paymode}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paymode ? 'bg-grad-primary text-white shadow-soft' : 'text-ink-2 hover:text-ink'
                }`}
              >
                Card (PayHere)
              </button>
            </div>
            <p className="text-[11px] text-ink-3 mt-2">
              Current mode: {paymentMode === 'card' ? 'Online Card Payment' : 'Cash on Delivery'}
            </p>
          </div>

          {paymode && (
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="cardFee">
                Card Processing Fee (%)
              </label>
              <input
                id="cardFee"
                type="number"
                min={0}
                value={cardFee}
                onChange={(e) => setCardFee(Number(e.target.value))}
                className={inputCls}
              />
              {paymentLink && (
                <div className="mt-3 border border-line bg-surface rounded-xl p-3 space-y-2">
                  <p className="text-[11px] font-bold text-ink-3 uppercase tracking-wide">
                    Test Payment Link
                  </p>
                  <p className="text-xs font-mono text-ink-2 break-all bg-elevated border border-line rounded-lg p-2">
                    {paymentLink}
                  </p>
                  <Button size="sm" variant="outline" onClick={handleCopyLink} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                    Copy Gateway Link
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-bold text-ink">Customer Notifications</p>
              <p className="text-[11px] text-ink-3">Email/SMS on order status change</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              aria-pressed={notifications}
              className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                notifications ? 'bg-primary' : 'bg-elevated border border-line'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  notifications ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Notifications Preferences */}
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-heading font-bold text-ink">Notification Preferences</h2>
              <p className="text-xs text-ink-3 mt-0.5">Choose when the team should be alerted</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Low stock alert', hint: 'When stock ≤ 5 units' },
              { label: 'New order placed', hint: 'Real-time dashboard ping' },
              { label: 'New booking request', hint: 'Showroom reservation' },
              { label: 'Coupon expiring soon', hint: '3 days before expiry' },
              { label: 'New review to moderate', hint: 'Pending approval' },
            ].map((n) => (
              <div key={n.label} className="border border-line rounded-xl bg-surface px-3.5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">{n.label}</p>
                  <p className="text-[11px] text-ink-3">{n.hint}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                  <Check className="w-3.5 h-3.5" />
                  On
                </span>
              </div>
            ))}
          </div>

          {notifications && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 rounded-lg p-2.5 font-bold">
              Notifications are currently enabled.
            </p>
          )}
        </section>

        {/* Staff & Security */}
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-heading font-bold text-ink">Staff &amp; Security</h2>
              <p className="text-xs text-ink-3 mt-0.5">Manage admin accounts and access</p>
            </div>
          </div>

          <div className="divide-y divide-line">
            {[
              { name: 'Super Admin (JMZ)', role: 'Owner · Full access', initials: 'SA' },
              { name: 'Showroom Manager', role: 'Inventory & bookings', initials: 'SM' },
              { name: 'Sales Assistant', role: 'Orders & offers', initials: 'SA' },
            ].map((staff) => (
              <div key={staff.name} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-grad-primary text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
                    {staff.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{staff.name}</p>
                    <p className="text-[11px] text-ink-3">{staff.role}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full justify-center">
            Invite Staff Member
          </Button>
        </section>
      </div>

      {/* Coupons Admin Console */}
      <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
        <div>
          <h2 className="font-heading font-bold text-ink">Promo Code Generator</h2>
          <p className="text-xs text-ink-3 mt-0.5">
            Immediately issue voucher codes usable at checkout
          </p>
        </div>

        <form onSubmit={generateCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="cp-code">
              Coupon Code
            </label>
            <input
              id="cp-code"
              type="text"
              required
              placeholder="e.g. JAZZ7"
              value={cpVal}
              onChange={(e) => setCpVal(e.target.value)}
              className={`${inputCls} uppercase font-mono font-bold`}
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="cp-min">
              Minimum Order (LKR)
            </label>
            <input
              id="cp-min"
              type="number"
              min={0}
              value={cpMin}
              onChange={(e) => setCpMin(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-1 flex items-end">
            <Button type="submit" variant="primary" size="md" className="w-full">
              Generate Coupon
            </Button>
          </div>
          <div className="sm:col-span-1 flex items-end">
            <p className="text-[11px] text-ink-3">
              7% flat · Max 50 uses
            </p>
          </div>
        </form>

        {cp.length > 0 && (
          <div className="rounded-xl border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Code</th>
                    <th className="px-4 py-2.5">Discount</th>
                    <th className="px-4 py-2.5">Min Order</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {cp.map((c) => (
                    <tr key={c.id} className="hover:bg-elevated transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs w-max">
                        {c.code}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-ink">{c.discountValue}% OFF</td>
                      <td className="px-4 py-2.5 text-ink-2">Rs. {c.minOrder.toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${
                            c.active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-elevated text-ink-3'
                          }`}
                        >
                          {c.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => toggleCoupon(c.id)}
                          className="px-2.5 py-1 rounded-lg border border-line bg-surface hover:bg-elevated font-bold text-[11px] text-ink-2 hover:text-ink transition-colors"
                        >
                          {c.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center gap-3 text-xs text-ink-3 pt-2">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          All settings are saved locally in this demo console.
        </span>
      </div>
    </div>
  );
};

export default AdminSettings;