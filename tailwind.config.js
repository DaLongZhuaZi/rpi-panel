/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0066cc',
          dark: '#004c99',
        },
        secondary: {
          light: '#d1fae5',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        background: {
          light: '#f9fafb',
          DEFAULT: '#f3f4f6',
          dark: '#1f2937',
        },
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      screens: {
        'xs': '320px',
        'sm': '480px',
        'md': '640px',
        'lg': '768px',
        'xl': '1024px',
      },
    },
  },
  plugins: [],
} 