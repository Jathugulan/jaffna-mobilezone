import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  MapPin,
  Bell,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  BookmarkCheck,
  CreditCard,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../common/BrandLogo';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Overview', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'My Bookings', path: '/customer/bookings', icon: BookmarkCheck, highlight: true },
    { label: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
    { label: 'Payments', path: '/customer/payments', icon: CreditCard },
    { label: 'My Wishlist', path: '/customer/wishlist', icon: Heart },
    { label: 'Cart', path: '/customer/cart', icon: ShoppingCart },
    { label: 'Profile', path: '/customer/profile', icon: User },
    { label: 'Addresses', path: '/customer/addresses', icon: MapPin },
    { label: 'Notifications', path: '/customer/notifications', icon: Bell },
    { label: 'Security', path: '/customer/security', icon: Lock },
    { label: 'AI Assistant', path: '/customer/ai-assistant', icon: Bot },
    { label: 'Settings', path: '/customer/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-base text-ink">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden dark:bg-black/70"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Customer Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 flex flex-col bg-surface border-r border-line transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-line">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo variant="compact" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-ink-3 hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-3 my-3 rounded-card border border-line bg-card p-4 flex items-center gap-3 shadow-soft">
          <div className="w-10 h-10 rounded-xl bg-grad-primary text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-blue-600/25">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-extrabold text-xs text-ink truncate">
              {user?.username}
            </p>
            <p className="text-[11px] text-ink-3 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-card text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-soft dark:bg-blue-500/10 dark:text-blue-300'
                    : 'text-ink-2 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-grad-primary"
                  />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : item.highlight
                        ? 'text-violet-500'
                        : 'text-ink-3'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Return to Store & Sign Out */}
        <div className="p-3 border-t border-line space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-card text-xs font-semibold text-ink-2 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          >
            <Store className="w-4 h-4 text-ink-3" />
            <span>Return to Public Store</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-card text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/85 dark:bg-[#07090d]/85 backdrop-blur-xl border-b border-line">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-card text-ink-2 hover:bg-slate-100 dark:hover:bg-white/10 focus-ring"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold tracking-[-0.02em] text-ink">
              Customer Portal
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/customer/ai-assistant"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink-2 shadow-soft transition-all duration-150 hover:border-primary hover:text-primary"
            >
              <Bot className="w-3.5 h-3.5 text-violet-500" />
              <span>AI Phone Finder</span>
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink-2 transition-all duration-150 hover:border-primary hover:text-primary hover:shadow-soft"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Child Page Outlet */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
