/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#f0fdf0',
          100: '#d3ffc1',
          200: '#8eff71',
          300: '#2ff801',
          400: '#2be800',
          500: '#0f6b00',
          600: '#0d6200',
          700: '#0b5800',
          800: '#064200',
          900: '#042e00',
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
