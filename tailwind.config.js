/**@type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        devpulse: {
          dark: '#0f172a',
          card: '#1e293b',
          purple: '#7c3aed',
          glow: '#a78bfa'
        }
      }
    }
  }, plugins: [],

}