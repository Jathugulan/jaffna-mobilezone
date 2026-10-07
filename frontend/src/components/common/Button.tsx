import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold tracking-[-0.01em] transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl';

    const variants = {
      primary:
        'bg-grad-primary text-white shadow-lg shadow-blue-600/25 hover:brightness-110',
      glow:
        'bg-grad-ai text-white shadow-lg shadow-violet-500/30 hover:brightness-110',
      secondary:
        'bg-card border border-line text-ink hover:bg-elevated shadow-soft',
      outline:
        'border border-line bg-transparent text-ink hover:bg-elevated',
      ghost: 'bg-transparent text-ink-2 hover:text-ink hover:bg-surface',
      danger:
        'bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-700 hover:brightness-110',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2.5 h-10 gap-2',
      lg: 'text-base px-6 py-3 h-12 gap-2.5',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
