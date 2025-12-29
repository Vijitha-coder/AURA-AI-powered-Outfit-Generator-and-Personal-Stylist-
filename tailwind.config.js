/** @type {import('tailwindcss').Config} */
export default {
  content: [
  "./**/*.html",
  "./**/*.{js,jsx,ts,tsx}",

  "!./node_modules/**",
  "!./dist/**"
],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        card: '#1A1A1A',
        'text-primary': '#F0E6D6',
        'text-secondary': '#C8C8C8',
        'accent-primary': '#DAA520',
        'accent-secondary': '#8B7955',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
}


