import React, { useId } from 'react';

/**
 * Color recipe used by {@link BrandPhoneStage} to render a brand-specific
 * pair of premium smartphones standing on a futuristic light pedestal.
 */
export interface PhoneStageTheme {
  /** Metallic frame gradient (light / mid / dark stops) */
  frameLight: string;
  frameMid: string;
  frameDark: string;
  /** Rear back-glass colors */
  backFrom: string;
  backTo: string;
  /** Camera plateau colors */
  plateFrom: string;
  plateTo: string;
  /** Front display wallpaper colors */
  screenFrom: string;
  screenTo: string;
  /** Wallpaper accent flow */
  screenFlow: string;
}

interface BrandPhoneStageProps {
  theme: PhoneStageTheme;
  className?: string;
}

/**
 * Hand-built vector product stage (294 x 310):
 * rear-view phone on the left, front-display phone on the right, both with
 * realistic metallic frames / camera lenses / glass reflections, presented on
 * a futuristic elliptical showroom pedestal with concentric LED rings,
 * a bright horizontal center light, product reflections and violet-blue ambient glow.
 */
export const BrandPhoneStage: React.FC<BrandPhoneStageProps> = ({ theme, className = '' }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const t = theme;
  const id = (suffix: string) => `${uid}${suffix}`;

  return (
    <svg
      viewBox="0 0 294 310"
      className={`block h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* ---- metallic frame ---- */}
        <linearGradient id={id('frame')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={t.frameDark} />
          <stop offset="18%" stopColor={t.frameMid} />
          <stop offset="44%" stopColor={t.frameLight} />
          <stop offset="72%" stopColor={t.frameMid} />
          <stop offset="100%" stopColor={t.frameDark} />
        </linearGradient>
        <linearGradient id={id('frameStroke')} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
        </linearGradient>

        {/* ---- rear back glass ---- */}
        <linearGradient id={id('back')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.backFrom} />
          <stop offset="52%" stopColor={t.backTo} />
          <stop offset="100%" stopColor={t.backFrom} />
        </linearGradient>
        <linearGradient id={id('sheen')} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('plate')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.plateFrom} />
          <stop offset="100%" stopColor={t.plateTo} />
        </linearGradient>
        <radialGradient id={id('lens')} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#1d3149" />
          <stop offset="100%" stopColor="#050a12" />
        </radialGradient>
        <radialGradient id={id('glass')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#12517f" />
          <stop offset="100%" stopColor="#02060c" />
        </radialGradient>
        <radialGradient id={id('flash')} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#fff6d8" />
          <stop offset="100%" stopColor="#e8b64a" />
        </radialGradient>

        {/* ---- front display ---- */}

        <linearGradient id={id('screen')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.screenFrom} />
          <stop offset="100%" stopColor={t.screenTo} />
        </linearGradient>
        <linearGradient id={id('flow')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.screenFlow} stopOpacity="0.85" />
          <stop offset="100%" stopColor={t.screenFlow} stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id={id('screenGlow')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
        </linearGradient>

        {/* ---- lighting ---- */}
        <radialGradient id={id('spot')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.24" />
          <stop offset="65%" stopColor="#6366f1" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('spot2')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
          <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('beam')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.12" />
        </linearGradient>

        {/* ---- pedestal ---- */}
        <radialGradient id={id('ambient')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#4f46e5" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('ped')} cx="0.5" cy="0.4" r="0.72">
          <stop offset="0%" stopColor="#13283f" />
          <stop offset="58%" stopColor="#071527" />
          <stop offset="100%" stopColor="#03090f" />
        </radialGradient>
        <linearGradient id={id('reflA')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.backFrom} stopOpacity="0.55" />
          <stop offset="100%" stopColor={t.backFrom} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('reflB')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1b2e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0b1b2e" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('halo')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('bar')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('lip')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1a2d" />
          <stop offset="55%" stopColor="#050d1a" />
          <stop offset="100%" stopColor="#02060d" />
        </linearGradient>
        <linearGradient id={id('led')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('floor')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ============ atmospheric spotlights behind the phones ============ */}
      <ellipse cx="104" cy="126" rx="106" ry="138" fill={`url(#${id('spot')})`} />
      <ellipse cx="196" cy="116" rx="90" ry="120" fill={`url(#${id('spot2')})`} />
      <path d="M114 44 L180 44 L224 268 L70 268 Z" fill={`url(#${id('beam')})`} />

      {/* ============ futuristic pedestal (surface behind the phones) ============ */}
      <ellipse cx="147" cy="284" rx="136" ry="42" fill={`url(#${id('ambient')})`} />
      <ellipse cx="147" cy="276" rx="120" ry="26" fill={`url(#${id('ped')})`} />
      <path
        d="M31 271 A118 24 0 0 1 263 271"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="1.2"
      />
      {/* concentric tech rings */}
      <ellipse cx="147" cy="276" rx="106" ry="22" fill="none" stroke="#3b82f6" strokeOpacity="0.18" />
      <ellipse
        cx="147"
        cy="276"
        rx="90"
        ry="18.5"
        fill="none"
        stroke="#3b82f6"
        strokeOpacity="0.3"
        strokeDasharray="7 5"
      />
      <ellipse cx="147" cy="276" rx="72" ry="14.5" fill="none" stroke="#818cf8" strokeOpacity="0.42" />
      <ellipse cx="147" cy="276" rx="52" ry="10" fill="none" stroke="#a5b4fc" strokeOpacity="0.3" />
      {/* product reflections on the metallic surface */}
      <rect
        x="72"
        y="254"
        width="66"
        height="46"
        rx="10"
        fill={`url(#${id('reflA')})`}
        transform="rotate(-6 105 277)"
      />
      <rect
        x="158"
        y="256"
        width="64"
        height="46"
        rx="10"
        fill={`url(#${id('reflB')})`}
        transform="rotate(5 190 279)"
      />

      {/* ============ rear-view smartphone (left) ============ */}
      <g transform="translate(46 28) rotate(-6 56 116)">
        <rect width="112" height="232" rx="24" fill={`url(#${id('frame')})`} />
        <rect x="3.5" y="3.5" width="105" height="225" rx="21" fill={`url(#${id('back')})`} />
        <path d="M12 228 L82 4 L108 4 L28 228 Z" fill={`url(#${id('sheen')})`} opacity="0.6" />
        {/* camera plateau */}
        <g transform="translate(10 10)">
          <rect
            width="56"
            height="56"
            rx="18"
            fill={`url(#${id('plate')})`}
            stroke="#ffffff"
            strokeOpacity="0.14"
          />
          {[
            [16, 16],
            [40, 16],
            [16, 40],
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <circle r="10.5" fill="#0b1420" opacity="0.9" />
              <circle r="9" fill={`url(#${id('lens')})`} />
              <circle r="5.2" fill="#02060d" />
              <circle r="3" fill={`url(#${id('glass')})`} />
              <circle cx="-3" cy="-3.2" r="2.1" fill="#ffffff" opacity="0.75" />
              <path
                d="M-7.4 3 A8.6 8.6 0 0 0 7.4 3"
                fill="none"
                stroke="#3b82f6"
                strokeOpacity="0.35"
                strokeWidth="1.2"
              />
            </g>
          ))}
          <g transform="translate(40 40)">
            <circle r="6" fill="#0b1420" />
            <circle r="4.4" fill={`url(#${id('flash')})`} />
          </g>
        </g>
        {/* rim lighting + hardware buttons */}
        <path d="M8 42 L8 194" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M104 36 L104 200" stroke="#818cf8" strokeOpacity="0.5" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="110" y="74" width="5" height="30" rx="2.5" fill="#0a1524" />
        <rect x="-3" y="66" width="5" height="22" rx="2.5" fill="#0a1524" />
        <rect x="-3" y="94" width="5" height="22" rx="2.5" fill="#0a1524" />
        <path d="M22 224 L90 224" stroke="#60a5fa" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* ============ front-display smartphone (right) ============ */}
      <g transform="translate(142 42) rotate(5 54 112)">
        <rect width="108" height="224" rx="23" fill={`url(#${id('frame')})`} />
        <rect x="4" y="4" width="100" height="216" rx="19" fill={`url(#${id('screen')})`} />
        {/* wallpaper flow */}
        <path d="M4 160 C 36 126 66 152 104 104 L104 220 L4 220 Z" fill={`url(#${id('flow')})`} opacity="0.65" />
        <path d="M4 180 C 40 152 72 174 104 136 L104 220 L4 220 Z" fill={`url(#${id('flow')})`} opacity="0.35" />
        {/* pedestal light reflected on the lower screen */}
        <rect x="4" y="190" width="100" height="30" rx="17" fill={`url(#${id('screenGlow')})`} opacity="0.5" />
        {/* status bar + dynamic island */}
        <rect x="15" y="14" width="16" height="4" rx="2" fill="#ffffff" opacity="0.5" />
        <rect x="74" y="14" width="11" height="4" rx="2" fill="#ffffff" opacity="0.4" />
        <rect x="89" y="14" width="9" height="4" rx="2" fill="#ffffff" opacity="0.4" />
        <rect x="40" y="11" width="28" height="10" rx="5" fill="#03060b" />
        {/* glass reflection */}
        <path d="M4 4 L58 4 L22 220 L4 220 Z" fill={`url(#${id('sheen')})`} opacity="0.55" />
        <rect x="38" y="207" width="32" height="3.5" rx="1.75" fill="#ffffff" opacity="0.55" />
        {/* frame rail + blue rim light */}
        <rect
          x="0.75"
          y="0.75"
          width="106.5"
          height="222.5"
          rx="22.5"
          fill="none"
          stroke={`url(#${id('frameStroke')})`}
          strokeWidth="1.5"
        />
        <path d="M101 32 L101 194" stroke="#818cf8" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        <rect x="105" y="78" width="6" height="32" rx="3" fill="#0a1524" />
      </g>

      {/* ============ bright center light + pedestal front lip ============ */}
      <ellipse cx="147" cy="275" rx="74" ry="13" fill={`url(#${id('halo')})`} />
      <rect x="84" y="272" width="126" height="5" rx="2.5" fill={`url(#${id('bar')})`} />
      <path d="M27 276 A120 26 0 0 0 267 276 Z" fill={`url(#${id('lip')})`} />
      <path d="M27 276 A120 26 0 0 0 267 276" fill="none" stroke="#818cf8" strokeOpacity="0.38" strokeWidth="1" />
      <path d="M33 279 A114 24 0 0 0 261 279" fill="none" stroke={`url(#${id('led')})`} strokeWidth="2.2" />
      <path d="M46 286 A101 18 0 0 0 248 286" fill="none" stroke="#3b82f6" strokeOpacity="0.22" strokeWidth="1" />
      {/* soft blue floor reflection */}
      <ellipse cx="147" cy="304" rx="98" ry="16" fill={`url(#${id('floor')})`} />
    </svg>
  );
};

export default BrandPhoneStage;




