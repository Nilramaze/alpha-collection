/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand': {
          50:  '#f0e6ff',
          100: '#d9c0ff',
          200: '#b47cff',
          300: '#8a3fff',
          400: '#6e17f5',
          500: '#5500ec',
          600: '#4400be',
          700: '#33008f',
          800: '#220060',
          900: '#110030',
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
