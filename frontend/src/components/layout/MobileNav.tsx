import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Sparkles,
  Smartphone,
  LayoutGrid,
  Award,
  Flame,
  ShoppingBag,
  Home,
  GitCompareArrows,
  User,
  LogOut,
  Shield,
  CheckCircle2,
  HelpCircle,
  Info,
  Phone,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerLink {
  name: string;
  path: string;
  icon: LucideIcon;
  highlight?: boolean;
}

const STORE_LINKS: DrawerLink[] = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Shop Smartphones', path: '/shop', icon: ShoppingBag },
  { name: 'Categories', path: '/categories', icon: LayoutGrid },
  { name: 'Brands', path: '/brands', icon: Award },
  { name: 'Deals & Offers', path: '/deals', icon: Flame, highlight: true },
  { name: 'New Arrivals', path: '/new-arrivals', icon: Sparkles },
  { name: 'Compare', path: '/compare', icon: GitCompareArrows },
];

const SECONDARY_LINKS: DrawerLink[] = [
  { name: 'About Us', path: '/about', icon: Info },
  { name: 'FAQ', path: '/faq', icon: HelpCircle },
  { name: 'Contact & Map', path: '/contact', icon: Phone },
];

const EXIT_MS = 260;

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const [isMounted, setIsMounted] = useState(isOpen);
  const [isLeaving, setIsLeaving] = useState(false);

  /* Keep the drawer mounted through its exit animation, then unmount. */
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsLeaving(false);
      return;
    }
    if (!isMounted) return;

    setIsLeaving(true);
    const timer = setTimeout(() => {
      setIsMounted(false);
      setIsLeaving(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [isOpen, isMounted]);

  /* Lock background scrolling while the drawer is on screen. */
  useEffect(() => {
    if (!isMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  /* Escape to dismiss, Tab cycles inside the drawer, focus moves in and back out. */
  useEffect(() => {
    if (!isMounted) return;

    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      closeButtonRef.current?.focus();
    } else {
      restoreFocusRef.current?.focus?.();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, isOpen, onClose]);

  if (!isMounted) return null;

  const isCurrent = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const renderLink = (link: DrawerLink) => {
    const Icon = link.icon;
    const active = isCurrent(link.path);

    return (
      <Link
        key={link.path}
        to={link.path}
        onClick={onClose}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex min-h-[52px] items-center gap-3.5 overflow-hidden rounded-card border px-4 py-3 transition-all duration-200 ${
          active
            ? 'border-line bg-blue-50 text-blue-700 shadow-soft dark:bg-blue-500/10 dark:text-blue-300'
            : 'border-transparent text-ink-2 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]'
        }`}
      >
        {/* Active accent rail */}
        <span
          aria-hidden="true"
          className={`absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-blue-600 to-violet-500 transition-opacity duration-200 ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
            active
              ? 'bg-primary text-white shadow-md shadow-blue-600/25'
              : link.highlight
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-slate-100 text-ink-3 group-hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400'
          }`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold">
          {link.name}
        </span>
        {link.highlight && (
          <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-rose-600 ring-1 ring-inset ring-rose-500/20 dark:text-rose-400">
            Sale
          </span>
        )}
      </Link>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[60] ${
        isLeaving ? 'pointer-events-none' : ''
      }`}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 dark:bg-black/75 ${
          isLeaving ? 'opacity-0' : 'animate-fadeIn opacity-100'
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`absolute inset-y-0 left-0 flex w-[86%] max-w-[350px] flex-col overflow-hidden border-r border-line bg-elevated shadow-premium ${
          isLeaving ? 'animate-slideOutLeft' : 'animate-slideInLeft'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-4">
          <BrandLogo variant="compact" />
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close navigation menu"
            className="focus-ring -mr-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink-3 transition-all duration-150 hover:border-primary hover:text-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable links */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4">
          <nav aria-label="Store" className="space-y-1">
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-3">
              Store
            </p>
            {STORE_LINKS.map(renderLink)}
          </nav>

          <nav aria-label="Support" className="mt-5 space-y-1 border-t border-line pt-4">
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-3">
              Support
            </p>
            {SECONDARY_LINKS.map(renderLink)}
          </nav>

          {/* Account */}
          <div className="mt-5 space-y-1 border-t border-line pt-4">
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-3">
              Account
            </p>

            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/customer/dashboard'}
                  onClick={onClose}
                  className="group flex min-h-[52px] items-center gap-3.5 rounded-card border border-transparent px-4 py-3 text-ink-2 transition-all duration-200 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400">
                    <Shield className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="truncate text-[14.5px] font-semibold">
                    {isAdmin ? 'Admin Console' : 'Customer Dashboard'}
                  </span>
                </Link>

                <Link
                  to="/customer/orders"
                  onClick={onClose}
                  className="group flex min-h-[52px] items-center gap-3.5 rounded-card border border-transparent px-4 py-3 text-ink-2 transition-all duration-200 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-ink-3 group-hover:bg-slate-200 dark:bg-white/[0.06]">
                    <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="truncate text-[14.5px] font-semibold">My Orders</span>
                </Link>

                <Link
                  to="/customer/bookings"
                  onClick={onClose}
                  className="group flex min-h-[52px] items-center gap-3.5 rounded-card border border-transparent px-4 py-3 text-ink-2 transition-all duration-200 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="truncate text-[14.5px] font-semibold">My Bookings</span>
                </Link>

                <Link
                  to="/wishlist"
                  onClick={onClose}
                  className="group flex min-h-[52px] items-center gap-3.5 rounded-card border border-transparent px-4 py-3 text-ink-2 transition-all duration-200 hover:border-line hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                    <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="truncate text-[14.5px] font-semibold">Wishlist</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="group flex min-h-[52px] w-full items-center gap-3.5 rounded-card border border-transparent px-4 py-3 text-left text-rose-600 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 dark:hover:border-rose-500/20 dark:hover:bg-rose-500/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                    <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="truncate text-[14.5px] font-semibold">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="group flex min-h-[52px] items-center justify-center gap-2.5 rounded-card bg-grad-primary px-4 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-150 hover:brightness-110 active:scale-[0.99]"
                >
                  <User className="h-[18px] w-[18px]" aria-hidden="true" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="flex min-h-[52px] items-center justify-center rounded-card border border-line bg-card px-4 py-3.5 text-[14px] font-bold text-ink transition-all duration-150 hover:bg-elevated"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-line px-5 py-4">
          <p className="flex items-center gap-2 text-[11.5px] font-semibold text-ink-2">
            <Smartphone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Hospital Road, Jaffna
          </p>
          <a
            href="tel:+94212224567"
            className="mt-1 inline-block text-[11.5px] text-ink-3 transition-colors hover:text-primary"
          >
            +94 21 222 4567
          </a>
        </div>
      </div>
    </div>
  );
};