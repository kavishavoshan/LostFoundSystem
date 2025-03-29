//** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}" // important!
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6500",
        secondary: "#1E3E62",
        darkBlue: "#0B192C",
        black: "#000000",
      },
    },
  },
  plugins: [],
};
