const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      //colors: {
        //primary: "#ad53a6",
        //secondary: "#502779",
      //},
      //fontFamily: {
        //sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      //},
    },
  },
  plugins: [],
};
