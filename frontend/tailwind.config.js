/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand': {
          50:  '#ebebff',
          100: '#c5c5ff',
          200: '#6b6bdd',
          300: '#2b2bbb',
          400: '#10109f',
          500: '#00008b',
          600: '#000077',
          700: '#000060',
          800: '#000040',
          900: '#000025',
        },
        'surface': {
          DEFAULT: '#f6f6f6',
          low: '#f0f1f1',
          high: '#e1e3e3',
          highest: '#dbdddd',
          container: '#e7e8e8',
          bright: '#f6f6f6',
          white: '#ffffff',
          dim: '#d2d5d5',
        },
        'ink': {
          DEFAULT: '#2d2f2f',
          variant: '#5a5c5c',
          outline: '#757777',
          faint: '#acadad',
        },
      },
      fontFamily: {
        'headline': ['Manrope', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
