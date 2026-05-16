import { NextResponse } from "next/server";
import {
  mercadoPagoCollectorIdFromAccessToken,
  shouldUseMercadoPagoSandbox,
} from "@/lib/mercadopago-shared";

export const dynamic = "force-dynamic";

/** Indica modo sandbox e ID do vendedor (sem expor o token). */
export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json({ configurado: false, sandbox: false });
  }

  const sandbox = shouldUseMercadoPagoSandbox(accessToken);
  const collector_id = mercadoPagoCollectorIdFromAccessToken(accessToken);
  const esperadoProducao = process.env.MERCADOPAGO_PRODUCAO_COLLECTOR_ID?.trim() || null;

  let aviso: string | null = null;
  if (!sandbox && collector_id && esperadoProducao && collector_id !== esperadoProducao) {
    aviso =
      "O Access Token no servidor parece ser de TESTE (vendedor " +
      collector_id +
      "). Para pagamentos reais, use o token de PRODUÇÃO (vendedor " +
      esperadoProducao +
      ") no Vercel.";
  }

  return NextResponse.json({
    configurado: true,
    sandbox,
    collector_id,
    ambiente: sandbox ? "teste" : "producao",
    ...(aviso ? { aviso } : {}),
  });
}
