import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  Layers,
  Tag,
  Zap,
  Gift,
  ShoppingBag,
  Users,
  Star,
  Globe,
  Sliders,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  ShieldAlert,
  BookmarkCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Strict check: non-admins cannot access layout
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-base text-ink">
        <div className="w-16 h-16 rounded-featured bg-rose-50 text-rose-500 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-500/20 dark:bg-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-[-0.02em]">403 Forbidden Access</h2>
        <p className="mt-2 text-sm text-ink-3 max-w-md">
          Only authenticated system administrators can access the Mobile Zone Management Console.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 rounded-xl bg-grad-primary text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
        >
          Return to Public Store
        </Link>
      </div>
    );
  }

  const menuSections = [
    {
      title: 'Catalog & Inventory',
      items: [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Products', path: '/admin/products', icon: Smartphone },
        { label: 'Inventory', path: '/admin/inventory', icon: Sliders },
        { label: 'Brands', path: '/admin/brands', icon: Layers },
        { label: 'Categories', path: '/admin/categories', icon: Tag },
      ],
    },
    {
      title: 'Promotions & Sales',
      items: [
        { label: 'Offers & Discounts', path: '/admin/offers', icon: Gift },
        { label: 'Flash Sales', path: '/admin/flash-sales', icon: Zap },
        { label: 'Coupons', path: '/admin/coupons', icon: Tag },
      ],
    },
    {
      title: 'Commerce & CRM',
      items: [
        { label: 'Bookings', path: '/admin/bookings', icon: BookmarkCheck, highlight: true },
        { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Reviews', path: '/admin/reviews', icon: Star },
      ],
    },
    {
      title: 'Content & Intelligence',
      items: [
        { label: 'Homepage CMS', path: '/admin/homepage', icon: Globe },
        { label: 'Hero Slides', path: '/admin/hero-slides', icon: Sliders },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
        { label: 'AI Assistant', path: '/admin/ai', icon: Bot, highlight: true },
        { label: 'Store Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-base text-ink">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden dark:bg-black/70"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 flex flex-col bg-surface border-r border-line shadow-soft transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-grad-primary flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-blue-600/25">
              JMZ
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm text-ink block leading-tight">
                Mobile Zone
              </span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wide">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-ink-3 hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {menuSections.map((section) => (
            <div key={section.title}>
              <span className="text-[10px] font-bold text-ink-3 uppercase tracking-wider px-3 mb-1.5 block">
                {section.title}
              </span>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/admin/dashboard' &&
                      location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`relative flex items-center justify-between px-3 py-2 rounded-card text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-50 text-primary shadow-soft dark:bg-blue-500/10'
                          : 'text-ink-2 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-grad-primary"
                        />
                      )}
                      <div className="flex items-center gap-2.5">
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
              </div>
            </div>
          ))}
        </div>

        {/* User Info & Actions */}
        <div className="p-3 border-t border-line space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-card text-xs font-semibold text-ink-2 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          >
            <Store className="w-4 h-4 text-ink-3" />
            <span>Open Public Store</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-card text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/85 dark:bg-[#07090d]/85 backdrop-blur-xl border-b border-line">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-card text-ink-2 hover:bg-slate-100 dark:hover:bg-white/10 focus-ring"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-[-0.02em] text-ink">
              Administrator Console
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/ai"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink-2 shadow-soft transition-all duration-150 hover:border-primary hover:text-primary"
            >
              <Bot className="w-3.5 h-3.5 text-violet-500" />
              <span>AI Business Assistant</span>
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

            <div className="flex items-center gap-2 pl-2.5 border-l border-line">
              <div className="w-8 h-8 rounded-full bg-grad-primary text-white flex items-center justify-center font-extrabold text-xs ring-2 ring-offset-2 ring-offset-base">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-heading text-xs font-extrabold text-ink block leading-none">
                  {user?.username}
                </span>
                <span className="text-[10px] text-ink-3">Master Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
