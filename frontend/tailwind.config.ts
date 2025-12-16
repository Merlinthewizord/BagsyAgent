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
          primary: '#00ff88',      // Bright neon green (bags.app style)
          secondary: '#00d4ff',    // Bright cyan blue
          accent: '#ff00ff',       // Magenta accent
          success: '#00ff88',      // Green for positive
          danger: '#ff0055',       // Pink/red for negative
          dark: '#0a0a0a',         // Very dark background
          darker: '#000000',       // Pure black
          card: '#121212',         // Dark card background
          border: '#1f1f1f',       // Subtle borders
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 0, 85, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
