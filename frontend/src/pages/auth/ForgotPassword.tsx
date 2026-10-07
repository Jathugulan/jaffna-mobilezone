import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthInput, AuthSubmit } from '../../components/auth/AuthFields';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Unable to send password reset instructions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell variant="forgot">
      {submitted ? (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-[26px] font-extrabold tracking-[-0.03em] text-ink">
            Instructions Dispatched
          </h1>
          <p className="text-[13px] leading-relaxed text-ink-3">
            If an account exists for{' '}
            <strong className="font-bold text-ink">{email}</strong>, you will receive password
            reset instructions shortly.
          </p>
          <Link to="/login" className="inline-block pt-2">
            <AuthSubmit>Return to Sign In</AuthSubmit>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-[#1687FF]/12 text-[#1687FF]">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink">
              Reset Password
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
              >
                {error}
              </div>
            )}

            <AuthInput
              id="forgot-email"
              label="Email Address"
              icon={<Mail className="h-[18px] w-[18px]" />}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
            />

            <AuthSubmit isLoading={isLoading} disabled={!email.trim()}>
              Send Reset Link
              <ArrowRight className="h-[18px] w-[18px]" />
            </AuthSubmit>

            <div className="pt-1 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-3 transition-colors hover:text-[#1687FF]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        </>
      )}
    </AuthShell>
  );
};
