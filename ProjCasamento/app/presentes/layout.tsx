import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EVENTO } from "@/lib/evento";

const { primeiro, segundo } = EVENTO.noivos;

/** Sem Open Graph/Twitter card — evita preview com logo no WhatsApp. */
export const metadata: Metadata = {
  title: `Lista de presentes — ${primeiro} & ${segundo}`,
  description: `Itens para o novo lar · ${EVENTO.dataFormatada}`,
};

export default function PresentesLayout({ children }: { children: ReactNode }) {
  return children;
}
