import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  Truck,
  Headphones,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  BatteryCharging,
  Package,
  Grid3x3,
  CheckCircle2,
  Sparkles,
  Layers,
  Tag,
  Radio,
  PanelsTopLeft,
} from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';
import type { Category } from '../../types';

type IconType = React.ComponentType<{ className?: string }>;

const TRUST_POINTS: { icon: IconType; label: string }[] = [
  { icon: ShieldCheck, label: '100% Genuine Products' },
  { icon: Truck, label: 'Islandwide Delivery' },
  { icon: CheckCircle2, label: 'Manufacturer Warranty' },
  { icon: Headphones, label: 'Expert Support' },
];

const FEATURE_PANEL: { icon: IconType; label: string }[] = [
  { icon: Smartphone, label: 'Latest Smartphones' },
  { icon: Headphones, label: 'Premium Accessories' },
  { icon: ShieldCheck, label: 'Genuine Brands' },
  { icon: Truck, label: 'Islandwide Delivery' },
];

const resolveCategoryIcon = (name: string): IconType => {
  const n = name.toLowerCase();
  if (/foldable/.test(n)) return PanelsTopLeft;
  if (/flagship|premium|luxury/.test(n)) return Sparkles;
  if (/mid-?range/.test(n)) return Layers;
  if (/battery|power bank|charger|charging/.test(n)) return BatteryCharging;
  if (/budget|value|affordable/.test(n)) return Tag;
  if (/5g/.test(n)) return Radio;
  if (/tablet|ipad/.test(n)) return Tablet;
  if (/laptop|notebook|computer/.test(n)) return Laptop;
  if (/watch/.test(n)) return Watch;
  if (/earbud|audio|headphone|speaker/.test(n)) return Headphones;
  if (/accessor|cover|case/.test(n)) return Package;
  return Smartphone;
};

/* ---------------- Device stage: original hand-built phone design ---------------- */

const PhoneRear = () => (
  <g>
    {/* side buttons */}
    <rect x="231.5" y="252" width="5" height="38" rx="2.5" fill="#3f4d63" />
    <rect x="231.5" y="300" width="5" height="38" rx="2.5" fill="#3f4d63" />
    <rect x="411.5" y="276" width="5" height="52" rx="2.5" fill="#3f4d63" />
    {/* midnight glass body */}
    <rect x="236" y="118" width="176" height="372" rx="32" fill="url(#gBodyMidnight)" />
    <path d="M236 340 L412 150 L412 214 L236 452 Z" fill="rgba(255,255,255,0.045)" />
    <path d="M252 134 L252 474" stroke="rgba(255,255,255,0.24)" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M398 142 L398 466" stroke="rgba(99,102,241,0.45)" strokeWidth="1.8" strokeLinecap="round" />
    {/* camera plateau */}
    <rect
      x="250"
      y="132"
      width="104"
      height="104"
      rx="30"
      fill="url(#gCamPlateDark)"
      stroke="rgba(255,255,255,0.14)"
      strokeWidth="1.4"
    />
    {[
      [277, 165],
      [327, 165],
      [277, 212],
    ].map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="17" fill="url(#gLensRing)" />
        <circle cx={cx} cy={cy} r="11.5" fill="#0a101b" />
        <circle cx={cx} cy={cy} r="6" fill="#02040a" />
        <circle cx={cx - 5} cy={cy - 5} r="3.2" fill="rgba(255,255,255,0.75)" />
        <circle cx={cx + 4} cy={cy + 5} r="1.6" fill="rgba(99,102,241,0.6)" />
      </g>
    ))}
    <circle cx="327" cy="212" r="7" fill="rgba(253,224,71,0.92)" />
    <circle cx="327" cy="212" r="3" fill="rgba(255,255,255,0.5)" />
    <circle cx="311" cy="228" r="2.6" fill="rgba(255,255,255,0.35)" />
    <rect
      x="236"
      y="118"
      width="176"
      height="372"
      rx="32"
      fill="none"
      stroke="url(#gRimSilver)"
      strokeWidth="1.8"
    />
  </g>
);

const PhoneFront = () => (
  <g>
    {/* side buttons */}
    <rect x="413.5" y="256" width="5" height="34" rx="2.5" fill="#3f4d63" />
    <rect x="413.5" y="300" width="5" height="34" rx="2.5" fill="#3f4d63" />
    <rect x="586.5" y="284" width="5" height="48" rx="2.5" fill="#3f4d63" />
    {/* near-bezel-less display */}
    <rect x="418" y="140" width="170" height="356" rx="32" fill="url(#gBodyMidnight)" />
    <rect x="425" y="147" width="156" height="342" rx="26" fill="url(#gWallpaper)" />
    <path
      d="M425 318 C 468 246 520 302 581 226 L581 463 a26 26 0 0 1 -26 26 h-104 a26 26 0 0 1 -26 -26 Z"
      fill="url(#gWallpaperFlow)"
      opacity="0.75"
    />
    <path d="M434 156 L434 480" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeLinecap="round" />
    {/* status bar */}
    <g fill="rgba(255,255,255,0.85)">
      <rect x="437" y="168" width="4" height="5" rx="1" />
      <rect x="443" y="165" width="4" height="8" rx="1" />
      <rect x="449" y="162" width="4" height="11" rx="1" />
      <rect
        x="553"
        y="163"
        width="20"
        height="10"
        rx="3"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.4"
      />
      <rect x="555" y="165" width="13" height="6" rx="1.5" />
      <rect x="574.5" y="166" width="2.5" height="4" rx="1" />
    </g>
    {/* punch-hole island */}
    <rect x="474" y="160" width="58" height="20" rx="10" fill="#02040c" />
    <circle cx="522" cy="170" r="4" fill="rgba(99,102,241,0.55)" />
    <circle cx="522" cy="170" r="1.8" fill="rgba(165,181,253,0.9)" />
    {/* dock suggestion */}
    <g opacity="0.6">
      <rect x="447" y="436" width="112" height="36" rx="18" fill="rgba(255,255,255,0.14)" />
      <rect x="455" y="445" width="18" height="18" rx="5" fill="rgba(255,255,255,0.55)" />
      <rect x="483" y="445" width="18" height="18" rx="5" fill="rgba(255,255,255,0.45)" />
      <rect x="511" y="445" width="18" height="18" rx="5" fill="rgba(255,255,255,0.5)" />
      <rect x="539" y="445" width="18" height="18" rx="5" fill="rgba(255,255,255,0.4)" />
    </g>
    {/* gesture bar */}
    <rect x="470" y="477" width="66" height="5" rx="2.5" fill="rgba(255,255,255,0.7)" />
    {/* bezel + frame */}
    <rect
      x="425"
      y="147"
      width="156"
      height="342"
      rx="26"
      fill="none"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="1.4"
    />
    <rect
      x="418"
      y="140"
      width="170"
      height="356"
      rx="32"
      fill="none"
      stroke="rgba(165,181,253,0.4)"
      strokeWidth="1.5"
    />
  </g>
);

const SmartWatch = () => (
  <g>
    <path d="M660 300 L676 300 L682 384 L654 384 Z" fill="url(#gStrap)" />
    <path d="M654 404 L682 404 L676 500 L660 500 Z" fill="url(#gStrap)" />
    <rect x="640" y="376" width="56" height="62" rx="18" fill="url(#gBodyDark)" />
    <rect x="645" y="381" width="46" height="52" rx="14" fill="url(#gWatchFace)" />
    <circle cx="668" cy="407" r="15" fill="none" stroke="rgba(165,181,253,0.85)" strokeWidth="2" />
    <path d="M668 396 L668 407 L676 412" stroke="rgba(196,181,253,0.95)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <rect
      x="640"
      y="376"
      width="56"
      height="62"
      rx="18"
      fill="none"
      stroke="rgba(203,213,225,0.45)"
      strokeWidth="1.3"
    />
    <rect x="695" y="396" width="4" height="14" rx="2" fill="rgba(203,213,225,0.6)" />
  </g>
);

const EarbudsCase = () => (
  <g>
    <rect x="112" y="418" width="82" height="54" rx="17" fill="url(#gBodyDark)" />
    <rect
      x="112"
      y="418"
      width="82"
      height="54"
      rx="17"
      fill="none"
      stroke="rgba(203,213,225,0.45)"
      strokeWidth="1.3"
    />
    <path d="M113 440 L193 440" stroke="rgba(2,8,23,0.75)" strokeWidth="1.6" />
    <circle cx="153" cy="456" r="4" fill="rgba(99,102,241,0.9)" />
    <ellipse cx="132" cy="410" rx="10" ry="7" fill="url(#gBodySilver)" />
    <ellipse cx="174" cy="410" rx="10" ry="7" fill="url(#gBodySilver)" />
    <path d="M118 428 L118 462" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
  </g>
);

const DeviceStage = ({ onReserve }: { onReserve: () => void }) => (
  <div className="relative w-full">
    <svg
      viewBox="0 0 760 600"
      className="w-full h-auto select-none"
      role="img"
      aria-label="Two original flagship smartphones with a smartwatch and wireless earbuds on an illuminated circular platform"
    >
      <defs>
        <linearGradient id="gBodySilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="22%" stopColor="#cbd5e1" />
          <stop offset="48%" stopColor="#94a3b8" />
          <stop offset="72%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="gRimSilver" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="55%" stopColor="rgba(148,163,184,0.35)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.85)" />
        </linearGradient>
        <linearGradient id="gBodyDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="40%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="gBodyMidnight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="35%" stopColor="#131c2e" />
          <stop offset="70%" stopColor="#070c16" />
          <stop offset="100%" stopColor="#1a2438" />
        </linearGradient>
        <linearGradient id="gWallpaper" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="38%" stopColor="#4338ca" />
          <stop offset="70%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="gWallpaperFlow" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="rgba(99,102,241,0.5)" />
          <stop offset="50%" stopColor="rgba(167,139,250,0.45)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0.55)" />
        </linearGradient>
        <linearGradient id="gCamPlateDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#243044" />
          <stop offset="50%" stopColor="#101827" />
          <stop offset="100%" stopColor="#0a111d" />
        </linearGradient>
        <linearGradient id="gLensRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="gStrap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="gWatchFace" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="55%" stopColor="#0c2461" />
          <stop offset="100%" stopColor="#020817" />
        </radialGradient>
        <linearGradient id="gPlatformTop" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="40%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <radialGradient id="gPlatformSheen" cx="0.32" cy="0.18" r="0.7">
          <stop offset="0%" stopColor="rgba(165,181,253,0.4)" />
          <stop offset="60%" stopColor="rgba(99,102,241,0.08)" />
          <stop offset="100%" stopColor="rgba(2,8,23,0)" />
        </radialGradient>
        <radialGradient id="gBlueGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(59,130,246,0.75)" />
          <stop offset="55%" stopColor="rgba(37,99,235,0.3)" />
          <stop offset="100%" stopColor="rgba(2,8,23,0)" />
        </radialGradient>
        <filter id="fSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id="fSoftSm" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* atmospheric underglow */}
      <ellipse cx="380" cy="516" rx="270" ry="76" fill="url(#gBlueGlow)" filter="url(#fSoft)" />

      {/* orbital rings */}
      <g fill="none" stroke="#60a5fa" strokeLinecap="round">
        <ellipse
          cx="380"
          cy="470"
          rx="300"
          ry="88"
          strokeOpacity="0.32"
          strokeWidth="1.5"
          transform="rotate(-7 380 470)"
        />
        <ellipse
          cx="380"
          cy="470"
          rx="332"
          ry="100"
          strokeOpacity="0.18"
          strokeWidth="1.2"
          transform="rotate(6 380 470)"
        />
        <ellipse
          cx="380"
          cy="470"
          rx="266"
          ry="78"
          strokeOpacity="0.5"
          strokeWidth="1.8"
          transform="rotate(-2 380 470)"
        />
      </g>
      <circle cx="86" cy="447" r="3.4" fill="#a5b4fc" opacity="0.9" />
      <circle cx="672" cy="437" r="2.8" fill="#a5b4fc" opacity="0.8" />

      {/* platform */}
      <ellipse cx="380" cy="512" rx="258" ry="72" fill="url(#gPlatformTop)" />
      <ellipse cx="380" cy="502" rx="258" ry="72" fill="url(#gPlatformSheen)" />
      <ellipse
        cx="380"
        cy="502"
        rx="258"
        ry="72"
        fill="none"
        stroke="#60a5fa"
        strokeOpacity="0.85"
        strokeWidth="2"
      />
      <ellipse
        cx="380"
        cy="514"
        rx="238"
        ry="62"
        fill="none"
        stroke="#6366f1"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />
      <ellipse
        cx="380"
        cy="512"
        rx="258"
        ry="72"
        fill="none"
        stroke="#8b5cf6"
        strokeOpacity="0.55"
        strokeWidth="5"
        filter="url(#fSoftSm)"
      />

      {/* earbuds case */}
      <EarbudsCase />

      {/* hero flagship — rear view */}
      <g transform="rotate(-6 324 304)">
        <PhoneRear />
      </g>

      {/* hero flagship — front view */}
      <g transform="rotate(4 503 318)">
        <PhoneFront />
      </g>

      {/* smartwatch */}
      <SmartWatch />

      {/* contact shadows */}
      <g fill="rgba(2,8,23,0.55)" filter="url(#fSoftSm)">
        <ellipse cx="336" cy="497" rx="92" ry="13" />
        <ellipse cx="496" cy="503" rx="84" ry="12" />
        <ellipse cx="153" cy="474" rx="46" ry="8" />
        <ellipse cx="668" cy="504" rx="36" ry="8" />
      </g>
    </svg>

    {/* real booking entry point, preserved from previous hero */}
    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 sm:bottom-2">
      <button
        type="button"
        onClick={onReserve}
        className="group inline-flex items-center gap-2 rounded-card border border-line bg-card/85 px-4 py-2.5 shadow-soft backdrop-blur-md transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-ink">
          Reserve Flagship
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  </div>
);

/* ---------------- Hero ---------------- */

export const HeroSection: React.FC<{ onReserve: () => void }> = ({ onReserve }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    categoriesApi
      .getCategories({ active: true })
      .then((res) => {
        if (active && res.success && res.data) setCategories(res.data);
      })
      .catch(() => {
        /* bar degrades to All Categories only */
      });
    return () => {
      active = false;
    };
  }, []);

  const barCategories = [...categories]
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
    .slice(0, 7);

  const activeCls =
    'flex items-center gap-2 rounded-card bg-grad-primary px-3.5 py-2.5 text-[12px] font-bold whitespace-nowrap text-white shadow-soft';
  const idleCls =
    'flex items-center gap-2 rounded-card px-3.5 py-2.5 text-[12px] font-semibold whitespace-nowrap text-ink-2 transition hover:bg-elevated hover:text-ink';

  return (
    <section className="relative isolate overflow-hidden bg-base text-ink">
      {/* ---------- Backdrops (theme aware) ---------- */}
      <div aria-hidden className="aurora-bg absolute inset-0" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(1100px 520px at 78% 16%, rgba(59,130,246,0.16), transparent 62%),' +
            'radial-gradient(760px 420px at 12% 78%, rgba(139,92,246,0.14), transparent 60%),' +
            'radial-gradient(900px 600px at 50% 108%, rgba(99,102,241,0.10), transparent 65%)',
        }}
      />
      {/* fine energy lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09] dark:opacity-[0.16]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(59,130,246,0.55) 0 1px, transparent 1px 78px)',
          maskImage: 'radial-gradient(closest-side at 50% 40%, #000 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(closest-side at 50% 40%, #000 20%, transparent 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.22]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(99,102,241,0.5) 0 1px, transparent 1px 78px)',
          maskImage: 'radial-gradient(closest-side at 70% 55%, #000 15%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(closest-side at 70% 55%, #000 15%, transparent 95%)',
        }}
      />
      {/* volumetric bloom — blue + violet */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 h-[320px] w-[320px] rounded-full blur-3xl sm:h-[420px] sm:w-[420px]"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.16), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[440px] grid-cols-1 items-center gap-8 py-12 sm:min-h-[560px] sm:gap-10 sm:py-14 lg:min-h-[660px] lg:grid-cols-12 lg:gap-8 lg:py-16">
          {/* LEFT — 5 of 12 */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/[0.08] px-3 py-1.5 backdrop-blur-md dark:border-primary/30 dark:bg-primary/10 sm:px-3.5">
              <Cpu className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-[9.5px] font-black uppercase leading-tight tracking-[0.2em] text-primary sm:text-[10.5px]">
                Premium Mobile Technology
              </span>
            </div>

            <h1 className="mt-5 text-[38px] font-extrabold leading-[1.04] tracking-[-0.04em] sm:mt-6 sm:text-[48px] xl:text-[72px]">
              <span className="block text-ink">Power Your</span>
              <span className="grad-text block">Next Move.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-2 sm:text-base lg:text-[0.97rem]">
              Explore genuine smartphones, accessories, exclusive deals and flexible payment options
              at Jaffna Mobile Zone. Fast islandwide delivery with sealed manufacturer warranty.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-card bg-grad-primary px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:scale-[1.02] hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary/40 sm:px-6 sm:py-3.5"
              >
                Explore Phones
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 rounded-card border border-line bg-card/80 px-5 py-3 text-sm font-bold text-ink backdrop-blur-md transition hover:-translate-y-1 hover:border-blue-500/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:px-6 sm:py-3.5"
              >
                <Layers className="h-4 w-4 text-primary" />
                Compare Devices
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-x-5 gap-y-4 border-t border-line pt-6 sm:mt-9 sm:grid-cols-4 sm:pt-7">
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-[11.5px] font-medium leading-snug text-ink-2">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 7 of 12 */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-12">
              <div className="xl:col-span-10">
                <div className="relative">
                  <DeviceStage onReserve={onReserve} />

                  {/* floating glass stat cards — decorative, outside the stage svg */}
                  <div
                    aria-hidden="true"
                    className="animate-float-slow pointer-events-none absolute -left-3 top-8 hidden items-center gap-2 rounded-card border border-white/70 bg-white/80 px-3 py-2 shadow-card backdrop-blur-md lg:flex dark:border-white/10 dark:bg-elevated/75"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-ink">Sealed &amp; Genuine</span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="animate-float pointer-events-none absolute right-0 top-1/3 hidden items-center gap-2 rounded-card border border-white/70 bg-white/80 px-3 py-2 shadow-card backdrop-blur-md xl:flex dark:border-white/10 dark:bg-elevated/75"
                  >
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-ink">Islandwide Delivery</span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="animate-float-slow pointer-events-none absolute bottom-10 right-6 hidden items-center gap-2 rounded-card border border-white/70 bg-white/80 px-3 py-2 shadow-card backdrop-blur-md lg:flex dark:border-white/10 dark:bg-elevated/75"
                  >
                    <Headphones className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold text-ink">Expert Support</span>
                  </div>
                </div>
              </div>

              {/* vertical feature panel */}
              <aside className="hidden xl:col-span-2 xl:block">
                <div className="flex flex-col gap-5 border-l border-line pl-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.34em] text-primary">
                      Jaffna
                    </p>
                    <p className="grad-text mt-1 text-[15px] font-black uppercase leading-tight tracking-tight">
                      Mobilezone
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {FEATURE_PANEL.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-start gap-2.5">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-[11px] font-medium leading-snug text-ink-2">
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* BOTTOM CATEGORY BAR */}
        <div className="pb-7">
          <nav
            aria-label="Product categories"
            className="rounded-featured border border-line bg-card/80 p-1.5 shadow-soft backdrop-blur-xl sm:p-2"
          >
            <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto">
              <li className="shrink-0">
                <Link to="/shop" aria-current="page" className={activeCls}>
                  <Smartphone className="h-4 w-4" />
                  Smartphones
                </Link>
              </li>
              {barCategories.map((cat) => {
                const Icon = resolveCategoryIcon(cat.name);
                return (
                  <li key={cat._id} className="shrink-0">
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                      className={idleCls}
                    >
                      <Icon className="h-4 w-4" />
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
              <li className="shrink-0">
                <Link to="/categories" className={idleCls}>
                  <Grid3x3 className="h-4 w-4" />
                  All Categories
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
