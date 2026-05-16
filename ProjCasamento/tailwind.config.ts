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
        admin: ["var(--font-admin-sans)", "system-ui", "sans-serif"],
        "admin-heading": ["var(--font-admin-serif)", "Georgia", "serif"],
        "invite-caps": ["var(--font-invite-caps)", "Cinzel", "Georgia", "serif"],
        "invite-script": ["var(--font-invite-script)", "cursive"],
        "noivos-script": ['"Luxurious Script"', "cursive"],
      },
      colors: {
        invite: {
          olive: "#4B5320",
          /** Papel do convite — off-white quente, levemente mais “papel” que branco puro */
          cream: "#F0EBE1",
        },
        casamento: {
          "oliva-escuro": "#4A5D3A",
          oliva: "#5A6B4A",
          sage: "#8B9B7A",
          "sage-claro": "#B8C4A8",
          pastel: "#D4DFC7",
          creme: "#F5F2EB",
          white: "#FDFCFA",
          dourado: "#B8860B",
          verde: "#5A6B4A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
