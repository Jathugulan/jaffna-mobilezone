import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  Shield,
  LogOut,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Flame,
  Cpu,
  Radio,
  Camera,
  Headphones,
  CheckCircle2,
  ArrowRight,
  LayoutGrid,
  Award,
  GitCompareArrows,
  Home,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CommandPalette } from '../common/CommandPalette';
import { MobileNav } from './MobileNav';
import { CartDrawer } from '../cart/CartDrawer';
import { BrandLogo } from '../common/BrandLogo';
import { HeaderSearch } from './HeaderSearch';
import { ThemeToggle } from './ThemeToggle';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
  badge?: string;
  mega?: 'categories' | 'brands';
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/', icon: Home, isActive: (p) => p === '/' },
  { label: 'Shop', to: '/shop', icon: ShoppingBag, isActive: (p) => p === '/shop' },
  {
    label: 'Categories',
    to: '/categories',
    icon: LayoutGrid,
    isActive: (p) => p.startsWith('/categories'),
    mega: 'categories',
  },
  {
    label: 'Brands',
    to: '/brands',
    icon: Award,
    isActive: (p) => p.startsWith('/brands') || p.startsWith('/brand/'),
    mega: 'brands',
  },
  { label: 'Deals', to: '/deals', icon: Flame, isActive: (p) => p === '/deals', badge: 'HOT' },
  {
    label: 'New Arrivals',
    to: '/new-arrivals',
    icon: Sparkles,
    isActive: (p) => p === '/new-arrivals',
  },
  { label: 'Compare', to: '/compare', icon: GitCompareArrows, isActive: (p) => p === '/compare' },
];

/* ---------------------------------------------------------------------------
   Nav link — full treatment (icon + label) for xl and up
   --------------------------------------------------------------------------- */
const NavLinkFull: React.FC<{
  item: NavItem;
  isActive: boolean;
  hasChevron?: boolean;
  chevronOpen?: boolean;
}> = ({ item, isActive, hasChevron = false, chevronOpen = false }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      aria-current={isActive ? 'page' : undefined}
      className={`focus-ring group relative flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold tracking-[-0.01em] transition-all duration-200 ease-out ${
        isActive
          ? 'bg-grad-primary text-white shadow-md shadow-blue-600/30'
          : 'text-ink-2 hover:bg-elevated hover:text-ink'
      }`}
    >
      <Icon
        className={`h-[17px] w-[17px] shrink-0 transition-transform duration-200 ease-out group-hover:scale-105 ${
          isActive
            ? 'text-white'
            : 'text-ink-3 group-hover:text-primary'
        }`}
      />
      <span className="relative whitespace-nowrap">{item.label}</span>
      {item.badge && (
        <span className="ml-0.5 rounded-full bg-rose-500 px-1.5 py-[1px] text-[8.5px] font-black uppercase leading-[14px] tracking-[0.08em] text-white shadow-sm shadow-rose-500/40">
          {item.badge}
        </span>
      )}
      {hasChevron && (
        <ChevronDown
          aria-hidden="true"
          className={`-mr-1 h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform duration-200 ${
            chevronOpen ? 'rotate-180' : ''
          }`}
        />
      )}
    </Link>
  );
};

/* ---------------------------------------------------------------------------
   Nav link — compact stacked rail (icon over micro-label) for lg breakpoints
   --------------------------------------------------------------------------- */
const NavLinkCompact: React.FC<{ item: NavItem; isActive: boolean }> = ({
  item,
  isActive,
}) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      aria-current={isActive ? 'page' : undefined}
      title={item.label}
      className={`focus-ring group relative flex min-w-[3.6rem] shrink-0 flex-col items-center justify-center gap-[3px] rounded-2xl px-2 py-1.5 transition-colors duration-200 ${
        isActive
          ? 'bg-grad-primary shadow-md shadow-blue-600/30'
          : 'hover:bg-elevated'
      }`}
    >
      <span className="relative">
        <Icon
          className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 ease-out group-hover:scale-105 ${
            isActive
              ? 'text-white'
              : 'text-ink-3 group-hover:text-primary'
          }`}
        />
        {item.badge && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white group-hover:animate-jmzPulseRing dark:ring-[#07090d]"
          />
        )}
      </span>
      <span
        className={`whitespace-nowrap text-[9.5px] font-semibold leading-none tracking-tight transition-colors duration-200 ${
          isActive
            ? 'text-white'
            : 'text-ink-3 group-hover:text-ink'
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
};

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openCartDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  /* Mega menu states */
  const [activeMegaMenu, setActiveMegaMenu] = useState<'categories' | 'brands' | null>(null);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Ctrl/Cmd + K toggles the search palette from anywhere on the page */
  useEffect(() => {
    const handlePaletteHotkey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handlePaletteHotkey);
    return () => window.removeEventListener('keydown', handlePaletteHotkey);
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setActiveMegaMenu(null);
  }, [location.pathname]);

  /* Close the account dropdown on outside pointer interaction or Escape */
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleMouseEnter = useCallback((menu: 'categories' | 'brands') => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenu(menu);
  }, []);

  const handleMouseLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  }, []);

  useEffect(
    () => () => {
      if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    },
    [],
  );

  const megaCategories = [
    {
      name: 'Flagship Phones',
      slug: 'flagship',
      icon: Flame,
      desc: 'Top-tier processors & revolutionary cameras',
      tag: 'Trending',
    },
    {
      name: 'Gaming Phones',
      slug: 'gaming',
      icon: Cpu,
      desc: '144Hz AMOLED, vapor chambers & triggers',
      tag: 'High FPS',
    },
    {
      name: '5G Smartphones',
      slug: '5g',
      icon: Radio,
      desc: 'Next-gen connectivity & Gigabit speeds',
      tag: 'Future Proof',
    },
    {
      name: 'Camera Specialists',
      slug: 'camera',
      icon: Camera,
      desc: 'Periscope optical zoom & cinematic 4K/8K',
      tag: 'Studio Grade',
    },
    {
      name: 'Budget Flagship Killers',
      slug: 'budget',
      icon: Smartphone,
      desc: 'Maximum performance under Rs. 100,000',
      tag: 'Best Value',
    },
    {
      name: 'All Tech Accessories',
      slug: 'accessories',
      icon: Headphones,
      desc: 'Original chargers, audio gear & cases',
      tag: 'Genuine',
    },
  ];

  const megaBrands = [
    { name: 'Apple', slug: 'apple', tag: 'Official Warranty', count: 'iPhone 16 / 15 Series', popular: true },
    { name: 'Samsung', slug: 'samsung', tag: 'Galaxy AI', count: 'S26 Ultra / Fold / A-Series', popular: true },
    { name: 'Xiaomi', slug: 'xiaomi', tag: 'HyperOS', count: 'Xiaomi 15 / Redmi Note / POCO', popular: true },
    { name: 'OnePlus', slug: 'oneplus', tag: 'OxygenOS', count: 'OnePlus 13 / 12 / Nord', popular: true },
    { name: 'Google', slug: 'google', tag: 'Pure Pixel AI', count: 'Pixel 9 Pro / 9 / Fold', popular: true },
    { name: 'OPPO', slug: 'oppo', tag: 'Portrait Expert', count: 'Find X / Reno Series', popular: false },
    { name: 'vivo', slug: 'vivo', tag: 'ZEISS Optics', count: 'X100 Series / V-Series', popular: false },
    { name: 'Realme', slug: 'realme', tag: 'Fast Charging', count: 'GT Series / Number Series', popular: false },
  ];

  return (
    <>
      {/* ---------------- Sticky navigation ---------------- */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ease-out ${
          isScrolled
            ? 'nav-surface border-b border-transparent'
            : 'border-b border-transparent bg-white/70 backdrop-blur-xl dark:bg-[#07090d]/70'
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto grid w-full max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-1 px-4 py-2 transition-all duration-300 ease-out sm:px-6 sm:py-2.5 lg:gap-x-5 xl:px-8"
        >
          {/* ---------- LEFT — Brand ---------- */}
          <div className="col-start-1 row-start-1 flex shrink-0 items-center justify-self-start">
            <Link
              to="/"
              aria-label="Jaffna MobileZone — home"
              className="focus-ring group -m-1.5 rounded-2xl p-1.5"
            >
              <span className="inline-flex items-center transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                <BrandLogo variant="full" />
              </span>
            </Link>
          </div>

          {/* ---------- CENTER — Search ---------- */}
          <div className="col-start-2 row-start-1 hidden min-w-0 px-2 md:block">
            <HeaderSearch />
          </div>

          {/* ---------- ROW 2 — Secondary navigation ---------- */}
          <div className="col-span-3 col-start-1 row-start-2 hidden items-center justify-center gap-4 border-t border-line pt-2.5 lg:flex">
            {/* Compact rail: 1024px – 1279px */}
            <ul className="flex items-center gap-0.5 xl:hidden">
              {NAV_ITEMS.map((item) => (
                <li key={item.label} className="flex">
                  <NavLinkCompact item={item} isActive={item.isActive(location.pathname)} />
                </li>
              ))}
            </ul>

            {/* Full labels: 1280px and up */}
            <ul className="hidden items-center gap-1 xl:flex">
              {NAV_ITEMS.map((item) => {
                const isActive = item.isActive(location.pathname);

                if (!item.mega) {
                  return (
                    <li key={item.label} className="flex">
                      <NavLinkFull item={item} isActive={isActive} />
                    </li>
                  );
                }

                const panelId = `mega-${item.mega}`;
                const isPanelOpen = activeMegaMenu === item.mega;

                return (
                  <li
                    key={item.label}
                    className="relative flex"
                    onMouseEnter={() => handleMouseEnter(item.mega!)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <NavLinkFull
                      item={item}
                      isActive={isActive}
                      hasChevron
                      chevronOpen={isPanelOpen}
                    />

                    {isPanelOpen && (
                      <div
                        id={panelId}
                        role="group"
                        aria-label={`${item.label} menu`}
                        className="animate-fadeInSoft absolute left-1/2 top-full z-50 mt-3 w-[720px] -translate-x-1/2 rounded-featured border border-line bg-elevated p-6 shadow-premium backdrop-blur-xl"
                      >
                        {item.mega === 'categories' ? (
                          <>
                            <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                              <div>
                                <h4 className="text-sm font-extrabold tracking-[-0.02em] text-ink">
                                  Explore by Phone Category
                                </h4>
                                <p className="text-xs text-ink-3">
                                  Sealed devices tailored to your daily performance needs
                                </p>
                              </div>
                              <Link
                                to="/categories"
                                className="flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
                              >
                                View All Categories <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              {megaCategories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                  <Link
                                    key={cat.slug}
                                    to={`/shop?category=${cat.slug}`}
                                    className="group/item flex items-start gap-3 rounded-card border border-transparent p-3 transition-all duration-200 hover:border-line hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                                  >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-200 group-hover/item:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
                                      <Icon className="h-[18px] w-[18px]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold tracking-[-0.01em] text-ink transition-colors group-hover/item:text-primary">
                                          {cat.name}
                                        </span>
                                        <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                          {cat.tag}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 line-clamp-1 text-xs text-ink-3">
                                        {cat.desc}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                              <div>
                                <h4 className="text-sm font-extrabold tracking-[-0.02em] text-ink">
                                  Authorized Global Brands
                                </h4>
                                <p className="text-xs text-ink-3">
                                  Official company warranty and after-sales support in Sri Lanka
                                </p>
                              </div>
                              <Link
                                to="/brands"
                                className="flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
                              >
                                All Manufacturers <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-4 gap-2.5">
                              {megaBrands.map((brand) => (
                                <Link
                                  key={brand.slug}
                                  to={`/brand/${brand.slug}`}
                                  className="group/item flex flex-col rounded-card border border-transparent p-3 text-left transition-all duration-200 hover:border-line hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                                >
                                  <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-[13px] font-extrabold tracking-[-0.01em] text-ink transition-colors group-hover/item:text-primary">
                                      {brand.name}
                                    </span>
                                    {brand.popular && (
                                      <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                        ★ Top
                                      </span>
                                    )}
                                  </div>
                                  <span className="line-clamp-1 text-[11px] font-medium text-ink-3">
                                    {brand.count}
                                  </span>
                                  <span className="mt-1 text-[10px] font-semibold text-primary">
                                    {brand.tag}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ---------- RIGHT — Actions ---------- */}
          <div className="col-start-3 row-start-1 flex shrink-0 items-center justify-self-end gap-1 sm:gap-1.5">
            <button
              onClick={() => setIsCommandOpen(true)}
              aria-label="Search smartphones"
              className="focus-ring group flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink-2 transition-all duration-150 hover:border-primary hover:text-primary hover:shadow-soft md:hidden"
            >
              <Search
                className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              />
            </button>

            {/* Theme — compact control for small screens; visible from sm up */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label={
                wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'
              }
              className="focus-ring group relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink-2 transition-all duration-150 hover:border-primary hover:text-primary hover:shadow-soft"
            >
              <Heart
                className="h-[18px] w-[18px] transition-transform duration-200 ease-out group-hover:scale-[1.08] group-active:scale-95"
                aria-hidden="true"
              />
              <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[9.5px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#07090d]">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            </Link>

            {/* Cart */}
            <button
              onClick={openCartDrawer}
              aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart'}
              className="focus-ring group relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink-2 transition-all duration-150 hover:border-primary hover:text-primary hover:shadow-soft"
            >
              <ShoppingBag
                className="h-[18px] w-[18px] transition-transform duration-200 ease-out group-hover:scale-[1.08] group-active:scale-95"
                aria-hidden="true"
              />
              <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[9.5px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#07090d]">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            </button>

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  className="focus-ring group flex h-10 items-center gap-2 rounded-full border border-line bg-card px-1.5 pr-2.5 transition-all duration-150 hover:border-primary"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-grad-primary text-[11px] font-extrabold uppercase text-white shadow-sm ring-2 ring-white dark:ring-[#0D1117]">
                    {user?.username?.charAt(0)}
                  </span>
                  <span className="hidden max-w-[92px] truncate text-[12.5px] font-semibold text-ink xl:block">
                    {user?.username}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="animate-fadeInSoft absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-modal border border-line bg-elevated p-1.5 shadow-premium"
                  >
                    <div className="border-b border-line p-3">
                      <p className="truncate text-[13px] font-extrabold tracking-[-0.02em] text-ink">
                        {user?.username}
                      </p>
                      <p className="truncate text-[11.5px] text-ink-3">{user?.email}</p>
                      <span className="mt-1.5 inline-block rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {isAdmin ? (
                        <Link
                          to="/admin/dashboard"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-card px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                        >
                          <Shield className="h-4 w-4" aria-hidden="true" /> Admin Console
                        </Link>
                      ) : (
                        <Link
                          to="/customer/dashboard"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-card px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                        >
                          <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> My Dashboard
                        </Link>
                      )}
                      <Link
                        to="/customer/orders"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-card px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                      >
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" /> My Orders
                      </Link>
                      <Link
                        to="/customer/bookings"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-card px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" /> My
                        Bookings
                      </Link>
                      <Link
                        to="/customer/profile"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-card px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                      >
                        <UserIcon className="h-4 w-4" aria-hidden="true" /> Profile &amp; Settings
                      </Link>
                    </div>

                    <div className="border-t border-line pt-1">
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        role="menuitem"
                        className="flex w-full items-center gap-2 rounded-card px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="focus-ring group hidden h-10 items-center gap-2 rounded-full bg-grad-primary px-5 text-[12.5px] font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] lg:inline-flex"
              >
                <UserIcon className="h-4 w-4" aria-hidden="true" />
                Login
              </Link>
            )}

            {/* Mobile / tablet menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              aria-expanded={isMobileMenuOpen}
              className="focus-ring group -mr-1.5 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card p-1.5 text-ink-2 transition-all duration-150 hover:border-primary hover:text-primary lg:hidden"
            >
              <Menu
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              />
            </button>
          </div>
        </nav>

        {/* Scroll-activated gradient hairline */}
        <div
          aria-hidden="true"
          className={`nav-hairline h-px transition-opacity duration-300 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </header>

      {/* ---------------- Global overlays ---------------- */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <CartDrawer />
    </>
  );
};