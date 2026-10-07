import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, BadgeCheck, ShieldCheck, Truck } from 'lucide-react';

type AuthVariant = 'register' | 'login' | 'forgot';

interface AuthShellProps {
  variant: AuthVariant;
  children: React.ReactNode;
}

const PANEL_COPY: Record<AuthVariant, { title: React.ReactNode; subtitle: string }> = {
  register: {
    title: (
      <>
        Your Next Smartphone
        <br />
        <span className="bg-gradient-to-r from-[#1687FF] to-[#00C6FF] bg-clip-text text-transparent">
          Starts Here.
        </span>
      </>
    ),
    subtitle: 'Join thousands of smartphone shoppers across Jaffna & Sri Lanka.',
  },
  login: {
    title: (
      <>
        <span className="bg-gradient-to-r from-[#1687FF] to-[#00C6FF] bg-clip-text text-transparent">
          Welcome Back
        </span>
        <br />
        to Jaffna Mobile Zone.
      </>
    ),
    subtitle: 'Sign in to track orders, manage your wishlist, and shop sealed flagships.',
  },
  forgot: {
    title: (
      <>
        Reset Your
        <br />
        <span className="bg-gradient-to-r from-[#1687FF] to-[#00C6FF] bg-clip-text text-transparent">
          Account Access.
        </span>
      </>
    ),
    subtitle: 'Receive secure password reset instructions for your Jaffna Mobile Zone account.',
  },
};

const TRUST_FEATURES = [
  {
    icon: BadgeCheck,
    title: '100% Genuine Products',
    copy: 'Official distributor-backed products.',
  },
  {
    icon: Truck,
    title: 'Islandwide Delivery',
    copy: 'Fast and reliable delivery across Sri Lanka.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Shopping',
    copy: 'Protected customer accounts and payments.',
  },
  {
    icon: Award,
    title: 'Official Warranty',
    copy: 'Backed by official brand distributors in Sri Lanka.',
  },
];

const BrandMark: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <span
    className={
      compact
        ? 'grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#1264FF] font-heading text-[11px] font-extrabold tracking-tight text-white shadow-[0_0_18px_rgba(22,135,255,0.55)] ring-1 ring-white/25'
        : 'grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1264FF] font-heading text-[15px] font-extrabold tracking-tight text-white shadow-[0_0_28px_rgba(22,135,255,0.65)] ring-1 ring-white/25'
    }
  >
    JM
  </span>
);

const DeviceShowcase: React.FC = () => (
  <div className="relative mx-auto mt-9 hidden w-full max-w-[520px] animate-float-slow lg:block">
    <div className="pointer-events-none absolute -left-6 -top-4 z-10 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm animate-float">
      5G Ready
    </div>
    <div className="pointer-events-none absolute -right-2 top-2 z-10 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm animate-float-slow">
      Sealed Flagships
    </div>

    <svg viewBox="0 0 520 264" fill="none" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="auth-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1687FF" />
          <stop offset="55%" stopColor="#1264FF" />
          <stop offset="100%" stopColor="#0B2A66" />
        </linearGradient>
        <linearGradient id="auth-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#123B8F" />
          <stop offset="100%" stopColor="#071A3D" />
        </linearGradient>
        <radialGradient id="auth-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#1687FF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1687FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="260" cy="246" rx="196" ry="16" fill="url(#auth-glow)" />

      <g transform="rotate(-6 154 132)">
        <rect x="92" y="24" width="124" height="216" rx="24" fill="#050D1F" stroke="#ffffff" strokeOpacity="0.16" />
        <rect x="99" y="31" width="110" height="202" rx="18" fill="url(#auth-screen)" opacity="0.92" />
        <rect x="132" y="38" width="44" height="7" rx="3.5" fill="#020A18" opacity="0.75" />
        <rect x="109" y="58" width="54" height="8" rx="4" fill="#ffffff" opacity="0.5" />
        <rect x="109" y="74" width="90" height="52" rx="12" fill="#ffffff" opacity="0.16" />
        <rect x="117" y="84" width="46" height="6" rx="3" fill="#ffffff" opacity="0.7" />
        <rect x="117" y="96" width="64" height="5" rx="2.5" fill="#ffffff" opacity="0.4" />
        <rect x="117" y="107" width="34" height="9" rx="4.5" fill="#00C6FF" opacity="0.9" />
        <rect x="109" y="136" width="42" height="34" rx="10" fill="#ffffff" opacity="0.14" />
        <rect x="157" y="136" width="42" height="34" rx="10" fill="#ffffff" opacity="0.14" />
        <rect x="109" y="178" width="90" height="14" rx="7" fill="#ffffff" opacity="0.1" />
        <rect x="134" y="216" width="40" height="5" rx="2.5" fill="#ffffff" opacity="0.6" />
      </g>

      <g transform="rotate(8 366 136)">
        <rect x="308" y="46" width="112" height="188" rx="22" fill="url(#auth-back)" stroke="#ffffff" strokeOpacity="0.14" />
        <rect x="320" y="58" width="54" height="66" rx="17" fill="#04101F" stroke="#ffffff" strokeOpacity="0.1" />
        <circle cx="336" cy="76" r="9.5" fill="#02060E" stroke="#1687FF" strokeOpacity="0.7" strokeWidth="2" />
        <circle cx="336" cy="104" r="9.5" fill="#02060E" stroke="#1687FF" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="360" cy="90" r="7" fill="#02060E" stroke="#00C6FF" strokeOpacity="0.6" strokeWidth="1.5" />
        <circle cx="364" cy="118" r="3.5" fill="#00C6FF" opacity="0.85" />
        <rect x="324" y="150" width="72" height="6" rx="3" fill="#ffffff" opacity="0.1" />
        <rect x="324" y="164" width="52" height="6" rx="3" fill="#ffffff" opacity="0.07" />
      </g>

      <g>
        <rect x="34" y="158" width="76" height="60" rx="20" fill="#0B2A66" stroke="#ffffff" strokeOpacity="0.14" />
        <path d="M34 178h76" stroke="#ffffff" strokeOpacity="0.14" />
        <circle cx="72" cy="196" r="4" fill="#00C6FF" opacity="0.9" />
      </g>

      <g>
        <rect x="442" y="92" width="34" height="132" rx="17" fill="#0B2A66" opacity="0.85" />
        <circle cx="459" cy="158" r="35" fill="#04101F" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" />
        <circle cx="459" cy="158" r="27" fill="url(#auth-screen)" opacity="0.9" />
        <path d="M459 140v18l12 8" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

export const AuthShell: React.FC<AuthShellProps> = ({ variant, children }) => {
  const copy = PANEL_COPY[variant];

  return (
    <div className="grid min-h-screen grid-cols-1 bg-base lg:grid-cols-[57fr_43fr]">
      {/* Brand panel */}
      <section className="relative order-2 flex flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#071A3D_0%,#0B2A66_58%,#071A3D_100%)] px-6 py-10 lg:order-1 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:px-14 lg:py-12">
        <div
          className="pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full bg-[#1264FF]/30 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[#00C6FF]/20 blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-[#1687FF]/50 to-transparent lg:block"
          aria-hidden="true"
        />

        <Link to="/" className="relative flex items-center gap-3.5">
          <BrandMark />
          <span className="leading-tight">
            <span className="block font-heading text-[15px] font-extrabold tracking-[-0.01em] text-white lg:text-base">
              JAFFNA MOBILEZONE
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.34em] text-white/55">
              Power Your Next Move.
            </span>
          </span>
        </Link>

        <div className="relative my-8 lg:my-0">
          <h2 className="font-heading text-2xl font-extrabold leading-[1.12] tracking-[-0.03em] text-white sm:text-3xl lg:text-[42px]">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/65 lg:text-sm">
            {copy.subtitle}
          </p>

          <DeviceShowcase />
        </div>

        <div className="relative grid grid-cols-2 gap-3 lg:gap-3.5">
          {TRUST_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm transition-colors duration-200 hover:border-[#1687FF]/40 lg:p-4"
            >
              <feature.icon className="h-4 w-4 text-[#1687FF]" />
              <p className="mt-2.5 font-heading text-[12px] font-extrabold leading-tight text-white">
                {feature.title}
              </p>
              <p className="mt-1 text-[10.5px] leading-snug text-white/55">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form side */}
      <section className="relative order-1 flex items-center justify-center px-4 py-10 sm:px-8 lg:order-2 lg:px-10 lg:py-16">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1687FF]/15 blur-[110px]"
          aria-hidden="true"
        />
        <div className="relative w-full max-w-[460px] animate-fade-up">
          <Link
            to="/"
            className="group mb-4 inline-flex h-11 items-center gap-2 rounded-2xl border border-line bg-card px-4 text-[13px] font-bold text-ink-2 shadow-soft transition-all duration-200 hover:border-[#1687FF]/50 hover:text-[#1687FF] focus-ring"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
          <div className="rounded-[28px] border border-line bg-card p-6 shadow-premium sm:rounded-[32px] sm:p-9">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
};
