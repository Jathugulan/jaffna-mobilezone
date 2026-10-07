import React, { useId } from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'monogram';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  showTagline?: boolean;
}

/* Geometry note: the J stem (x 50-56) and the M left leg (x 50-56) occupy the
   exact same column, so the two letters fuse into a single monogram form
   rather than reading as two separate glyphs. */
const JM_PATHS = [
  'M50 42H56V78C56 88 51 93 44 93L44 87C48 87 50 84 50 78Z',
  'M50 42H58L64 63L70 42H78V84H72V53L64 74L56 53V84H50Z',
] as const;

/**
 * Futuristic JM monogram: a premium smartphone silhouette carrying a fused
 * J+M mark, wrapped by an orbital energy swoosh (electric -> royal -> cyan).
 * Transparent background. Works on light and dark surfaces.
 */
export const JMMonogram: React.FC<{ className?: string; title?: string }> = ({
  className = '',
  title,
}) => {
  const uid = useId();
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      <defs>
        <linearGradient id={id('body')} x1="38" y1="10" x2="90" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#334155" />
          <stop offset="0.34" stopColor="#1E293B" />
          <stop offset="0.62" stopColor="#0F172A" />
          <stop offset="1" stopColor="#060B18" />
        </linearGradient>
        <linearGradient id={id('bodySide')} x1="38" y1="10" x2="90" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1E293B" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={id('screen')} x1="42" y1="14" x2="86" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0B1220" />
          <stop offset="0.55" stopColor="#050A16" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <radialGradient id={id('glow')} cx="0.5" cy="0.24" r="0.72">
          <stop offset="0" stopColor="#2563EB" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#1D4ED8" stopOpacity="0.09" />
          <stop offset="1" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('edge')} x1="38" y1="10" x2="90" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7DD3FC" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#38BDF8" stopOpacity="0.55" />
          <stop offset="0.68" stopColor="#1D4ED8" stopOpacity="0.22" />
          <stop offset="1" stopColor="#06B6D4" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={id('mono')} x1="44" y1="42" x2="80" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#94A3B8" />
          <stop offset="0.22" stopColor="#334155" />
          <stop offset="0.55" stopColor="#1E293B" />
          <stop offset="0.82" stopColor="#0F172A" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={id('monoDeep')} x1="44" y1="42" x2="80" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1E293B" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={id('monoRim')} x1="44" y1="42" x2="80" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#BAE6FD" />
          <stop offset="0.35" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="1" stopColor="#1D4ED8" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={id('monoSheen')} x1="50" y1="42" x2="64" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('orbit')} x1="14" y1="52" x2="114" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22D3EE" stopOpacity="0" />
          <stop offset="0.16" stopColor="#38BDF8" />
          <stop offset="0.48" stopColor="#2563EB" />
          <stop offset="0.76" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#67E8F9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('orbitHot')} x1="14" y1="52" x2="114" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#67E8F9" stopOpacity="0" />
          <stop offset="0.2" stopColor="#A5F3FC" />
          <stop offset="0.52" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#CFFAFE" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1 - orbital swoosh behind the body */}
      <g transform="rotate(-13 64 76)">
        <ellipse cx="64" cy="76" rx="53" ry="21.5" fill="none" stroke={`url(#${id('orbit')})`} strokeWidth="7" strokeLinecap="round" opacity="0.3" />
        <ellipse cx="64" cy="76" rx="53" ry="21.5" fill="none" stroke={`url(#${id('orbitHot')})`} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <ellipse cx="64" cy="76" rx="47" ry="18" fill="none" stroke={`url(#${id('orbit')})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.38" />
      </g>

      {/* 2 - smartphone extrusion (3D depth) */}
      <rect x="43" y="15" width="52" height="108" rx="12" fill={`url(#${id('bodySide')})`} />

      {/* 3 - smartphone front face */}
      <rect x="38" y="10" width="52" height="108" rx="12" fill={`url(#${id('body')})`} />
      <rect x="38" y="10" width="52" height="108" rx="12" fill={`url(#${id('glow')})`} opacity="0.5" />

      {/* bevel catch-light */}
      <path d="M38 22V22A12 12 0 0 1 50 10H78" stroke="#E2E8F0" strokeOpacity="0.3" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M90 98V96A12 12 0 0 1 78 108H52" stroke="#020617" strokeOpacity="0.75" strokeWidth="1.8" strokeLinecap="round" />

      {/* electric edge lighting */}
      <rect x="38.8" y="10.8" width="50.4" height="106.4" rx="11.2" fill="none" stroke={`url(#${id('edge')})`} strokeWidth="1.6" opacity="0.9" />

      {/* screen */}
      <rect x="42" y="14" width="44" height="100" rx="8" fill={`url(#${id('screen')})`} />
      <rect x="42" y="14" width="44" height="100" rx="8" fill={`url(#${id('glow')})`} />
      <rect x="42.8" y="14.8" width="42.4" height="98.4" rx="7.2" fill="none" stroke="#38BDF8" strokeOpacity="0.22" strokeWidth="1" />

      {/* Dynamic-Island-inspired earpiece */}
      <rect x="56.5" y="18.5" width="15" height="4.4" rx="2.2" fill="#020617" />
      <rect x="56.5" y="18.5" width="15" height="4.4" rx="2.2" fill="none" stroke="#38BDF8" strokeOpacity="0.35" strokeWidth="0.8" />
      <rect x="58.5" y="19.8" width="5.5" height="1.6" rx="0.8" fill="#64748B" opacity="0.55" />

      {/* 4 - the fused JM monogram */}
      <g transform="translate(2.6,2.6)" fill={`url(#${id('monoDeep')})`}>
        {JM_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill={`url(#${id('mono')})`}>
        {JM_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill="none" stroke={`url(#${id('monoRim')})`} strokeWidth="1.15" strokeLinejoin="round" opacity="0.9">
        {JM_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d="M50 42H58L64 63L56 53V84H50Z" fill={`url(#${id('monoSheen')})`} opacity="0.5" />

      {/* 5 - orbital swoosh front arc: the wrap-around 3D cue */}
      <g transform="rotate(-13 64 76)">
        <path d="M11 76a53 21.5 0 0 0 106 0" fill="none" stroke={`url(#${id('orbit')})`} strokeWidth="6" strokeLinecap="round" opacity="0.95" />
        <path d="M11 76a53 21.5 0 0 0 106 0" fill="none" stroke={`url(#${id('orbitHot')})`} strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
        <path d="M17 76a47 18 0 0 0 94 0" fill="none" stroke="#BAE6FD" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  showTagline = true,
}) => {
  /* Icon only — favicon-scale use, loading states, tight spaces. */
  if (variant === 'monogram') {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
        <JMMonogram className="h-11 w-11" />
      </span>
    );
  }

  /* Tight lockup for the mobile drawer header and admin sidebar. */
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <JMMonogram className="h-10 w-10 shrink-0" />
        <span className="flex flex-col justify-center leading-none">
          <span className="text-[8.5px] font-bold uppercase tracking-[0.32em] text-ink-3">
            Jaffna
          </span>
          <span className="mt-1 flex items-baseline text-[15px] font-extrabold leading-none tracking-[-0.03em]">
            <span className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-400 dark:to-blue-400">
              Mobile
            </span>
            <span className="text-ink">Zone</span>
          </span>
        </span>
      </span>
    );
  }

  /* Full lockup: [JM icon] [JAFFNA / MOBILEZONE / Power Your Next Move.] */
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <JMMonogram className="h-12 w-12 shrink-0 drop-shadow-[0_8px_20px_rgba(2,6,23,0.35)]" />

      <span className="flex flex-col justify-center leading-none">
        <span className="text-[9px] font-bold uppercase leading-none tracking-[0.34em] text-ink-3">
          Jaffna
        </span>

        <span className="mt-1.5 flex items-baseline text-[20px] font-extrabold leading-none tracking-[-0.035em] sm:text-[22px]">
          <span className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-400 dark:to-blue-400">
            Mobile
          </span>
          <span className="text-ink">Zone</span>
        </span>

        {showTagline && (
          <span className="mt-1.5 hidden text-[9.5px] font-medium leading-none tracking-[0.06em] text-ink-3 xl:inline">
            Power Your Next Move.
          </span>
        )}
      </span>
    </span>
  );
};

export default BrandLogo;