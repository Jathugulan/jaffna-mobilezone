import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  linkTo?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  className?: string;
}

/**
 * Shared premium section heading — cyan eyebrow chip + bold title + optional
 * "view all" link. Keeps footer / shop / home pages visually unified.
 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  linkTo,
  linkLabel,
  align = 'left',
  dark = false,
  className,
}) => {
  const centered = align === 'center';
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:mb-10',
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className={cn('space-y-2.5', centered && 'flex flex-col items-center')}>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
          <span
            className="h-1.5 w-1.5 rounded-full bg-grad-primary"
            aria-hidden="true"
          />
          {eyebrow}
        </span>
        <h2
          className={cn(
            'text-[26px] font-black leading-[1.08] tracking-[-0.03em] sm:text-[32px]',
            dark ? 'text-white' : 'text-ink'
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'max-w-xl text-[13px] leading-relaxed sm:text-sm',
              dark ? 'text-slate-400' : 'text-ink-3',
              centered && 'mx-auto'
            )}
          >
            {description}
          </p>
        )}
      </div>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-ink-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
        >
          {linkLabel}
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeading;
