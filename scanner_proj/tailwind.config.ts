module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4682B4',
        secondary: '#FEBD2F',
        success: '#08C400',
        warning: '#EF0000',
        accent: '#FEBD2F',
        darkBackground: '#002850',
        darkPaper: '#1F3A5E',
        darkText: '#FFFAFA',
        darkSecondaryText: '#F4F4F4',
      },
    },
  },
  plugins: [],
};