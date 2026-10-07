import React from 'react';
import { calculateDiscount, calculateSavings, cn, formatLKR } from '../../utils/helpers';

export interface PriceDisplayProps {
  price: number;
  offerPrice?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavings?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  offerPrice,
  size = 'md',
  showSavings = false,
  className,
}) => {
  const hasOffer = offerPrice && offerPrice < price;
  const currentPrice = hasOffer ? offerPrice : price;
  const discount = calculateDiscount(price, offerPrice);
  const savings = calculateSavings(price, offerPrice);

  const sizeClasses = {
    sm: {
      current: 'text-sm font-extrabold',
      original: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      current: 'text-lg font-extrabold',
      original: 'text-sm',
      badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      current: 'text-2xl font-black',
      original: 'text-base',
      badge: 'text-[11px] px-2 py-0.5',
    },
    xl: {
      current: 'text-3xl lg:text-4xl font-black tracking-[-0.03em]',
      original: 'text-lg',
      badge: 'text-[11px] px-2.5 py-0.5',
    },
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-baseline flex-wrap gap-2">
        <span className={cn('font-heading text-ink', sizeClasses[size].current)}>
          {formatLKR(currentPrice)}
        </span>

        {hasOffer && (
          <>
            <span
              className={cn(
                'text-ink-3 line-through decoration-1',
                sizeClasses[size].original
              )}
            >
              {formatLKR(price)}
            </span>
            <span
              className={cn(
                'rounded-full border border-rose-200 bg-rose-50 font-bold uppercase tracking-wide text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400',
                sizeClasses[size].badge
              )}
            >
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {showSavings && hasOffer && (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Save {formatLKR(savings)}
        </span>
      )}
    </div>
  );
};
