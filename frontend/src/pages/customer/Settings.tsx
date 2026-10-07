import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Bell, Palette, Mail, MessageSquare, Zap } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const CustomerSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [dealNotifications, setDealNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const alertRows = [
    {
      id: 'email-alerts',
      title: 'Email Order Confirmations',
      desc: 'Receive digital invoices and courier dispatch numbers.',
      icon: Mail,
      checked: emailAlerts,
      onChange: (v: boolean) => setEmailAlerts(v),
    },
    {
      id: 'sms-alerts',
      title: 'SMS Handover Notifications',
      desc: 'Get text message updates when the driver is approaching in Jaffna.',
      icon: MessageSquare,
      checked: smsAlerts,
      onChange: (v: boolean) => setSmsAlerts(v),
    },
    {
      id: 'deal-alerts',
      title: 'Flash Sale & Price Drop Alerts',
      desc: 'Exclusive notifications when your wishlisted phones go on offer.',
      icon: Zap,
      checked: dealNotifications,
      onChange: (v: boolean) => setDealNotifications(v),
    },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
          Preferences
        </span>
        <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-3">
          Tune the appearance of your dashboard and choose how we reach you.
        </p>
      </div>

      {saved && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          Preferences saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Settings */}
        <section className="surface-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Palette className="h-5 w-5" />
            </span>
            <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink">
              Appearance &amp; Theme
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3">
            <div className="flex items-start gap-3">
              <Moon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-xs">
                <span className="block font-bold text-ink">Dark Tech Luxe Mode</span>
                <span className="mt-0.5 block leading-relaxed text-ink-3">
                  Switch between midnight tech dark mode and clean white mode.
                </span>
              </div>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
            </Button>
          </div>
        </section>

        {/* Notifications Preferences */}
        <section className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
              <Bell className="h-5 w-5" />
            </span>
            <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink">
              Communication &amp; Alerts
            </h2>
          </div>

          <div className="divide-y divide-line">
            {alertRows.map((row) => {
              const Icon = row.icon;
              return (
                <label
                  key={row.id}
                  htmlFor={row.id}
                  className="flex cursor-pointer items-center justify-between gap-4 py-3.5 first:pt-0"
                >
                  <div className="flex items-start gap-3 text-xs">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-2">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block font-bold text-ink">{row.title}</span>
                      <span className="mt-0.5 block leading-relaxed text-ink-3">{row.desc}</span>
                    </span>
                  </div>
                  <input
                    id={row.id}
                    type="checkbox"
                    checked={row.checked}
                    onChange={(e) => row.onChange(e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded text-primary focus:ring-primary"
                  />
                </label>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-line pt-4">
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
};
