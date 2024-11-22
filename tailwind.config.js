/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor:{
        Main: '#D9D9D9',
      },borderColor:{
        
        BorderColor: '#3A3F00',
      }
    },
  },
  plugins: [],
}

