/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
        diphylleia: ['Diphylleia', 'serif'],
      },
      colors: {
        dark: {
          bg: {
            primary: '#0f0f0f',
            secondary: '#1a1a1a',
            tertiary: '#262626',
          },
          text: {
            primary: '#e5e5e5',
            secondary: '#a3a3a3',
            tertiary: '#737373',
          },
          border: {
            primary: '#262626',
            secondary: '#1f1f1f',
          }
        }
      },
    },
  },
  plugins: [],
}
