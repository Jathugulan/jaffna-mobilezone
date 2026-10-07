/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ---- Semantic tokens (driven by CSS variables, auto light/dark) ---- */
        base: 'rgb(var(--bg-base) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        card: 'rgb(var(--bg-card) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        line: 'rgb(var(--border-line) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--text-primary) / <alpha-value>)',
          2: 'rgb(var(--text-secondary) / <alpha-value>)',
          3: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
        },
        /* ---- Legacy palettes (kept so existing classes keep working) ---- */
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          blue: '#2563eb',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981',
        },
        dark: {
          bg: '#07090d',
          surface: '#0d1117',
          card: '#111720',
          border: '#26303d',
          hover: '#151c26',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        featured: '20px',
        hero: '28px',
        modal: '24px',
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(15, 23, 42, 0.10)',
        card: '0 8px 30px -12px rgba(15, 23, 42, 0.16)',
        'card-hover': '0 18px 44px -16px rgba(15, 23, 42, 0.24)',
        premium:
          '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -24px rgba(2,6,23,0.55)',
        glow: '0 0 28px -6px rgba(59, 130, 246, 0.45)',
        'glow-violet': '0 0 28px -6px rgba(139, 92, 246, 0.45)',
        'glow-cyan': '0 0 28px -6px rgba(34, 211, 238, 0.45)',
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 45%, #8B5CF6 100%)',
        'grad-ai': 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 50%, #8B5CF6 100%)',
        'grad-deal': 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #8B5CF6 100%)',
        'grad-aurora':
          'radial-gradient(60% 55% at 15% 10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(55% 50% at 85% 25%, rgba(139,92,246,0.16), transparent 60%), radial-gradient(70% 60% at 50% 100%, rgba(34,211,238,0.10), transparent 65%)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        'fade-up': 'fadeUp 380ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
