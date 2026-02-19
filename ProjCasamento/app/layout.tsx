import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
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
    <html lang="pt-BR" className={`${cormorant.variable} ${sourceSans.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-casamento-white text-stone-800">
        {children}
      </body>
    </html>
  );
}
