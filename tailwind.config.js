/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6f3643ff', // Light Pink
        secondary: '#d5838fff', // Light Pink
        accent: '#FF8FAB', // Pink
        'base-100': '#FFF0F5', // Lavender Blush
        'base-200': '#FFE4E1', // Misty Rose
        'base-300': '#F8C8DC', // Pink Lace
        'text-primary': '#6D284B', // Muted Raspberry
        'text-secondary': '#8B5F6D', // Rose Dust
      },
      keyframes: {
        'button-press': {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(0.95)',
          },
        },
      },
      animation: {
        'button-press': 'button-press 0.2s ease-in-out',
      },
    },
  },
  plugins: [],
};
