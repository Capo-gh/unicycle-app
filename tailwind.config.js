/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'unicycle-green': '#10B981',
        'unicycle-blue': '#3B82F6',
      }
    },
  },
  plugins: [],
}