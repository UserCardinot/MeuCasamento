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
      suppressHydrationWarning
      className={`${playfair.variable} ${jakarta.variable} ${cinzelInvite.variable} ${italiannoInvite.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Luxurious Script: não exposto em next/font nesta versão; carregamento estável no <head>. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Luxurious+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased min-h-screen bg-[#FAFAFA] text-stone-800"
      >
        {children}
      </body>
    </html>
  );
}
