/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: {
          100: "#FFFFFF",     // White
          200: "#F5F5F5",     // Lighter shade
          300: "#F0F0F0",     // Lighter shade
          400: "#E7E7E7",     // Lighter shade
          500: "#CCCCCC",     // Regular white (#CCCCCC)
          600: "#999999",     // Darker shade
          700: "#666666",     // Darker shade
          800: "#333333",     // Darker shade
          900: "#000000",     // Black
        },
        red: {
          000: "#FFCCCC",     // Lightest shade
          100: "#FF9999",     // Lighter shade
          200: "#FF6666",     // Lighter shade
          300: "#FF3333",     // Lighter shade
          400: "#FF0000",     // Red (#FF0000)
          500: "#CC0000",     // Darker shade
          600: "#990000",     // Darker shade
          700: "#660000",     // Darker shade
          800: "#330000",     // Darker shade
          900: "#000000",     // Darkest shade
        },
        black: {
          000: "#00000000",    // Transparent black (#00000000)
          100: "#00000026",    // Lighter shade (closest to #0000004D)
          200: "#0000004D",    // Custom color #0000004D
          300: "#00000073",    // Darker shade
          400: "#00000099",    // Darker shade
          500: "#333333",      // Custom color #333333
          600: "#666666",      // Darker shade
          700: "#999999",      // Darker shade
          800: "#CCCCCC",      // Darker shade
          900: "#FFFFFF",      // White
        },
        gray: {
          000: "#FFFFFF",  // White
          100: "#FAFAFA",  // Lighter shade
          200: "#F5F5F5",  // #F5F5F5
          300: "#F0F0F0",  // Close to #F5F5F5 but slightly darker
          400: "#E7E7E7",  // Close to #CCCCCC but slightly lighter
          500: "#CCCCCC",  // #CCCCCC
          600: "#999999",  // Darker shade
          700: "#666666",  // Darker shade
          800: "#333333 !important",  // Darker shade
          900: "#000000",  // Black
        },
        blue: {
          000: "#CCCCCC",     // Lighter shade
          100: "#9999FF",     // Lighter shade
          200: "#6666FF",     // Lighter shade
          300: "#3333FF",     // Lighter shade
          400: "#0000FF",     // Blue (#0000FF) -- used earlier
          500: "#0000E5",     // Darker shade
          600: "#000099",     // Darker shade
          700: "#00004D",     // Darker shade
          800: "#000000",     // Black
          900: "#000000",     // Black (same as 800)
        },
        turquoise: {
          100: "#B5FFDF",             // Lighter shade
          200: "#82FFC7",             // Lighter shade
          300: "#4FFFAD",             // Lighter shade
          400: "#1CFF95",             // Lighter shade
          500: "#14BB88",             // Turquoise (#14BB88)
          600: "#0D8775",             // Darker shade
          700: "#065363",             // Darker shade
          800: "#003F50",             // Darker shade
          900: "#00263D",             // Darkest shade
        },
        aqua: {
          000: "#E8FFF7",     // Lightest shade
          100: "#B5FFDF",     // Lighter shade
          200: "#82FFC7",     // Lighter shade
          300: "#4FFFAD",     // Lighter shade
          400: "#1CFF95",     // Lighter shade
          500: "#14BB88",     // Aqua (#14BB88)
          600: "#0D8775",     // Darker shade
          700: "#065363",     // Darker shade
          800: "#003F50",     // Darker shade
          900: "#00263D",     // Darkest shade
        },
      },
    },
  },
  plugins: [],
};
