import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,jsx,md,mdx,ts,tsx}'],
  presets: [require('./ui.preset.js')],
  theme: {
    extend: {
      colors: {
        shark: {
          '50': '#f7f7f6',
          '100': '#eceeea',
          '200': '#d8dcd6',
          '300': '#a7b2a3',
          '400': '#8f9d8b',
          '500': '#6f7d6a',
          '600': '#596554',
          '700': '#475144',
          '800': '#3c4239',
          '900': '#313730',
          '950': '#181c17',
        },
      },
    },
  },
} satisfies Config;
