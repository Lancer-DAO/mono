// @ts-check
const { withUt } = require("uploadthing/tw");

module.exports = withUt({
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
        // neutrals
        neutral100: "#F7FAF9",
        neutral200: "#EDF2F1",
        neutral300: "#B8CCC6",
        neutral400: "#A1B2AD",
        neutral500: "#73807C",
        neutral600: "#2E3332",

        // neutralBorders
        neutralBorder500: "#F4F6FA",

        // primary
        primary100: "#E1FAF2",
        primary200: "#14BB88",
        primary300: "#033324",

        // secondary
        secondary100: "#EDF0FA",
        secondary200: "#6B7699",
        secondary300: "#262F4D",

        // tertiary
        tertiary100: "#FAEDF6",
        tertiary200: "#CC7AB2",
        tertiary300: "#803367",

        // success
        success: "#6BB274",
        successBg: "#DCF5DF",

        // warning
        warning: "#F46036",
        warningBg: "#FAEBE1",

        // error
        error: "#F5364F",
        errorBg: "#F5C4CA",

        // noble
        noble100: "#7991E8",

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
      boxShadow: {
        'black-100': '0px 0.67524px 1.35048px 0px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
});
