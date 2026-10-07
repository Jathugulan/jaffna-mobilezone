import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { JMMonogram } from '../common/BrandLogo';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Check,
  Sparkles,
  ArrowUpRight,
  Send,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Data-driven tables keep the footer lean and consistent              */
/* ------------------------------------------------------------------ */

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: '100% Genuine Devices',
    desc: 'Official company-sealed mobile phones with brand warranty.',
    tint: 'text-cyan-300',
  },
  {
    icon: Truck,
    title: 'Islandwide Delivery',
    desc: 'Fast courier dispatched from Jaffna across all 25 districts.',
    tint: 'text-sky-300',
  },
  {
    icon: RotateCcw,
    title: 'Official Warranty',
    desc: 'Authorized hardware and software service center backing.',
    tint: 'text-blue-300',
  },
  {
    icon: Headphones,
    title: 'Local Jaffna Support',
    desc: 'Speak directly to our phone technicians via WhatsApp & Call.',
    tint: 'text-indigo-300',
  },
] as const;

const EXPLORE_LINKS = [
  { to: '/shop', label: 'All Smartphones' },
  { to: '/brands', label: 'Browse by Brand' },
  { to: '/deals', label: 'Flash Deals & Offers', hot: true },
  { to: '/new-arrivals', label: 'New Arrivals' },
  { to: '/compare', label: 'Compare Smartphones' },
  { to: '/ai-assistant', label: 'AI Phone Finder' },
] as const;

const CARE_LINKS = [
  { to: '/delivery', label: 'Islandwide Delivery' },
  { to: '/warranty', label: 'Warranty & Guarantee' },
  { to: '/returns', label: 'Return & Exchange Policy' },
  { to: '/faq', label: 'Frequently Asked Questions' },
  { to: '/about', label: 'About Jaffna Mobile Zone' },
  { to: '/contact', label: 'Store Contact & Map' },
] as const;

const PAY_METHODS = ['VISA', 'Mastercard', 'AMEX', 'PayHere', 'Cash on Delivery'] as const;

const ColumnHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="mb-5 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white">
    <span
      aria-hidden="true"
      className="h-4 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600"
    />
    {children}
  </h4>
);

/* ------------------------------------------------------------------ */

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative z-10 overflow-hidden bg-[#020B17] pb-24 pt-14 text-slate-300 lg:pb-8">
      {/* ---------- layered futuristic background ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#020B17_0%,#03101F_48%,#01070F_100%)]" />
        <div className="absolute -top-[220px] left-1/2 h-[440px] w-[1150px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,170,255,0.15),rgba(0,140,255,0.05)_55%,transparent_75%)]" />
        <div className="absolute -left-[220px] top-[240px] h-[540px] w-[740px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,110,255,0.14),transparent_72%)]" />
        <div className="absolute -right-[120px] bottom-[-180px] h-[460px] w-[640px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,210,255,0.12),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(1,6,13,0)_40%,rgba(1,6,13,0.55)_100%)]" />
        {/* top glow hairline */}
        <div className="nav-hairline absolute inset-x-0 top-0 h-px" />
      </div>

      <div className="relative z-10 mx-auto w-[92%] max-w-[1860px]">
        {/* ---------- value highlights ---------- */}
        <div className="grid grid-cols-1 gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, desc, tint }) => (
            <div
              key={title}
              className="group flex items-start gap-4 rounded-card border border-white/[0.07] bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-white/[0.055]"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-shadow duration-300 group-hover:shadow-[0_0_18px_rgba(0,190,255,0.28)] ${tint}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
              </span>
            </div>
          ))}
        </div>

        {/* ---------- main columns ---------- */}
        <div className="grid grid-cols-1 gap-10 border-t border-white/[0.06] py-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand & store info */}
          <div className="space-y-5 lg:col-span-4">
            <div className="flex items-center gap-3">
              <JMMonogram className="h-12 w-12 shrink-0 drop-shadow-[0_8px_22px_rgba(2,6,23,0.7)]" />
              <span className="flex flex-col leading-none">
                <span className="text-[9px] font-bold uppercase tracking-[0.34em] text-cyan-400/80">
                  Jaffna
                </span>
                <span className="mt-1.5 flex items-baseline text-[19px] font-extrabold leading-none tracking-[-0.03em] text-white">
                  Mobile
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                    Zone
                  </span>
                </span>
              </span>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-slate-400">
              Northern Province's leading premium mobile technology retail hub. Specializing in
              flagship smartphones, iPads, smartwatches, and audio gear right here in Jaffna, Sri
              Lanka.
            </p>

            <ul className="space-y-2.5 pt-1 text-[13px] text-slate-400">
              <li>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=9.6647,80.0167"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 transition-colors hover:text-cyan-300"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-cyan-400 transition-colors group-hover:border-cyan-400/40 group-hover:text-cyan-300">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    Hospital Road, Jaffna, Northern Province, Sri Lanka
                    <ArrowUpRight className="ml-1 inline h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+94212224567"
                  className="group flex items-start gap-3 transition-colors hover:text-cyan-300"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-cyan-400 transition-colors group-hover:border-cyan-400/40 group-hover:text-cyan-300">
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">+94 21 222 4567 / WhatsApp: +94 77 123 4567</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@jaffnamobilezone.lk"
                  className="group flex items-start gap-3 transition-colors hover:text-cyan-300"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-cyan-400 transition-colors group-hover:border-cyan-400/40 group-hover:text-cyan-300">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">support@jaffnamobilezone.lk</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-amber-300">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  Mon – Sat: 9:00 AM – 8:00 PM | Sunday: 10:00 AM – 4:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Explore Store */}
          <nav aria-label="Explore store" className="lg:col-span-2">
            <ColumnHeading>Explore Store</ColumnHeading>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`group inline-flex items-center gap-1.5 text-[13px] font-medium transition-all duration-200 hover:translate-x-1 ${
                      'hot' in link && link.hot
                        ? 'font-semibold text-rose-400 hover:text-rose-300'
                        : 'text-slate-400 hover:text-cyan-300'
                    }`}
                  >
                    {'hot' in link && link.hot && (
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer Care */}
          <nav aria-label="Customer care" className="lg:col-span-2">
            <ColumnHeading>Customer Care</ColumnHeading>
            <ul className="space-y-3">
              {CARE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13px] font-medium text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <ColumnHeading>Stay in the Loop</ColumnHeading>
            <p className="mb-4 max-w-md text-[13px] leading-relaxed text-slate-400">
              Subscribe for exclusive flash deals, price drop alerts, and tech releases in Jaffna.
            </p>

            {subscribed ? (
              <div className="flex max-w-md items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3.5 text-[13px] font-semibold text-emerald-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>Thank you! You are subscribed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="max-w-md space-y-2.5">
                <div className="relative">
                  <Send
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/80"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email address"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-3.5 text-[13px] text-white placeholder:text-slate-500 backdrop-blur-md transition-all duration-200 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 py-3 text-[13px] font-extrabold tracking-wide text-white shadow-[0_14px_34px_-16px_rgba(0,180,255,0.9)] transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 active:scale-[0.98]"
                >
                  Get Deals &amp; Alerts
                </button>
              </form>
            )}

            {/* Accepted payment methods */}
            <div className="mt-7">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                We Accept
              </p>
              <div className="flex flex-wrap gap-2">
                {PAY_METHODS.map((method) => (
                  <span
                    key={method}
                    className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10.5px] font-bold tracking-wide text-slate-300 transition-colors duration-200 hover:border-blue-400/40 hover:text-blue-200"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- bottom bar ---------- */}
        <div className="relative flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 text-xs text-slate-500 sm:flex-row">
          <div
            aria-hidden="true"
            className="nav-hairline absolute inset-x-0 -top-px h-px"
          />
          <p>© {new Date().getFullYear()} Jaffna Mobile Zone (Pvt) Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/terms" className="transition-colors hover:text-cyan-300">
              Terms of Service
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-cyan-300">
              Privacy Policy
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-slate-400">
              <MapPin className="h-3 w-3 text-cyan-400" aria-hidden="true" />
              Jaffna · Sri Lanka
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


