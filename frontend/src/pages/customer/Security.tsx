import React, { useState } from 'react';
import { Lock, Shield, CheckCircle2, Fingerprint } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2';

export const CustomerSecurity: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccessMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
          Account Protection
        </span>
        <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
          Security &amp; Account Protection
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
          Manage your account credentials, password changes, and active session safety
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Password Change Card */}
      <section className="surface-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold tracking-[-0.02em] text-ink">
              Change Password
            </h2>
            <p className="text-xs text-ink-3">
              Ensure your account is protected with a secure password
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="sec-current" className={labelClass}>
              Current Password
            </label>
            <input
              id="sec-current"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="sec-new" className={labelClass}>
              New Password
            </label>
            <input
              id="sec-new"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="sec-confirm" className={labelClass}>
              Confirm New Password
            </label>
            <input
              id="sec-confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
              Update Password
            </Button>
          </div>
        </form>
      </section>

      {/* Account Info Card */}
      <section className="rounded-card border border-line bg-card p-6">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-extrabold tracking-[-0.01em] text-ink">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span>Active Session Protection</span>
        </h2>
        <div className="flex items-start gap-3 text-xs leading-relaxed text-ink-3">
          <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
          <p>
            Signed in as <strong className="font-bold text-ink">{user?.email}</strong>. Session
            cookies and access tokens are automatically secured.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CustomerSecurity;
