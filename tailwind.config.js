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
          navy: '#08152F',
          navyDark: '#050E20',
          navyLight: '#0D2044',
          navySurface: '#112855',
          blue: '#2563EB',
          blueHover: '#1D4ED8',
          blueLight: '#3B82F6',
          blueSubtle: '#EFF6FF',
          gold: '#FFC629',
          goldHover: '#E5B01F',
          goldLight: '#FFD359',
          goldSubtle: '#FFF8E6',
          white: '#FFFFFF',
          light: '#F3F5F9',
          dark: '#172033',
          muted: '#667085',
          border: '#E2E8F0',
          // Backward-compatibility aliases
          card: '#FFFFFF',
          silver: '#172033',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
