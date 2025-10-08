/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0d6efd', 600: '#0b5ed7' },
        success: { DEFAULT: '#198754' },
        warning: { DEFAULT: '#ffc107' },
        danger: { DEFAULT: '#dc3545' },
        info: { DEFAULT: '#0dcaf0' }
      },
      borderRadius: {
        md: '0.5rem'
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,0.1)'
      },
      fontFamily: {
        'akira': ['Akira Expanded', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  safelist: [
    // status badges
    'bg-green-100','text-green-800',
    'bg-yellow-100','text-yellow-800',
    'bg-gray-200','text-gray-700',
    'bg-red-100','text-red-800',
    // alerts
    'bg-red-50','text-red-700','bg-green-50','text-green-700',
  ],
  plugins: [],
}

