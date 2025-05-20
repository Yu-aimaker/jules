import type { Config } from "tailwindcss";
const { fontFamily } = require('tailwindcss/defaultTheme');

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', ...fontFamily.sans],
      },
      colors: {
        primary: {
          light: '#60A5FA', // blue-400
          DEFAULT: '#3B82F6', // blue-500
          dark: '#2563EB',  // blue-600
        },
        secondary: {
          light: '#34D399', // green-400
          DEFAULT: '#10B981', // green-500
          dark: '#059669',  // green-600
        },
        neutral: {
          100: '#F3F4F6', // gray-100
          200: '#E5E7EB', // gray-200
          300: '#D1D5DB', // gray-300
          700: '#374151', // gray-700
          800: '#1F2937', // gray-800
          900: '#111827', // gray-900
        },
        board: '#047857', // emerald-700 (盤面の緑)
        'board-hover': '#059669', // emerald-600
        piece: {
          black: '#1A202C', // 濃いめのグレー/黒
          white: '#F7FAFC', // 明るい白
          shadow: 'rgba(0,0,0,0.2)',
        }
      },
    },
  },
  plugins: [],
};
export default config;
