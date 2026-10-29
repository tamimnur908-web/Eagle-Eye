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
          // Modern Tech Theme: Charcoal (#101828), Cobalt Blue (#246BFD), Cyan (#36D6E7)
          charcoal: 'var(--color-secondary, #101828)',
          cobalt: 'var(--color-primary, #246BFD)',
          cyan: 'var(--color-accent, #36D6E7)',
          primary: 'var(--color-primary, #246BFD)',
          secondary: 'var(--color-secondary, #101828)',
          accent: 'var(--color-accent, #36D6E7)',
          page: 'var(--color-page-bg, #F8FAFC)',
          card: 'var(--color-card-bg, #FFFFFF)',
          textDark: 'var(--color-text-primary, #101828)',
          textMuted: 'var(--color-text-secondary, #667085)',
          btnText: 'var(--color-btn-text, #FFFFFF)',

          // Backward-compatibility aliases (mapped to Modern Tech theme)
          navy: 'var(--color-secondary, #101828)',
          navyDark: '#0B101B',
          navyLight: '#162033',
          navySurface: '#1E293B',
          blue: 'var(--color-primary, #246BFD)',
          blueHover: '#1A56DB',
          blueLight: '#528BFF',
          blueSubtle: '#EFF6FF',
          gold: 'var(--color-accent, #36D6E7)',
          goldHover: '#21C5D8',
          goldLight: '#7CE5F0',
          goldSubtle: '#E6FCFE',
          white: '#FFFFFF',
          light: 'var(--color-page-bg, #F8FAFC)',
          dark: 'var(--color-text-primary, #101828)',
          muted: 'var(--color-text-secondary, #667085)',
          border: '#E2E8F0',
          silver: 'var(--color-text-primary, #101828)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
