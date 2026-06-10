/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ha-dark': '#0f172a', // Dark slate/navy for top header
        'ha-red': '#dc2626',  // Red for navbar and accents
      }
    },
  },
  plugins: [],
}