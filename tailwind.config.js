/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C5A572',
        secondary: '#1A2F25',
        accent: '#8B7355',
        background: '#0A1512',
        surface: '#142420',
        text: '#E5DED5',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'gradient-elegant': 'linear-gradient(145deg, rgba(197, 165, 114, 0.1), rgba(26, 47, 37, 0.1))',
      },
    },
  },
  plugins: [],
};
