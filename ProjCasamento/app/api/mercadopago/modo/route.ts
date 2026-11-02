import { NextResponse } from "next/server";
import { getEventoAtual } from "@/lib/evento-atual";
import { getMpConfigEvento } from "@/lib/mercadopago-evento";

export const dynamic = "force-dynamic";

/** Indica se o cartão está disponível, modo sandbox e taxa (sem expor o token). */
export async function GET() {
  const evento = await getEventoAtual();
  const mp = evento ? getMpConfigEvento(evento) : null;
  if (!mp) {
    return NextResponse.json({ configurado: false, sandbox: false });
  }
  return NextResponse.json({
    configurado: true,
    sandbox: mp.sandbox,
    ambiente: mp.sandbox ? "teste" : "producao",
    taxa_cartao_percent: mp.taxaPercent,
  });
}
