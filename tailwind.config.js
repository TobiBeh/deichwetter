/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.ts',
    './src/**/*.component.html'
  ],
  darkMode: 'media', // Nutzt das System-Theme
  theme: {
    extend: {
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif']
      }
    },
  },
  plugins: [],
}
