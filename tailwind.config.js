/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Anton"', '"Impact"', 'sans-serif'],
        handwritten: ['"Caveat"', 'cursive'],
        body: ['"DM Sans"', 'Arial', 'sans-serif'],
        ui: ['"DM Sans"', 'Arial', 'sans-serif'],
      },
      colors: {
        ds: {
          bg: '#FFF9F4',
          surface: '#FFFFFF',
          'surface-alt': '#F2BED6',
          primary: '#FB0C72',
          'primary-hover': '#D90761',
          accent: '#A5DCD1',
          ink: '#000000',
        },
      },
      borderRadius: {
        'ds-sm': '4px',
        'ds-md': '8px',
        'ds-lg': '12px',
        'ds-pill': '999px',
      },
      boxShadow: {
        editorial: '0 12px 30px rgba(0, 0, 0, 0.10)',
        sticker: '4px 4px 0 rgba(0, 0, 0, 0.85)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
