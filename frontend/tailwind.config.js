/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9fa',
          100: '#d7f0f1',
          200: '#b9d9d6', // Muted Aqua
          300: '#7bc3c0',
          400: '#3aa5a3',
          500: '#087E83', // Deep Ocean Teal
          600: '#06676c',
          700: '#055256',
          800: '#064246',
          900: '#08373b',
        },
        marine: {
          50: '#f0f7fb',
          100: '#dcecf5',
          200: '#bddbeb',
          300: '#8ec2dc',
          400: '#53a2c7',
          500: '#176B91', // Refined Marine Blue
          600: '#135575',
          700: '#11445e',
          800: '#10394e',
          900: '#113042',
        },
        emeraldAccent: {
          400: '#2ec5ad',
          500: '#159B86', // Emerald Accent
          600: '#0e7c6c',
        },
        coral: {
          400: '#e59d87',
          500: '#D98368', // Warm Coral
          600: '#bf674e',
        },
        slateText: {
          400: '#4b6b80',
          500: '#365163',
          600: '#263B49', // Slate Text
          700: '#1c2c37',
          800: '#131e26',
        },
        warmNeutral: '#F0EDE6',
        softSand: '#E8DDD0',
        mutedAqua: '#B9D9D6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(8, 126, 131, 0.08), 0 4px 6px -2px rgba(8, 126, 131, 0.04)',
        'card': '0 4px 20px -2px rgba(23, 107, 145, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px -4px rgba(8, 126, 131, 0.12), 0 4px 10px -2px rgba(23, 107, 145, 0.06)',
      }
    },
  },
  plugins: [],
}
