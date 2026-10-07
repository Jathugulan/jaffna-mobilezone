import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatLKR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

export function calculateDiscount(price: number, offerPrice?: number | null): number {
  if (!offerPrice || offerPrice >= price || price <= 0) return 0;
  return Math.round(((price - offerPrice) / price) * 100);
}

export function calculateSavings(price: number, offerPrice?: number | null): number {
  if (!offerPrice || offerPrice >= price) return 0;
  return price - offerPrice;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function truncate(text: string, length: number): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop';
export const DEFAULT_BRAND_BANNER =
  'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1600&auto=format&fit=crop';

interface ApiErrorLike {
  message?: string;
  code?: string;
  status?: number;
  errors?: Array<{ field?: string; message?: string }>;
}

function humanizeField(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Builds a readable message from an API error. Validation responses arrive as
 * `{ message: "Validation failed", errors: [{ field, message }] }`, where the
 * generic message alone is not actionable.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;

  const apiError = err as ApiErrorLike;

  if (Array.isArray(apiError.errors) && apiError.errors.length > 0) {
    return apiError.errors
      .map((detail) => {
        const message = detail.message || 'is invalid';
        const field = detail.field || '';
        if (!field || message.toLowerCase().includes(field.toLowerCase())) return message;
        return `${humanizeField(field)}: ${message}`;
      })
      .join(' • ');
  }

  if (typeof apiError.message === 'string' && apiError.message.trim()) {
    return apiError.message;
  }

  return fallback;
}
