import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Premium segmented light/dark control.
 * The active segment wears a bright electric-blue indicator while the
 * inactive segment stays a quiet slate icon (dark moon on light surfaces).
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  const segment =
    'focus-ring flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ease-out';

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-elevated p-1 shadow-soft ${className}`}
    >
      <button
        type="button"
        onClick={() => {
          if (theme !== 'light') toggleTheme();
        }}
        aria-label="Switch to light theme"
        aria-pressed={theme === 'light'}
        className={`${segment} ${
          theme === 'light'
            ? 'bg-grad-primary text-white shadow-md shadow-blue-500/30'
            : 'text-ink-3 hover:bg-slate-100 hover:text-ink dark:hover:bg-white/10'
        }`}
      >
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => {
          if (theme !== 'dark') toggleTheme();
        }}
        aria-label="Switch to dark theme"
        aria-pressed={theme === 'dark'}
        className={`${segment} ${
          theme === 'dark'
            ? 'bg-grad-primary text-white shadow-md shadow-blue-500/30'
            : 'text-ink-3 hover:bg-slate-100 hover:text-ink dark:hover:bg-white/10'
        }`}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default ThemeToggle;