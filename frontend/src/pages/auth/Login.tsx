import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CircleUserRound, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/helpers';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthCheckbox, AuthInput, AuthSubmit, PasswordInput } from '../../components/auth/AuthFields';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { login, isAuthenticated, isAdmin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (redirect) {
        navigate(redirect, { replace: true });
      } else if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, redirect]);

  const identifierError =
    touched.identifier && !identifier.trim() ? 'Enter your username or email address.' : undefined;
  const passwordError = touched.password && !password ? 'Password is required.' : undefined;

  const formValid = identifier.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({ identifier: true, password: true });

    if (!identifier.trim() || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login({ identifier, password, rememberMe });
      if (redirect) {
        navigate(redirect, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid credentials. Please verify and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell variant="login">
      <div className="mb-7">
        <h1 className="font-heading text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink">
          Welcome Back
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
          Sign in to track orders, manage your wishlist, and shop sealed flagships.
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
        <AuthInput
          id="login-identifier"
          label="Username or Gmail / Email"
          icon={
            identifier.includes('@') ? (
              <Mail className="h-[18px] w-[18px]" />
            ) : (
              <CircleUserRound className="h-[18px] w-[18px]" />
            )
          }
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
          placeholder="Enter username or email"
          state={identifierError ? 'error' : undefined}
          message={identifierError}
        />

        <div>
          <PasswordInput
            id="login-password"
            label="Password"
            autoComplete="current-password"
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
          <div className="-mt-0.5 flex justify-end pt-2">
            <Link
              to="/forgot-password"
              className="group inline-flex items-center gap-1 text-[12.5px] font-bold text-[#1687FF] transition-colors hover:text-[#1264FF]"
            >
              Forgot password?
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <AuthCheckbox
          id="login-remember"
          checked={rememberMe}
          onChange={setRememberMe}
        >
          <span className="font-semibold text-ink-2">Remember me on this device</span>
        </AuthCheckbox>

        <AuthSubmit isLoading={isLoading} disabled={!formValid} className="mt-1">
          Sign In to Account
          <LogIn className="h-[18px] w-[18px]" />
          <ArrowRight className="h-[18px] w-[18px]" />
        </AuthSubmit>
      </form>

      {/* Security information */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-surface/70 px-4 py-3.5 dark:bg-surface/50">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[12.5px] font-extrabold text-ink">Secure Customer Login</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-3">
            Your account information is protected using modern authentication and security
            practices.
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-[13px] text-ink-3">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="font-extrabold text-[#1687FF] transition-colors hover:text-[#1264FF] hover:underline"
        >
          Create Customer Account
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] text-ink-3">
        © {new Date().getFullYear()} Jaffna Mobile Zone · Hospital Road, Jaffna
      </p>
    </AuthShell>
  );
};
