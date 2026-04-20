/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Deep Forest
          forest: '#0C342C',
          'forest-dark': '#092721',

          // Sustainable Teal
          teal: '#076653',
          'teal-dark': '#054D3E',

          // Fresh Sprout
          sprout: '#E2FBCE',
          'sprout-dark': '#CBE2B9',

          // Electric Lime
          lime: '#E3EF26',
          'lime-dark': '#CCD722',

          // Creamy Custard
          cream: '#FFFDEE',
          'cream-dark': '#E6E4D6',

          // Black & Grey
          dark: '#020617',
          grey: '#E6E6E6',
          'grey-dark': '#B0B0B0',

          // White
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        // Ganti ke Poppins
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}