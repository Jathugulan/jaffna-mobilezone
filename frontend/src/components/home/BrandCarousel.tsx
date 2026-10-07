import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandPhoneStage } from './BrandPhoneStage';
import type { Brand as ApiBrand } from '../../types';
import type { PhoneStageTheme } from './BrandPhoneStage';

/* ------------------------------------------------------------------ */
/* Data model                                                          */
/* ------------------------------------------------------------------ */

export interface CarouselBrand {
  name: string;
  phoneCount: number;
  featured?: boolean;
  /** Optional external render override — falls back to the vector stage */
  image?: string;
  slug: string;
  theme: PhoneStageTheme;
}

/* Brand rows served by the API (admin-managed). `cardImageUrl` is the
   showcase photo for this carousel, `bannerUrl`/`logoUrl` are fallbacks. */
export type ApiBrandInput = Pick<
  ApiBrand,
  'name' | 'slug' | 'featured' | 'productCount'
> &
  Partial<Pick<ApiBrand, 'logoUrl' | 'bannerUrl' | 'cardImageUrl' | 'description'>>;

const THEME_BY_SLUG: Record<string, PhoneStageTheme> = {};
const FALLBACK_THEME: PhoneStageTheme = {
  frameLight: '#d8e3ef',
  frameMid: '#8298ad',
  frameDark: '#3e5266',
  backFrom: '#1c3350',
  backTo: '#0a1626',
  plateFrom: '#1c3049',
  plateTo: '#0a1624',
  screenFrom: '#0b2745',
  screenTo: '#030912',
  screenFlow: '#3b82f6',
};

/**
 * Merge live admin-managed brands over the static fallback lineup so the
 * carousel always renders: real showcase photos, live phone counts and the
 * admin-chosen featured brand. Unknown slugs keep the fallback theme.
 */
export function mergeApiBrands(apiBrands: ApiBrandInput[] | undefined | null): CarouselBrand[] {
  if (!apiBrands || apiBrands.length === 0) return BRANDS;
  const seen = new Set<string>();
  const merged: CarouselBrand[] = [];
  for (const b of apiBrands) {
    const slug = (b.slug || '').toLowerCase();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    merged.push({
      name: b.name,
      slug,
      phoneCount: typeof b.productCount === 'number' ? b.productCount : 0,
      featured: !!b.featured,
      image: b.cardImageUrl || b.bannerUrl || b.logoUrl || undefined,
      theme: THEME_BY_SLUG[slug] ?? FALLBACK_THEME,
    });
  }
  // Any static fallback brand missing from the API (e.g. zero products) is
  // appended so the carousel never looks empty.
  for (const f of BRANDS) {
    if (!seen.has(f.slug)) merged.push(f);
  }
  return merged;
}

export const BRANDS: CarouselBrand[] = [
  {
    name: 'Apple',
    phoneCount: 48,
    featured: true,
    slug: 'apple',
    theme: {
      frameLight: '#eef1f5',
      frameMid: '#a7b0bb',
      frameDark: '#59626e',
      backFrom: '#2b3037',
      backTo: '#14171b',
      plateFrom: '#23272e',
      plateTo: '#0b0d11',
      screenFrom: '#1d2f78',
      screenTo: '#05070f',
      screenFlow: '#3b82f6',
    },
  },
  {
    name: 'Samsung',
    phoneCount: 64,
    featured: false,
    slug: 'samsung',
    theme: {
      frameLight: '#e0d7f7',
      frameMid: '#9187b9',
      frameDark: '#4b4466',
      backFrom: '#2d2542',
      backTo: '#120e1e',
      plateFrom: '#2d2642',
      plateTo: '#100c1c',
      screenFrom: '#241457',
      screenTo: '#04030c',
      screenFlow: '#a855f7',
    },
  },
  {
    name: 'Xiaomi',
    phoneCount: 52,
    featured: false,
    slug: 'xiaomi',
    theme: {
      frameLight: '#e3e7ec',
      frameMid: '#9ba2ac',
      frameDark: '#4d535c',
      backFrom: '#26292e',
      backTo: '#0b0c0e',
      plateFrom: '#22262c',
      plateTo: '#0b0d10',
      screenFrom: '#0e3123',
      screenTo: '#030906',
      screenFlow: '#34d399',
    },
  },
  {
    name: 'OnePlus',
    phoneCount: 28,
    featured: false,
    slug: 'oneplus',
    theme: {
      frameLight: '#d5ded9',
      frameMid: '#828f89',
      frameDark: '#3d4a44',
      backFrom: '#16352b',
      backTo: '#061511',
      plateFrom: '#183229',
      plateTo: '#071512',
      screenFrom: '#0a2b20',
      screenTo: '#020806',
      screenFlow: '#22c55e',
    },
  },
  {
    name: 'Google',
    phoneCount: 16,
    featured: false,
    slug: 'google',
    theme: {
      frameLight: '#f4f1ea',
      frameMid: '#bcb7ad',
      frameDark: '#6c675e',
      backFrom: '#eceae3',
      backTo: '#c9c5bc',
      plateFrom: '#33363b',
      plateTo: '#15171a',
      screenFrom: '#132030',
      screenTo: '#03050a',
      screenFlow: '#38bdf8',
    },
  },
  {
    name: 'OPPO',
    phoneCount: 22,
    featured: false,
    slug: 'oppo',
    theme: {
      frameLight: '#d3e3f4',
      frameMid: '#7f99b5',
      frameDark: '#3c4f66',
      backFrom: '#164374',
      backTo: '#081c33',
      plateFrom: '#153a63',
      plateTo: '#071a30',
      screenFrom: '#082545',
      screenTo: '#030a15',
      screenFlow: '#38bdf8',
    },
  },
  {
    name: 'Vivo',
    phoneCount: 34,
    featured: false,
    slug: 'vivo',
    theme: {
      frameLight: '#eadff0',
      frameMid: '#a493b3',
      frameDark: '#544a63',
      backFrom: '#2a2350',
      backTo: '#0f0c22',
      plateFrom: '#241e44',
      plateTo: '#0d0a1c',
      screenFrom: '#131a4a',
      screenTo: '#04050f',
      screenFlow: '#22d3ee',
    },
  },
];

/** The track renders three copies so the loop can wrap seamlessly. */

for (const b of BRANDS) THEME_BY_SLUG[b.slug] = b.theme;

const TRACK_TRANSITION = 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)';

/* ------------------------------------------------------------------ */
/* Header controls                                                     */
/* ------------------------------------------------------------------ */

interface CarouselControlsProps {
  count: number;
  onPrev: () => void;
  onNext: () => void;
}

export const CarouselControls: React.FC<CarouselControlsProps> = ({ count, onPrev, onNext }) => (
  <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-end lg:gap-5">
    <Link
      to="/brands"
      className="group/all inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold text-primary transition-colors duration-300 hover:text-ink sm:text-sm min-[1440px]:text-[15px]"
    >
      All Brands ({count})
      <span aria-hidden="true" className="transition-transform duration-300 group-hover/all:translate-x-1">
        →
      </span>
    </Link>

    <div className="flex items-center gap-2 sm:gap-2.5">
      <button
        type="button"
        aria-label="Previous brands"
        onClick={onPrev}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-10 sm:w-10"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        aria-label="Next brands"
        onClick={onNext}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-10 sm:w-10"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
      </button>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

interface CarouselPaginationProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export const CarouselPagination: React.FC<CarouselPaginationProps> = ({ total, activeIndex, onSelect }) => (
  <div className="flex items-center justify-center gap-2 sm:gap-2.5" role="tablist" aria-label="Brand slides">
    {Array.from({ length: total }, (_, i) => {
      const active = i === activeIndex;
      return (
        <button
          key={i}
          type="button"
          role="tab"
          aria-label={`Go to brand ${i + 1}`}
          aria-selected={active}
          onClick={() => onSelect(i)}
          className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            active
              ? 'w-8 bg-primary shadow-soft dark:w-10'
              : 'w-5 bg-line hover:bg-ink-3 dark:w-7'
          }`}
        />
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/* Brand card                                                          */
/* ------------------------------------------------------------------ */

interface BrandCardProps {
  brand: CarouselBrand;
  isActive: boolean;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, isActive }) => {
  const featured = Boolean(brand.featured);

  const borderCls = featured
    ? 'border-2 border-primary/60 dark:border-primary/60'
    : isActive
      ? 'border border-blue-500/60'
      : 'border border-line hover:border-blue-500/50';

  const shadowCls = featured ? 'shadow-card-hover' : 'shadow-card hover:shadow-card-hover';

  const bgCls = 'bg-card';

  return (
    <div className="relative w-[180px] shrink-0 sm:w-[204px] md:w-[220px] xl:w-[232px]">
      {/* soft brand glow behind the featured card */}
      {featured && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-[26px] bg-[radial-gradient(closest-side,rgba(59,130,246,0.18),rgba(59,130,246,0)_75%)] dark:-inset-4 dark:rounded-[34px] dark:bg-[radial-gradient(closest-side,rgba(139,92,246,0.22),rgba(139,92,246,0)_75%)]"
        />
      )}

      <Link
        to={`/brand/${brand.slug}`}
        aria-current={isActive ? 'true' : undefined}
        className={`group relative flex h-[286px] w-full flex-col overflow-hidden rounded-card transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:-translate-y-1 sm:h-[300px] ${borderCls} ${shadowCls} ${bgCls}`}
      >
        {/* ---- product stage: compact showcase area ---- */}
        <div className="relative h-[172px] w-full flex-none overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 transition-[filter] duration-300 group-hover:brightness-[1.04] dark:from-[#0b1526] dark:to-[#060d18] dark:group-hover:brightness-[1.1] sm:h-[184px]">
          <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
            {brand.image ? (
              <>
                <img
                  src={brand.image}
                  alt={`${brand.name} smartphones`}
                  loading="lazy"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  className="absolute inset-x-3 bottom-3 top-1.5 h-[calc(100%-18px)] w-[calc(100%-24px)] rounded-lg object-cover object-top drop-shadow-[0_10px_18px_rgba(0,10,25,0.35)]"
                />
                {/* legibility gradient + accent top rim over photo */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,transparent_30%,transparent_55%,rgba(15,23,42,0.35)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,11,23,0.14)_0%,transparent_30%,transparent_60%,rgba(2,11,23,0.55)_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 top-1.5 h-px bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.55)_50%,transparent)]"
                />
              </>
            ) : (
              <BrandPhoneStage theme={brand.theme} />
            )}
          </div>

          {/* ---- featured badge ---- */}
          {featured && (
            <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-grad-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-soft">
              Featured
            </span>
          )}
        </div>

        {/* ---- brand information ---- */}
        <div className="flex flex-1 flex-col justify-center px-3.5 pb-3.5 sm:px-4">
          <h3 className="truncate text-[17px] font-extrabold leading-tight text-ink sm:text-[18px]">
            {brand.name}
          </h3>
          <p className="mt-0.5 text-[13px] font-medium text-ink-3">{brand.phoneCount} Phones</p>
          <span className="mt-1.5 inline-flex items-center text-[13px] font-bold text-primary transition-transform duration-300 group-hover:translate-x-1">
            Explore&nbsp;→
          </span>
        </div>
      </Link>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main carousel                                                       */
/* ------------------------------------------------------------------ */

export interface BrandCarouselProps {
  /** Count shown next to the "All Brands" link (defaults to the carousel length) */
  allBrandsCount?: number;
  /**
   * Live admin-managed brands (pass `brands` from Home). Merged over the
   * static fallback lineup: real showcase photos, live counts, featured flag.
   */
  apiBrands?: ApiBrandInput[] | null;
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ allBrandsCount, apiBrands }) => {
  const items = useMemo(() => mergeApiBrands(apiBrands), [apiBrands]);
  const total = items.length;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  /** Mirrors `current` so pointer/wheel handlers always read fresh values */
  const currentRef = useRef(total);
  const stepRef = useRef(230);

  const [current, setCurrent] = useState(total);
  const [step, setStep] = useState(230);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const normalizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLock = useRef(false);
  const suppressClick = useRef(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    dx: number;
    axis: 'x' | 'y' | null;
    captured: boolean;
  } | null>(null);

  const featuredIndex = Math.max(
    0,
    items.findIndex((b) => b.featured),
  );

  const LOOP_ITEMS = useMemo(() => [...items, ...items, ...items], [items]);

  // Re-seat the loop window when the lineup changes (e.g. API brands load).
  const lineupKey = items.map((b) => b.slug).join('|');
  useEffect(() => {
    currentRef.current = total + featuredIndex;
    setCurrent(total + featuredIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineupKey]);

  const activeIndex = ((current % total) + total) % total;

  /* ---------------- position helpers ---------------- */

  const commit = (value: number) => {
    currentRef.current = value;
    setCurrent(value);
  };

  /** Re-home the track into the middle copy without animating the jump. */
  const fixBounds = () => {
    const c = currentRef.current;
    if (c >= total && c < 2 * total) return;
    let v = c;
    while (v < total) v += total;
    while (v >= 2 * total) v -= total;
    setIsSnapping(true);
    commit(v);
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => setIsSnapping(false), 90);
  };

  const scheduleNormalize = () => {
    if (normalizeTimer.current) clearTimeout(normalizeTimer.current);
    normalizeTimer.current = setTimeout(fixBounds, 680);
  };

  const goBy = (delta: number) => {
    if (drag.current) return;
    commit(currentRef.current + delta);
    scheduleNormalize();
  };

  /** Jump to a brand, choosing the equivalent copy closest to the position. */
  const jumpTo = (index: number) => {
    if (drag.current) return;
    const candidates = [index, index + total].filter((c) => c >= 0 && c < 2 * total);
    let best = candidates[0];
    for (const c of candidates) {
      if (Math.abs(c - currentRef.current) < Math.abs(best - currentRef.current)) best = c;
    }
    commit(best);
    scheduleNormalize();
  };

  /* ---------------- responsive step measurement ---------------- */

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;
      const gap = parseFloat(getComputedStyle(track).columnGap || '16') || 16;
      const next = first.getBoundingClientRect().width + gap;
      stepRef.current = next;
      setStep(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(track);
    if (track.firstElementChild) ro.observe(track.firstElementChild);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(
    () => () => {
      if (normalizeTimer.current) clearTimeout(normalizeTimer.current);
      if (snapTimer.current) clearTimeout(snapTimer.current);
    },
    []
  );

  /* ---------------- pointer dragging (mouse + touch) ---------------- */

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    suppressClick.current = false;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      axis: null,
      captured: false,
    };
    setIsDragging(true);
    // Interrupt any in-flight animation and rest on the committed position.
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translate3d(${-currentRef.current * stepRef.current}px, 0, 0)`;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.axis) {
      if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis === 'x') {
        const el = wrapperRef.current;
        if (el?.setPointerCapture) {
          try {
            el.setPointerCapture(d.pointerId);
            d.captured = true;
          } catch {
            /* capture is best-effort */
          }
        }
      }
    }
    if (d.axis !== 'x') return;

    const clamped = Math.max(-stepRef.current * 1.6, Math.min(stepRef.current * 1.6, dx));
    d.dx = clamped;
    if (Math.abs(dx) > 8) suppressClick.current = true;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-currentRef.current * stepRef.current + clamped}px, 0, 0)`;
    }
  };

  const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || (e && e.pointerId !== d.pointerId)) return;
    drag.current = null;
    if (d.captured) {
      try {
        wrapperRef.current?.releasePointerCapture(d.pointerId);
      } catch {
        /* already released */
      }
    }

    if (d.axis === 'x') {
      const threshold = stepRef.current * 0.2;
      let target = currentRef.current;
      if (d.dx <= -threshold) target += 1;
      else if (d.dx >= threshold) target -= 1;
      if (trackRef.current) {
        trackRef.current.style.transition = TRACK_TRANSITION;
        trackRef.current.style.transform = `translate3d(${-target * stepRef.current}px, 0, 0)`;
      }
      commit(target);
      scheduleNormalize();
    }
    setIsDragging(false);

    if (suppressClick.current) {
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 350);
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /* ---------------- trackpad horizontal scrolling ---------------- */

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;
    if (wheelLock.current) return;
    wheelLock.current = true;
    goBy(e.deltaX > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLock.current = false;
    }, 450);
  };

  /* ---------------- keyboard navigation ---------------- */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goBy(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goBy(1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      jumpTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      jumpTo(total - 1);
    }
  };

  /* ---------------- render ---------------- */

  return (
    <section
      aria-label="Shop by Global Brand"
      className="relative w-full overflow-hidden bg-base pb-14 md:pb-[72px]"
    >
      {/* ---------- layered backdrop (light + dark) ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 aurora-bg" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[1200px] max-w-[160vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(59,130,246,0.16),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-240px] left-1/2 h-[480px] w-[1200px] max-w-[160vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(139,92,246,0.14),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.35)_35%,rgba(139,92,246,0.3)_65%,transparent)]"
      />

      {/* ---------- header ---------- */}
      <div className="relative z-20 flex flex-col gap-4 px-5 pt-9 sm:px-6 md:pt-12 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:px-10 xl:px-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3.5 py-1 text-[10.5px] font-black uppercase tracking-[0.2em] text-primary dark:border-primary/25 dark:bg-primary/10">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Official Partners
          </span>
          <h2 className="mt-2.5 text-[26px] font-black leading-[1.08] tracking-[-0.02em] text-ink sm:text-[32px] md:text-[38px] min-[1440px]:text-[44px] min-[1440px]:tracking-[-0.04em]">
            <span>Shop by </span>
            <span className="grad-text">Global Brand</span>
          </h2>
        </div>

        <CarouselControls
          count={allBrandsCount ?? total}
          onPrev={() => goBy(-1)}
          onNext={() => goBy(1)}
        />
      </div>

      {/* ---------- carousel track ---------- */}
      <div
        ref={wrapperRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Shop by global brand — use the arrow keys to navigate"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onWheel={handleWheel}
        onClickCapture={handleClickCapture}
        className="relative z-10 mt-6 cursor-grab touch-pan-y select-none focus-visible:[outline:2px_solid_rgba(37,99,235,0.55)] focus-visible:[outline-offset:-2px] md:mt-8"
      >
        <div
          ref={trackRef}
          className="flex w-max gap-3 pl-5 sm:gap-4 sm:pl-6 md:pl-10 lg:pl-16 xl:pl-20"
          style={{
            transform: `translate3d(${-current * step}px, 0, 0)`,
            transition: isDragging || isSnapping ? 'none' : TRACK_TRANSITION,
            willChange: 'transform',
          }}
        >
          {LOOP_ITEMS.map((brand, i) => (
            <BrandCard
              key={`${brand.slug}-${i}`}
              brand={brand}
              isActive={i % total === activeIndex}
            />
          ))}
        </div>
      </div>

      {/* ---------- pagination ---------- */}
      <div className="relative z-10 mt-5 md:mt-6">
        <CarouselPagination total={total} activeIndex={activeIndex} onSelect={jumpTo} />
      </div>
    </section>
  );
};

export default BrandCarousel;






