/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#060d1f', 900: '#0a1530', 800: '#10203d', 700: '#1b3159', 600: '#2c4a80' },
        teal: { DEFAULT: '#2dd4bf', dim: '#14b8a6' },
      },
      fontFamily: { display: ['Georgia', '"Times New Roman"', 'serif'], sans: ['"Segoe UI"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
