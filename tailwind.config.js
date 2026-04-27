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
          dark: '#000000',
          card: '#0a0a0a',
          primary: '#22c55e',
          accent: '#4ade80'
        }
      }
    }
  }, plugins: [],

}