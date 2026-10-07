import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, CircleUserRound, Mail, ShieldCheck, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/helpers';
import { fileToDownscaledDataUrl } from '../../utils/image';
import { AuthShell } from '../../components/auth/AuthShell';
import {
  AuthCheckbox,
  AuthInput,
  AuthSubmit,
  PasswordInput,
  PasswordStrength,
  scorePassword,
} from '../../components/auth/AuthFields';

const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const usernameError =
    touched.username && !username.trim()
      ? 'Username is required.'
      : touched.username && (username.length < 3 || username.length > 30)
        ? 'Username must be between 3 and 30 characters.'
        : touched.username && !USERNAME_PATTERN.test(username.trim())
          ? 'Only letters, numbers, underscore and dot.'
          : undefined;

  const emailError =
    touched.email && !email.trim()
      ? 'Email address is required.'
      : touched.email && !EMAIL_PATTERN.test(email.trim())
        ? 'Enter a valid email address.'
        : undefined;

  const passwordError =
    touched.password && password.length < 8
      ? 'Password must be at least 8 characters long.'
      : touched.password && (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
        ? 'Include an uppercase letter, a lowercase letter and a number.'
        : undefined;

  const confirmError =
    touched.confirm && !confirmPassword
      ? 'Please confirm your password.'
      : touched.confirm && confirmPassword !== password
        ? 'Passwords do not match.'
        : undefined;

  const formValid =
    username.trim().length >= 3 &&
    EMAIL_PATTERN.test(email.trim()) &&
    scorePassword(password) >= 2 &&
    confirmPassword === password &&
    agreeTerms;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError(null);
    try {
      setProfilePicture(await fileToDownscaledDataUrl(file));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not process the selected image.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({ username: true, email: true, password: true, confirm: true });

    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (username.length < 3 || username.length > 30 || !USERNAME_PATTERN.test(username.trim())) {
      setError('Please choose a valid username.');
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters and include upper, lower case and a number.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        profilePicture: profilePicture || undefined,
      });
      navigate('/customer/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try a different email or username.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell variant="register">
      <div className="mb-7">
        <h1 className="font-heading text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink">
          Create Your Customer Account
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
          Join thousands of smartphone shoppers across Jaffna &amp; Sri Lanka.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400 animate-fadeIn"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Profile photo */}
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/70 p-3.5 dark:bg-surface/50">
          <div className="group relative h-[64px] w-[64px] shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#1687FF]/45 bg-[#1687FF]/8 transition-all duration-300 group-hover:border-[#1687FF]/70">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile preview"
                  className="h-full w-full object-cover animate-fadeIn"
                />
              ) : (
                <Camera className="h-6 w-6 text-[#1687FF]" />
              )}
            </div>
            <label
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100"
              aria-label="Upload profile photo"
            >
              <Camera className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {profilePicture && (
              <button
                type="button"
                onClick={() => setProfilePicture('')}
                aria-label="Remove profile photo"
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow-soft transition-transform duration-200 hover:scale-110 focus-ring"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-ink">Profile Photo</span>
              <span className="rounded-full bg-[#1687FF]/12 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#1687FF]">
                Optional
              </span>
            </div>
            <p className="mt-1 text-[11.5px] leading-snug text-ink-3">
              Upload a photo for your account. JPG or PNG, up to 5MB.
            </p>
          </div>
        </div>

        {/* Username */}
        <AuthInput
          id="signup-username"
          label="Username"
          icon={<CircleUserRound className="h-[18px] w-[18px]" />}
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
          placeholder="Enter your username"
          state={usernameError ? 'error' : undefined}
          message={usernameError}
        />

        {/* Email */}
        <AuthInput
          id="signup-email"
          label="Email / Gmail Address"
          icon={<Mail className="h-[18px] w-[18px]" />}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="you@gmail.com"
          state={emailError ? 'error' : undefined}
          message={emailError}
        />

        {/* Password */}
        <div>
          <PasswordInput
            id="signup-password"
            label="Password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            placeholder="••••••••••••"
            showPassword={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
            state={passwordError ? 'error' : undefined}
            message={passwordError}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirm password */}
        <div>
          <PasswordInput
            id="signup-confirm"
            label="Confirm Password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            placeholder="••••••••••••"
            showPassword={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
            state={
              confirmError
                ? 'error'
                : confirmPassword && confirmPassword === password
                  ? 'success'
                  : undefined
            }
            message={
              confirmError ??
              (confirmPassword && confirmPassword === password ? 'Passwords match.' : undefined)
            }
          />
        </div>

        {/* Terms */}
        <div className="rounded-xl border border-line bg-surface/70 px-4 py-3.5 dark:bg-surface/50">
          <AuthCheckbox id="signup-terms" checked={agreeTerms} onChange={setAgreeTerms}>
            <span className="flex items-start gap-1.5">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1687FF]" />
              <span>
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="font-bold text-[#1687FF] underline-offset-2 hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and understand that product warranties are backed by official brand distributors in
                Sri Lanka.
              </span>
            </span>
          </AuthCheckbox>
        </div>

        <AuthSubmit isLoading={isLoading} disabled={!formValid} className="mt-1">
          Create Customer Account
          <UserPlus className="h-[18px] w-[18px]" />
          <ArrowRight className="h-[18px] w-[18px]" />
        </AuthSubmit>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-3">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-extrabold text-[#1687FF] transition-colors hover:text-[#1264FF] hover:underline"
        >
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
};
