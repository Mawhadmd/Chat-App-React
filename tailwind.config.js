/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderColor: {
        BorderColor: "#3A3F00",
      },
      backgroundImage: {
        ChatAreaBG: "url(src/assets/blackbackground.png)",
      },

      colors: {
        MainBlack: "var(--MainBlack)",
        MainSky: "var(--MainBlue)",
        MainBlue: " var(--MainSky)",
        MainPinkishWhite: "var(--MainPinkishWhite)",
        Mainpink: "var(--Mainpink)",
      },
    },
  },
  plugins: [],
};
