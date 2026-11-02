import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getEventoAtual } from "@/lib/evento-atual";

/** Sem Open Graph/Twitter card — evita preview com imagem no WhatsApp. */
export async function generateMetadata(): Promise<Metadata> {
  const ev = await getEventoAtual();
  const nome = ev?.anfitrioes || ev?.titulo || "";
  return {
    title: nome ? `Lista de presentes — ${nome}` : "Lista de presentes",
  };
}

export default function PresentesLayout({ children }: { children: ReactNode }) {
  return children;
}
