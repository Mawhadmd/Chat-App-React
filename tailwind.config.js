/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
 borderColor:{
        BorderColor: '#3A3F00',
      },
      backgroundImage:{
        ChatAreaBG: "url(src/assets/blackbackground.jpg)",
      },

      colors:{
        MainBlack: '#363732',
        MainSky: '#53D8FB',
        MainBlue:'#66C3FF',
        MainPinkishWhite: '#DCE1E9',
        Mainpink: '#D4AFB9',
      }
      
    },
  },
  plugins: [],
}

