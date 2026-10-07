import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Smartphone, Zap, Heart, User } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Smartphone },
    { label: 'Deals', path: '/deals', icon: Zap, highlight: true },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    {
      label: 'Account',
      path: isAuthenticated
        ? isAdmin
          ? '/admin/dashboard'
          : '/customer/dashboard'
        : '/login',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
    >
      {/* glass surface + top glow hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/85 backdrop-blur-xl dark:bg-[#07090d]/92"
      />
      <div
        aria-hidden="true"
        className="nav-hairline absolute inset-x-0 top-0 h-px"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-slate-900/10 to-transparent dark:from-black/40"
      />

      <div className="relative flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex h-16 min-w-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-3 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-primary dark:bg-blue-500/10'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-grad-primary shadow-[0_2px_8px_rgba(59,130,246,0.5)]"
                />
              )}
              <span className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    item.highlight && !isActive ? 'text-rose-500' : ''
                  }`}
                  aria-hidden="true"
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#07090d]">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="relative text-[10px] font-semibold tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
