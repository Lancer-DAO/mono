/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components/**/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgLancer: "#F7FAF7",
        bgLancerSecondary: "#77CF6D",
        bgClient: "#FDF9FF",
        bgClientSecondary: "#F4EAF8",
        primaryBtn: "#D4FFD7",
        primaryBtnBorder: "#C5FFBA",
        secondaryBtn: "#FFD4D4",
        secondaryBtnBorder: "#FFBABA",
        neutralBtn: "#FEFEFE",
        neutralBtnBorder: "#E4E4E4",
        textPrimary: "#464646",
        textLancerGreen: "#56B78A",
        textGreen: "#638463",
        textRed: "#846363",
        industryRed: "#FF8484",
        industryRedBorder: "#B81616",
        industryGreen: "#B2FF84",
        industryGreenBorder: "#40B816",
        industryBlue: "#83E4FF",
        industryBlueBorder: "#5B9FB3",
        industryOther: "#C5C5C5",
        industryOtherBorder: "#DADADA",
      },
      fontFamily: {
        base: ["charter", "Helvetica", "Arial", "sans-serif"],
        bold: ["charter-bold", "Helvetica", "Arial", "sans-serif"],
        italic: ["charter-italic", "Helvetica", "Arial", "sans-serif"],
        boldItalic: ["charter-bold-italic", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
