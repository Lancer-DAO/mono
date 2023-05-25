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
        'red': "#FF0000",
        "black-300": "#0000004D",
        'f5f5f5': "#f5f5f5",
        '555': "#555555",
        'fff': "#FFFFFF",
        'ccc': "#CCCCCC",
        "translucent-black": '#33333333',
        '14bb88': '#14bb88'
      },
    },
  },
  plugins: [],
};
