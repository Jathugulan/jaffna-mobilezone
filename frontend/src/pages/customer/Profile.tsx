import React, { useState } from 'react';
import { Lock, Save, User, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { api } from '../../api/client';
import { getApiErrorMessage } from '../../utils/helpers';

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-ink-3';

const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2';

export const CustomerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMsg(null);

    try {
      await api.put('/users/me', {
        username,
        phone,
        profilePicture: profilePicture || null,
      });
      await refreshUser();
      setMsg('Profile updated successfully.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMsg(null);

    try {
      await api.put('/users/me/password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMsg('Password updated successfully.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update password. Verify your current password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
          Account Settings
        </span>
        <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
          Profile &amp; Security
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-3">
          Manage your personal details, contact number and account password.
        </p>
      </div>

      {msg && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          {msg}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
        >
          {error}
        </div>
      )}

      {/* Edit Profile */}
      <form onSubmit={handleUpdateProfile} className="surface-card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
            <User className="h-5 w-5" />
          </span>
          <h2 className="text-base font-extrabold tracking-[-0.02em] text-ink">
            Personal Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-username" className={labelClass}>
              Username
            </label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className={labelClass}>
              Email (Registered)
            </label>
            <input
              id="profile-email"
              type="email"
              disabled
              value={email}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="profile-phone" className={labelClass}>
            Phone Number (for SMS &amp; Courier)
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 077 123 4567"
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="profile-picture" className={labelClass}>
            Profile Image URL (Optional)
          </label>
          <input
            id="profile-picture"
            type="url"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="surface-card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <KeyRound className="h-5 w-5" />
          </span>
          <h2 className="text-base font-extrabold tracking-[-0.02em] text-ink">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className={labelClass}>
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-password" className={labelClass}>
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars with upper, lower & number"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="confirm-new-password" className={labelClass}>
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Lock className="h-3.5 w-3.5" />}
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};
