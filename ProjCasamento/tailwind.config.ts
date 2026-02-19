import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "Georgia", "serif"],
      },
      colors: {
        casamento: {
          verde: "#84B067",
          creme: "#F7E6CA",
          sage: "#dde6d5",
          white: "#FAFAFA",
        },
      },
    },
  },
  plugins: [],
};

export default config;
