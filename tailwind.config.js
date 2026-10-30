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
          // Official Brand Theme: Deep Navy (#08152F), Electric Blue (#2563EB), Golden Yellow (#FFC629)
          navy: 'var(--color-secondary, #08152F)',
          navyDark: '#050E20',
          navyLight: '#0D2044',
          navySurface: '#112855',
          blue: 'var(--color-primary, #2563EB)',
          blueHover: '#1D4ED8',
          blueLight: '#60A5FA',
          blueSubtle: '#EFF6FF',
          gold: 'var(--color-accent, #FFC629)',
          goldHover: '#E5B01F',
          goldLight: '#FFD359',
          goldSubtle: '#FFFBEB',
          primary: 'var(--color-primary, #2563EB)',
          secondary: 'var(--color-secondary, #08152F)',
          accent: 'var(--color-accent, #FFC629)',
          page: 'var(--color-page-bg, #F3F5F9)',
          card: 'var(--color-card-bg, #FFFFFF)',
          textDark: 'var(--color-text-primary, #08152F)',
          textMuted: 'var(--color-text-secondary, #667085)',
          btnText: 'var(--color-btn-text, #FFFFFF)',
          white: '#FFFFFF',
          light: 'var(--color-page-bg, #F3F5F9)',
          dark: 'var(--color-text-primary, #08152F)',
          muted: 'var(--color-text-secondary, #667085)',
          border: '#E2E8F0',
          silver: 'var(--color-text-primary, #08152F)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
