/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto'],
      },
      colors: {
        primary: '#2563eb',
        'primary-hover': '#1d4ed8',
        'primary-ring': '#93c5fd',
        secondary: '#4b5563',
        'secondary-hover': '#d1d5db',
        'secondary-ring': '#d1d5db',
      },
      boxShadow: {
        custom: '0 0 6px 0 rgba(0, 0, 0, 0.24)',
      },
    },
  },
  plugins: [],
}
