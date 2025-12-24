/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./compta-app/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "2.5rem",
          "2xl": "3rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1400px",
        },
      },
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          50: 'var(--orange-50)',
          100: 'var(--orange-100)',
          200: 'var(--orange-200)',
          300: 'var(--orange-300)',
          400: 'var(--orange-400)',
          500: 'var(--orange-500)',
          600: 'var(--orange-600)',
          700: 'var(--orange-700)',
          800: 'var(--orange-800)',
          900: 'var(--orange-900)',
        },
        'brand-orange': '#FD5904',
        'brand-orange-light': '#FF7A3D',
        muted: '#0B1020',
        'muted-foreground': '#A3A3A3',
        surface: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--surface-foreground)',
          muted: 'var(--surface-muted)',
          bright: 'var(--surface-bright)',
        },
      },
      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        soft: 'var(--shadow-md)',
        'elev-sm': 'var(--shadow-sm)',
        'elev-lg': 'var(--shadow-lg)',
        'elev-xl': 'var(--shadow-xl)',
        'elev-2xl': 'var(--shadow-2xl)',
        'glow-sm': '0 0 15px rgba(253, 89, 4, 0.15)',
        'glow-md': '0 0 30px rgba(253, 89, 4, 0.2)',
        'glow-lg': '0 0 60px rgba(253, 89, 4, 0.25)',
        'glow-xl': '0 0 80px rgba(253, 89, 4, 0.3)',
        'inner-glow': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
        'glass': 'var(--glass-shadow)',
        'glass-hover': 'var(--glass-shadow-hover)',
      },
      backgroundImage: {
        'radial-soft':
          'radial-gradient(800px_500px_at_50%_-150px, rgba(253,89,4,0.10), transparent 70%)',
        'radial-accent':
          'radial-gradient(circle at center, var(--orange-alpha-15) 0%, transparent 70%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        'gradient-premium': 'linear-gradient(to right, var(--orange-600), var(--orange-500))',
        'gradient-subtle': 'linear-gradient(to bottom right, var(--orange-alpha-5), transparent)',
      },
      animation: {
        'pulse': 'pulse 3s ease-in-out infinite',
        'float': 'float 15s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'bounce-sm': 'bounce-sm 3s ease-in-out infinite',
        'fade-up': 'fade-up 700ms ease-out both',
        'fade-in': 'fade-in 600ms ease-out both',
        'slide-up': 'slide-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'subtle-bounce': 'subtle-bounce 3s ease-in-out infinite',
        'float-slow': 'float 20s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.92' },
        },
        float: {
          '0%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
          '100%': { transform: 'translateY(0) rotate(0)' },
        },
        'subtle-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shine: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-circ': 'cubic-bezier(0.85, 0, 0.15, 1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      backdropSaturate: {
        '110': '1.1',
        '120': '1.2',
        '130': '1.3',
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.8rem + 2.25vw, 3rem)',
        'fluid-5xl': 'clamp(3rem, 2.4rem + 3vw, 4rem)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '98': '0.98',
      },
      blur: {
        'xs': '2px',
      },
      ringWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
