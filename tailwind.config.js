/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/*.html`],
  daisyui: {
    themes: ['fantasy'],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  
}



