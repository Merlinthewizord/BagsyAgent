import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bagsy: {
          primary: '#00ff88',      // Bright neon green
          secondary: '#00d4ff',    // Bright cyan blue
          accent: '#ff00ff',       // Magenta accent
          purple: '#a855f7',       // Purple
          orange: '#ff6b35',       // Orange accent
          success: '#00ff88',      // Green for positive
          danger: '#ff0055',       // Pink/red for negative
          dark: '#0a0a0a',         // Very dark background
          darker: '#000000',       // Pure black
          card: '#121212',         // Dark card background
          'card-light': '#1a1a1a', // Lighter card
          border: '#1f1f1f',       // Subtle borders
          'border-light': '#2a2a2a', // Lighter borders
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        'glow-pink': '0 0 20px rgba(255, 0, 85, 0.3), 0 0 40px rgba(255, 0, 85, 0.1)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)',
        'neon': '0 0 5px theme(colors.bagsy.primary), 0 0 20px theme(colors.bagsy.primary)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 136, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
