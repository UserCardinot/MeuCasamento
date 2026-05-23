import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPublicSiteBaseUrl } from "@/lib/mercadopago-shared";
import { getConviteOpenGraphDescription, getConviteOpenGraphTitle } from "@/lib/convite-whatsapp";

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteBaseUrl()),
  title: getConviteOpenGraphTitle(),
  description: getConviteOpenGraphDescription(),
  openGraph: {
    title: getConviteOpenGraphTitle(),
    description: getConviteOpenGraphDescription(),
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/convite/opengraph-image",
        width: 1200,
        height: 630,
        alt: getConviteOpenGraphTitle(),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: getConviteOpenGraphTitle(),
    description: getConviteOpenGraphDescription(),
  },
};

export default function ConviteLayout({ children }: { children: ReactNode }) {
  return children;
}
