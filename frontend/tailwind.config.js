/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef4ff",
          100: "#dbe6ff",
          500: "#3b6bff",
          600: "#2e54e8",
          700: "#2543c2",
        },
      },
    },
  },
  plugins: [],
};
