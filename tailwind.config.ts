import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm, spirit-forward palette.
        amber: {
          50: '#fbf6ef',
          100: '#f3e5d0',
          200: '#e6c79c',
          300: '#d6a866',
          400: '#c98f3c',
          500: '#b3762a',
          600: '#925d22',
          700: '#71481f',
          800: '#4f331a',
          900: '#2e2013',
          950: '#171009',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
