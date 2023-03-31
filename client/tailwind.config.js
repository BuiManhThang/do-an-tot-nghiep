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
        'primary-disabled': '#93c5fd',
        secondary: '#4b5563',
        'secondary-hover': '#d1d5db',
        'secondary-ring': '#d1d5db',
        'secondary-disabled': '#d1d5db',
        'page-bg': '#f5f5f7',
        info: '#2563eb',
        success: '#22c55e',
        danger: '#dc2626',
        warn: '#facc15',
      },
      boxShadow: {
        custom: '0 0 6px 0 rgba(0, 0, 0, 0.24)',
        'custom-lg': '0 0 12px 0 rgba(0, 0, 0, 0.24)',
        'custom-xl': '0 0 18px 0 rgba(0, 0, 0, 0.24)',
      },
    },
  },
  plugins: [],
}
