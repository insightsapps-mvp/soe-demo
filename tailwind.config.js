/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(--${v}) / <alpha-value>)`
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: c('bg'),
        'bg-2': c('bg-2'),
        card: c('card'),
        border: c('border'),
        'border-strong': c('border-strong'),
        text: c('text'),
        'text-2': c('text-2'),
        muted: c('muted'),
        acento: { DEFAULT: c('acento'), hover: c('acento-hover'), soft: c('acento-soft'), foreground: c('acento-fg') },
        ok: { DEFAULT: c('ok'), soft: c('ok-soft') },
        warning: { DEFAULT: c('warning'), soft: c('warning-soft') },
        danger: { DEFAULT: c('danger'), soft: c('danger-soft') },
        navy: c('navy'),
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.05), 0 4px 12px rgba(0,0,0,.05)',
        pop: '0 10px 40px -10px rgba(0,0,0,.25)',
        glow: '0 0 0 1px rgb(var(--acento) / .25), 0 8px 30px -6px rgb(var(--acento) / .55)',
      },
      keyframes: {
        pulsedot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
        ring: { '0%': { transform: 'scale(.8)', opacity: .8 }, '100%': { transform: 'scale(2.2)', opacity: 0 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        pulsedot: 'pulsedot 1.6s ease-in-out infinite',
        ring: 'ring 1.6s ease-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
