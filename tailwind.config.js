/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080b12",
        panel: "#111722",
        line: "#263142",
        pulse: "#65e3ff",
        muted: "#9aa8bb"
      },
      boxShadow: {
        glow: "0 0 45px rgba(101, 227, 255, .12)"
      }
    },
  },
  plugins: [],
}
