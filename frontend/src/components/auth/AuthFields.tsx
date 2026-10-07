import React from 'react';
import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { cn } from '../../utils/helpers';

/* ------------------------------------------------------------------ */
/* Shared input shell                                                  */
/* ------------------------------------------------------------------ */

type FieldState = 'default' | 'error' | 'success';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: React.ReactNode;
  state?: FieldState;
  message?: string;
  trailing?: React.ReactNode;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  icon,
  state = 'default',
  message,
  trailing,
  className,
  ...props
}) => {
  const stateStyles: Record<FieldState, string> = {
    default:
      'border-[#DCE5F2] dark:border-line hover:border-[#B9C9E4] dark:hover:border-ink-3/60 focus:border-[#1687FF] focus:ring-[#1687FF]/18',
    error:
      'border-red-400/80 dark:border-red-500/50 hover:border-red-400 focus:border-red-500 focus:ring-red-500/18',
    success:
      'border-emerald-400/80 dark:border-emerald-500/50 hover:border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/18',
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-bold tracking-[-0.01em] text-ink"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-ink-3">
          {icon}
        </span>
        <input
          id={id}
          className={cn(
            'h-[58px] w-full rounded-2xl border bg-white pl-12 pr-4 text-[15px] text-ink shadow-soft outline-none transition-all duration-200 placeholder:text-ink-3/70 dark:bg-surface',
            trailing ? 'pr-12' : undefined,
            stateStyles[state],
            className
          )}
          aria-invalid={state === 'error'}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {message && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1.5 text-[12px] font-medium transition-colors',
            state === 'error' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
          )}
        >
          {state === 'error' ? (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          )}
          {message}
        </p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Password input + visibility toggle                                  */
/* ------------------------------------------------------------------ */

interface PasswordInputProps extends Omit<AuthInputProps, 'type' | 'trailing' | 'icon'> {
  showPassword: boolean;
  onToggle: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showPassword,
  onToggle,
  ...props
}) => (
  <AuthInput
    {...props}
    icon={<Lock className="h-[18px] w-[18px]" />}
    type={showPassword ? 'text' : 'password'}
    trailing={
      <button
        type="button"
        onClick={onToggle}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="rounded-xl p-2 text-ink-3 transition-all duration-200 hover:bg-surface hover:text-[#1687FF] focus-ring"
      >
        <span className="block transition-transform duration-200">
          {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </span>
      </button>
    }
  />
);

/* ------------------------------------------------------------------ */
/* Password strength meter                                             */
/* ------------------------------------------------------------------ */

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'] as const;
const STRENGTH_COLORS = [
  'bg-red-500',
  'bg-amber-500',
  'bg-blue-500',
  'bg-emerald-500',
] as const;
const STRENGTH_TEXT = [
  'text-red-500',
  'text-amber-500',
  'text-blue-500',
  'text-emerald-600 dark:text-emerald-400',
] as const;

export const scorePassword = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
};

export const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const score = scorePassword(password);
  const visible = password.length > 0;
  const level = Math.max(score, 1) - 1;

  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
        visible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <div className="flex items-center justify-between pt-2.5">
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  visible && i < Math.max(score, 0) ? STRENGTH_COLORS[level] : 'bg-line dark:bg-white/10'
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              'ml-3 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-300',
              visible ? STRENGTH_TEXT[level] : 'text-ink-3'
            )}
          >
            {visible ? STRENGTH_LABELS[level] : ''}
          </span>
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-3">
          {[
            { ok: password.length >= 8, text: '8+ characters' },
            { ok: /[a-z]/.test(password) && /[A-Z]/.test(password), text: 'Upper & lowercase' },
            { ok: /[0-9]/.test(password), text: 'Contains a number' },
          ].map((req) => (
            <li
              key={req.text}
              className={cn(
                'flex items-center gap-1 transition-colors duration-200',
                req.ok && visible ? 'text-emerald-600 dark:text-emerald-400' : undefined
              )}
            >
              <Check className={cn('h-3 w-3', req.ok && visible ? 'opacity-100' : 'opacity-30')} />
              {req.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Premium checkbox row                                                */
/* ------------------------------------------------------------------ */

interface AuthCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}

export const AuthCheckbox: React.FC<AuthCheckboxProps> = ({ id, checked, onChange, children }) => (
  <label
    htmlFor={id}
    className="group flex cursor-pointer items-start gap-3 rounded-xl p-1 -m-1 transition-colors duration-200"
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      className={cn(
        'mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border-2 transition-all duration-200',
        'border-[#B9C9E4] bg-white dark:border-ink-3/50 dark:bg-surface',
        'peer-checked:border-[#1264FF] peer-checked:bg-[#1264FF]',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-[#1687FF]/40 peer-focus-visible:ring-offset-2',
        'group-hover:border-[#1687FF]'
      )}
    >
      <Check
        className={cn(
          'h-3 w-3 text-white transition-all duration-200',
          checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        )}
        strokeWidth={3.5}
      />
    </span>
    <span className="text-[12.5px] leading-relaxed text-ink-2">{children}</span>
  </label>
);

/* ------------------------------------------------------------------ */
/* Primary auth CTA                                                    */
/* ------------------------------------------------------------------ */

interface AuthSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export const AuthSubmit: React.FC<AuthSubmitProps> = ({
  isLoading,
  children,
  disabled,
  className,
  ...props
}) => (
  <button
    type="submit"
    disabled={disabled || isLoading}
    className={cn(
      'inline-flex h-[60px] w-full items-center justify-center gap-2.5 rounded-2xl',
      'bg-[linear-gradient(90deg,#1264FF_0%,#1687FF_100%)] text-[15px] font-extrabold tracking-[-0.01em] text-white',
      'shadow-[0_12px_28px_-10px_rgba(18,100,255,0.6)] transition-all duration-200',
      'hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_36px_-10px_rgba(22,135,255,0.65)]',
      'active:translate-y-0 active:scale-[0.99]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1687FF] focus-visible:ring-offset-2 focus-visible:ring-offset-card',
      'disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none disabled:hover:translate-y-0',
      className
    )}
    {...props}
  >
    {isLoading && <Loader2 className="h-[18px] w-[18px] animate-spin" />}
    {children}
  </button>
);
