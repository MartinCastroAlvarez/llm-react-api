/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Carbon Gray
        gray: {
          10: '#f4f4f4',
          20: '#e0e0e0',
          30: '#c6c6c6',
          40: '#a8a8a8',
          50: '#8d8d8d',
          60: '#6f6f6f',
          70: '#525252',
          80: '#393939',
          90: '#262626',
          100: '#161616',
        },
        // Carbon Blue
        blue: {
          10: '#edf5ff',
          20: '#d0e2ff',
          30: '#a6c8ff',
          40: '#78a9ff',
          50: '#4589ff',
          60: '#0f62fe',
          70: '#0043ce',
          80: '#002d9c',
          90: '#001d6c',
          100: '#001141',
        },
        // Carbon Green
        green: {
          10: '#defbe6',
          20: '#a7f0ba',
          30: '#6fdc8c',
          40: '#42be65',
          50: '#24a148',
          60: '#198038',
          70: '#0e6027',
          80: '#044317',
          90: '#022d0d',
          100: '#071908',
        },
        // Carbon Purple
        purple: {
          10: '#f6f2ff',
          20: '#e8daff',
          30: '#d4bbff',
          40: '#be95ff',
          50: '#a56eff',
          60: '#8a3ffc',
          70: '#6929c4',
          80: '#491d8b',
          90: '#31135e',
          100: '#1c0f30',
        },
        // Carbon Red
        red: {
          10: '#fff1f1',
          20: '#ffd7d9',
          30: '#ffb3b8',
          40: '#ff8389',
          50: '#fa4d56',
          60: '#da1e28',
          70: '#a2191f',
          80: '#750e13',
          90: '#520408',
          100: '#2d0709',
        },
      },
    },
  },
  plugins: [],
};
