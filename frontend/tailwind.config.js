/** @type {import('tailwindcss').Config} */

// Colors are defined as HSL channel triplets in styles/index.css and referenced
// here semantically, so light/dark resolve from one set of names and Tailwind's
// opacity modifiers (bg-accent/10) keep working.
const token = (name) => `hsl(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        raised: token('raised'),
        line: token('line'),
        'line-strong': token('line-strong'),
        ink: token('ink'),
        muted: token('muted'),
        faint: token('faint'),
        accent: token('accent'),
        'accent-ink': token('accent-ink'),
        ok: token('ok'),
        warn: token('warn'),
        danger: token('danger'),
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Tiny uppercase mono labels used throughout the inspector.
        micro: ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
      },
      boxShadow: {
        lift: '0 1px 2px 0 hsl(var(--shadow) / 0.06), 0 8px 24px -8px hsl(var(--shadow) / 0.12)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        sweep: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.24s cubic-bezier(0.2, 0, 0, 1) both',
        sweep: 'sweep 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
