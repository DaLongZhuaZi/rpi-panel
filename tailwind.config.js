/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1890ff',
          dark: '#096dd9',
          light: '#69c0ff'
        },
        secondary: {
          DEFAULT: '#722ed1',
          dark: '#531dab',
          light: '#9254de'
        },
        background: {
          DEFAULT: '#f0f2f5',
          light: '#f5f5f5'
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