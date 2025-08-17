import typography from "@tailwindcss/typography";
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Fira Mono", "monospace"]
      },
      fontSize: {
        base: '8px'
      }
    },
  },
  plugins: [
    typography
  ],
};
