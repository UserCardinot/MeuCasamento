import type { Metadata } from "next";
import { Cinzel, Fredoka, Italianno, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { getEventoAtual } from "@/lib/evento-atual";
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

/** Tema Mickey — títulos arredondados e divertidos */
const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-mickey-display",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const evento = await getEventoAtual().catch(() => null);
  const titulo = evento?.titulo || evento?.anfitrioes || "Convite";
  return {
    title: titulo,
    description: "Confirmação de presença, lista de presentes e recados.",
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const evento = await getEventoAtual().catch(() => null);
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${playfair.variable} ${jakarta.variable} ${cinzelInvite.variable} ${italiannoInvite.variable} ${fredoka.variable}`}
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
        data-tema={evento?.tema || "oliva"}
        className="font-sans antialiased min-h-screen bg-[#FAFAFA] text-stone-800"
      >
        {children}
      </body>
    </html>
  );
}
