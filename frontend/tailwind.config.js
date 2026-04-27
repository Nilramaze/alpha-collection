/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand': {
          50:  '#f0eeff',
          100: '#d9ccff',
          200: '#8b6bff',
          300: '#3b06fe',
          400: '#2f05d4',
          500: '#2304a8',
          600: '#190380',
          700: '#11025a',
          800: '#090135',
          900: '#040019',
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
