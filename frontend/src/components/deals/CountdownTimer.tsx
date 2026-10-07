import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/helpers';

export interface CountdownTimerProps {
  targetDate: string;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onExpire,
  size = 'md',
  className,
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-rose-500">
        Offer Expired
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  const unitSizes = {
    sm: {
      box: 'px-1.5 py-0.5 min-w-[26px] text-xs',
      sep: 'text-xs',
      label: 'text-[9px]',
    },
    md: {
      box: 'px-2.5 py-1.5 min-w-[38px] text-sm',
      sep: 'text-sm font-bold',
      label: 'text-[10px]',
    },
    lg: {
      box: 'px-3.5 py-2 min-w-[48px] text-lg font-bold',
      sep: 'text-lg font-bold',
      label: 'text-xs',
    },
  };

  const units = [
    { value: pad(timeLeft.days), label: 'DAYS', live: false },
    { value: pad(timeLeft.hours), label: 'HOURS', live: false },
    { value: pad(timeLeft.minutes), label: 'MIN', live: false },
    { value: pad(timeLeft.seconds), label: 'SEC', live: true },
  ];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {units.map((unit, idx) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'rounded-lg border border-white/10 bg-slate-900/95 font-mono font-bold tracking-tight text-white shadow-soft dark:bg-white/[0.08]',
                unit.live && 'bg-grad-primary border-transparent shadow-glow',
                unitSizes[size].box
              )}
            >
              {unit.value}
            </div>
            <span
              className={cn(
                'mt-0.5 font-bold uppercase tracking-[0.14em] text-ink-3',
                unitSizes[size].label
              )}
            >
              {unit.label}
            </span>
          </div>
          {idx < units.length - 1 && (
            <span className={cn('mb-2 text-ink-3 opacity-60', unitSizes[size].sep)} aria-hidden="true">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
