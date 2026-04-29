import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: 'var(--brand-orange)',
          violet: 'var(--brand-violet)',
          'violet-light': 'var(--brand-violet-light)',
          'violet-dark': 'var(--brand-violet-dark)',
        },
        surface: 'var(--surface)',
        surf2: 'var(--surf2)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        'text-muted': 'var(--text-muted)',
      },
    },
  },
  plugins: [],
};

export default config;
