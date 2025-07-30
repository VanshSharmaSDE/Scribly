/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scribly-black': '#0a0a0a',
        'scribly-gray': '#1a1a1a',
        'scribly-gray-light': '#2a2a2a',
        'scribly-gray-dark': '#151515',
        // Professional premium colors
        'premium-blue': '#1e293b',
        'premium-blue-light': '#334155',
        'premium-blue-dark': '#0f172a',
        'premium-purple': '#1e1b4b',
        'premium-purple-light': '#312e81',
        'premium-purple-dark': '#0f0f23',
        'premium-teal': '#134e4a',
        'premium-teal-light': '#0f766e',
        'premium-teal-dark': '#042f2e',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }
    },
  },
  plugins: [],
}
