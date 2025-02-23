/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/Main/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        Main: "rgba(var(--Main))",
        actionColor: "rgba(var(--actionColor))",
        Secondary: "rgba(var(--Secondary))",
        MainBlackfr: "rgba(var(--MainBlackfr))",
        MainText: "rgba(var(--MainText))",
      },
    },
  },
  plugins: [],
};
