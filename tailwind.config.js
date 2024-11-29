/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        MainBlack: "rgba(var(--MainBlack))",
        MainSky: "rgba(var(--MainBlue))",
        MainBlue: " rgba(var(--MainSky))",
        MainPinkishWhite: "rgba(var(--MainPinkishWhite))",
        Mainpink: "rgba(var(--Mainpink))",
      },
    },
  },
  plugins: [],
};
