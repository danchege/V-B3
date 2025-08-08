/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        loveRed: '#e11d48',
        maroon: '#800000',
        pink: '#ec4899',
      },
    },
  },
  plugins: [],
}