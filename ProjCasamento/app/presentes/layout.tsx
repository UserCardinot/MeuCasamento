import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EVENTO } from "@/lib/evento";
import { getConviteOgImageAbsoluteUrl } from "@/lib/convite-og-urls";
import { getPublicSiteBaseUrl } from "@/lib/mercadopago-shared";

const { primeiro, segundo } = EVENTO.noivos;
const title = `Lista de presentes — ${primeiro} & ${segundo}`;
const description = `Itens para o novo lar · ${EVENTO.dataFormatada}`;
const ogImage = getConviteOgImageAbsoluteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteBaseUrl()),
  title,
  description,
  openGraph: {
    title,
    description,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${primeiro} & ${segundo}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function PresentesLayout({ children }: { children: ReactNode }) {
  return children;
}
