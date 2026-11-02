import type { Metadata } from "next";
import type { ReactNode } from "react";
import { baseUrlDoEvento, getEventoAtual, toEventoPublico } from "@/lib/evento-atual";
import { getConviteOpenGraphDescription, getConviteOpenGraphTitle } from "@/lib/convite-whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const ev = await getEventoAtual();
  if (!ev) return { title: "Convite" };
  const evento = toEventoPublico(ev);
  const base = baseUrlDoEvento(ev);
  const title = getConviteOpenGraphTitle(evento);
  const description = getConviteOpenGraphDescription(evento);
  const ogImage = `${base}/convite/og.png`;

  return {
    metadataBase: new URL(base),
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "pt_BR",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ConviteLayout({ children }: { children: ReactNode }) {
  return children;
}
