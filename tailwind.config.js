/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Design Tokens (mapped to CSS custom properties) ──────────────────
      colors: {
        // Accent brand color (violet-indigo, hue 264)
        accent: {
          50:  'hsl(var(--accent-50) / <alpha-value>)',
          100: 'hsl(var(--accent-100) / <alpha-value>)',
          200: 'hsl(var(--accent-200) / <alpha-value>)',
          500: 'hsl(var(--accent-500) / <alpha-value>)',
          600: 'hsl(var(--accent-600) / <alpha-value>)',
          700: 'hsl(var(--accent-700) / <alpha-value>)',
          DEFAULT: 'hsl(var(--accent-600) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        // Keep "primary" as alias for accent for backward compat
        primary: {
          50:  'hsl(var(--accent-50) / <alpha-value>)',
          100: 'hsl(var(--accent-100) / <alpha-value>)',
          200: 'hsl(var(--accent-200) / <alpha-value>)',
          300: 'hsl(var(--accent-200) / <alpha-value>)',
          400: 'hsl(var(--accent-500) / <alpha-value>)',
          500: 'hsl(var(--accent-500) / <alpha-value>)',
          600: 'hsl(var(--accent-600) / <alpha-value>)',
          700: 'hsl(var(--accent-700) / <alpha-value>)',
          800: 'hsl(var(--accent-700) / <alpha-value>)',
          900: 'hsl(var(--accent-700) / <alpha-value>)',
          950: 'hsl(var(--accent-700) / <alpha-value>)',
          DEFAULT: 'hsl(var(--accent-600) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        // Brand Blue (TrackDeal Blue)
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          DEFAULT: '#0284c7',
        },
        // Surfaces & backgrounds
        app:      'hsl(var(--bg-app) / <alpha-value>)',
        surface:  'hsl(var(--bg-surface) / <alpha-value>)',
        elevated: 'hsl(var(--bg-elevated) / <alpha-value>)',
        overlay:  'hsl(var(--bg-overlay) / <alpha-value>)',
        // Neutral scale
        neutral: {
          0:   'hsl(var(--neutral-0) / <alpha-value>)',
          25:  'hsl(var(--neutral-25) / <alpha-value>)',
          50:  'hsl(var(--neutral-50) / <alpha-value>)',
          100: 'hsl(var(--neutral-100) / <alpha-value>)',
          200: 'hsl(var(--neutral-200) / <alpha-value>)',
          300: 'hsl(var(--neutral-300) / <alpha-value>)',
          400: 'hsl(var(--neutral-400) / <alpha-value>)',
          500: 'hsl(var(--neutral-500) / <alpha-value>)',
          700: 'hsl(var(--neutral-700) / <alpha-value>)',
          900: 'hsl(var(--neutral-900) / <alpha-value>)',
          950: 'hsl(var(--neutral-950) / <alpha-value>)',
        },
        // Text colors
        'text-primary':   'hsl(var(--neutral-900) / <alpha-value>)',
        'text-secondary': 'hsl(var(--neutral-500) / <alpha-value>)',
        'text-muted':     'hsl(var(--neutral-400) / <alpha-value>)',
        // Borders
        'border-default': 'hsl(var(--neutral-100) / <alpha-value>)',
        'success-bg': 'hsl(var(--success-bg) / <alpha-value>)',
        'success-text': 'hsl(var(--success-text) / <alpha-value>)',
        'warning-bg': 'hsl(var(--warning-bg) / <alpha-value>)',
        'warning-text': 'hsl(var(--warning-text) / <alpha-value>)',
        'danger-bg': 'hsl(var(--danger-bg) / <alpha-value>)',
        'danger-text': 'hsl(var(--danger-text) / <alpha-value>)',
        'info-bg': 'hsl(var(--info-bg) / <alpha-value>)',
        'info-text': 'hsl(var(--info-text) / <alpha-value>)',
        // Legacy aliases (keep for backward compat)
        background: 'hsl(var(--bg-app) / <alpha-value>)',
        border:     'hsl(var(--neutral-100) / <alpha-value>)',
        muted:      'hsl(var(--neutral-400) / <alpha-value>)',
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'micro':   ['10px', { lineHeight: '14px', letterSpacing: '0.05em' }],
        'label':   ['11px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'body-sm': ['13px', { lineHeight: '18px' }],
        'body':    ['14px', { lineHeight: '20px' }],
        'h4':      ['14px', { lineHeight: '20px', letterSpacing: '-0.01em' }],
        'h3':      ['17px', { lineHeight: '24px', letterSpacing: '-0.02em' }],
        'h2':      ['22px', { lineHeight: '28px', letterSpacing: '-0.03em' }],
        'h1':      ['30px', { lineHeight: '36px', letterSpacing: '-0.04em' }],
      },

      // ── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        'sm':  '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'md':  '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'lg':  '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -2px rgb(0 0 0 / 0.04)',
        'xl':  '0 20px 25px -5px rgb(0 0 0 / 0.10), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.20)',
        'focus': '0 0 0 3px hsl(264 83% 57% / 0.25)',
        'none': 'none',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        'chip':  '6px',
        'input': '8px',
        'btn':   '8px',
        'card':  '12px',
        'panel': '12px',
      },

      // ── Animation & Transitions ───────────────────────────────────────────
      transitionTimingFunction: {
        'enter':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'exit':   'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '80':  '80ms',
        '120': '120ms',
        '200': '200ms',
        '250': '250ms',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(100%)' },
        },
        'fade-scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        'toast-in': {
          from: { transform: 'translateX(calc(100% + 16px))', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-scale-in':  'fade-scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':        'fade-in 150ms ease-out',
        'shimmer':        'shimmer 1.5s linear infinite',
        'toast-in':       'toast-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
