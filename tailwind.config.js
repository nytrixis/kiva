/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fff9f9',
        foreground: '#111827',
        primary: '#2a4aa1',    
        accent: '#e7d1ff',      
        muted: '#F3F3F3',
      },
      
      fontFamily: {
        heading: ['var(--font-giaza)', 'serif'],
        sans: ['var(--font-montserrat)', 'sans-serif'],
      },
      
    },
  },
  plugins: [],
};
