/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#000000',
        charcoal: '#0a0a0a',
        graphite: '#141414',
        onyx: '#1a1a1a',
        accent: '#f5f5f5',
        gold: {
          50: '#fbf7ee',
          100: '#f5edd6',
          200: '#e8d9a8',
          300: '#dcc579',
          400: '#d4af37',
          500: '#c4a030',
          600: '#a8862a',
          700: '#876d23',
          800: '#65541c',
          900: '#3e3313',
        },
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-slow': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'gold-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(212, 175, 55, 0.2)' },
        },
        'scroll-down': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '40%': { opacity: '1' },
          '80%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'fade-in-slow': 'fade-in-slow 1.2s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'gold-shimmer': 'gold-shimmer 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2.5s ease-in-out infinite',
        'scroll-down': 'scroll-down 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
