/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Sporty Palette
        sport: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        luxury: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        sport: ['Bebas Neue', 'Impact', 'Arial Black', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'shrink': 'shrink 5s linear forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(249, 115, 22, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(249, 115, 22, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shrink: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      backgroundImage: {
        'gradient-sport': 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        'gradient-sport-light': 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
        'mesh-dark': 'radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(234, 88, 12, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(194, 65, 12, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(124, 45, 18, 0.1) 0px, transparent 50%)',
        'mesh-light': 'radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(234, 88, 12, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(194, 65, 12, 0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(124, 45, 18, 0.05) 0px, transparent 50%)',
      },
      boxShadow: {
        'sport': '0 10px 40px -10px rgba(249, 115, 22, 0.3)',
        'sport-lg': '0 20px 60px -15px rgba(249, 115, 22, 0.4)',
        'luxury': '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
        'luxury-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.4)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.5)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.5)',
        'inner-luxury': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}

