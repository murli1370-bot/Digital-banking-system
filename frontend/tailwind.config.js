/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A1628',
          900: '#0F1F38',
          800: '#152A4A',
          700: '#1C3A5E',
        },
        navy: {
          50: '#EEF2F9',
          100: '#D8E1F0',
          200: '#B3C5E0',
          300: '#85A2CC',
          400: '#5A7FB5',
          500: '#3B5F99',
          600: '#2C4A7C',
          700: '#1F3760',
          800: '#15264A',
          900: '#0D1933',
        },
        gold: {
          50: '#FBF7EC',
          100: '#F5EACB',
          200: '#EAD49C',
          300: '#DCB968',
          400: '#CDA047',
          500: '#B8893A',
          600: '#96702E',
        },
        sage: {
          50: '#EFF6F1',
          100: '#D7EADD',
          400: '#4F9C6A',
          500: '#3D8254',
          600: '#2F6943',
        },
        rust: {
          50: '#FCEEEA',
          100: '#F6D2C6',
          400: '#D86A4A',
          500: '#C2512F',
          600: '#A33F23',
        },
        paper: '#F7F5F0',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 31, 56, 0.06), 0 8px 24px rgba(15, 31, 56, 0.08)',
        'card-hover': '0 4px 12px rgba(15, 31, 56, 0.10), 0 16px 32px rgba(15, 31, 56, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: 0, transform: 'translateX(-8px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
      },
    },
  },
  plugins: [],
}
