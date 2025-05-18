import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        ghostTargetAppear: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.8)' },
          '20%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -50%) scale(1.2)' },
        },
        ghostHit: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.8)' },
          '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -50%) scale(1.5)' },
        },
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(1.2)',
            opacity: '0',
          },
        },
      },
      animation: {
        'ghost-target-appear': 'ghostTargetAppear 2s ease-out',
        'ghost-hit': 'ghostHit 0.8s ease-out forwards',
        'bounce': 'bounce 0.6s infinite alternate',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'arcade': ['Arcade', 'monospace'],
        'pixel': ['PixelFont', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config; 