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
        'watercolor': {
          50: '#fef8f4',
          100: '#fdeee3',
          200: '#fad9c6',
          300: '#f6bc9c',
          400: '#f19670',
          500: '#ea744f',
          600: '#e15a3a',
          700: '#bc4530',
          800: '#98392b',
          900: '#7b3226',
        },
      },
      animation: {
        'brush-stroke': 'brushStroke 3s ease-in-out infinite',
      },
      keyframes: {
        brushStroke: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateX(10px) rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config