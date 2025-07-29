/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2740fd',
          light: '#ecf0ff',
          dark: '#1f38c5'
        },
        neutral: {
          light: '#f5f5f5',
          dark: '#333333'
        },
        success: {
          DEFAULT: '#34c759'
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      }
    }
  },
  plugins: []
};