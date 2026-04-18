/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080810',
          secondary: '#0f0f1a',
          card: '#13131f',
          border: '#1e1e30',
          hover: '#1a1a28',
        },
        accent: {
          gold: '#f59e0b',
          'gold-dim': '#b45309',
          'gold-glow': 'rgba(245,158,11,0.15)',
        },
        outcome: {
          win: '#10b981',
          'win-bg': 'rgba(16,185,129,0.12)',
          loss: '#ef4444',
          'loss-bg': 'rgba(239,68,68,0.12)',
          be: '#6366f1',
          'be-bg': 'rgba(99,102,241,0.12)',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#475569',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(245,158,11,0.2)',
        'card-glow': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
