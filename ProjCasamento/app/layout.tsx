import type { Metadata } from "next";
import { Cinzel, Italianno, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const cinzelInvite = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-invite-caps",
});

/** Nomes dos noivos no convite — caligrafia elegante, boa leitura em telas pequenas */
const italiannoInvite = Italianno({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-invite-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Casamento Lucas & Beatriz",
  description: "Nosso dia especial – convite, confirmação e presentes",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${jakarta.variable} ${cinzelInvite.variable} ${italiannoInvite.variable}`}
    >
      <body className="font-sans antialiased min-h-screen bg-[#FAFAFA] text-stone-800">
        {children}
      </body>
    </html>
  );
}
