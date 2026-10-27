/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#FFFFFF',
          card: '#F8FAFC',
          border: '#E2E8F0',
          gold: '#D97706',
          goldLight: '#F59E0B',
          goldDark: '#B45309',
          silver: '#0F172A',
          muted: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
