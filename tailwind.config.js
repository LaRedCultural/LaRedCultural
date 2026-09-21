/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07080b',
          900: '#0d0f14',
          850: '#12151c',
          800: '#171b24',
          700: '#232936',
          600: '#323a4d',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
        },
        autumn: {
          gold: '#eab308',
          copper: '#c2410c',
          terracotta: '#b91c1c',
          rust: '#9a3412',
          glow: 'rgba(245, 158, 11, 0.15)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
      },
      boxShadow: {
        'amber-glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'amber-glow-lg': '0 0 45px -5px rgba(245, 158, 11, 0.45)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
};
