import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#F8612D',
        'brand-violet': '#5F44C5',
        'brand-violet-light': '#BB5BFF',
        'brand-violet-dark': '#3E1544',
        'brand-black': '#020102',
        surface: '#111010',
        surf2: '#1A1820',
        'text-muted': '#7A7974',
        border: '#2A2830',
        border2: '#3A3648',
      },
    },
  },
  plugins: [],
};

export default config;
