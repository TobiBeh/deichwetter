/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.ts',   // Falls du Angular benutzt, solltest du auch .ts/.html Dateien hinzufügen
    './src/**/*.component.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif']
      }
    },
  },
  plugins: [],
}
